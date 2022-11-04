const express = require("express");
const morgan = require("morgan");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const methodOverride = require("method-override");
const app = express();
const PORT = 8000;

app.set("view engine", "ejs");

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey'],
}));
app.use(morgan("dev"));

app.use(methodOverride("_method"));
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "bJ48lW",
  },
};

//helper.js modules
const { generateRandomString } = require('./helpers');
const { getUserByEmail } = require('./helpers');
const { urlsForUser } = require('./helpers');

//Home
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    users,
    user_id: req.session.user_id,
    noUser: true,
    wrongMsg: false
  };

  if (req.session.user_id === undefined) {
    templateVars["noUser"] === false;
    res.render("login", templateVars);
    return;
  }

  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Get new urls
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    users,
    user_id: req.session.user_id
  };
  res.render("urls_new", templateVars);
});

// Login
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    users,
    noUser: false,
    wrongMsg: false
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (getUserByEmail(userEmail, users)) {
    const getUser = getUserByEmail(userEmail, users);
    if (bcrypt.compareSync(userPassword, getUser.password)) {
      req.session.user_id = getUser.id;
      res.redirect('/urls');
      return;
    }
  }

  const templateVars = {
    user_id: req.session.user_id,
    users,
    noUser: false,
    wrongMsg: true
  };

  res.status(403);
  res.render("login", templateVars);
  return;
});

//logout
app.delete("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//Register
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    users
  };
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }

  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  const randomID = generateRandomString();

  if (getUserByEmail(userEmail, users)) {
    res.status(400);
    res.send(`status code: ${res.statusCode} email already in use`);
    return;
  }
  if (!userEmail|| !userPassword) {
    res.status(400);
    res.send(`status code: ${res.statusCode} You must <a href= '/register'> register </a> with a valid Email and password`);
    return;
  }
//---------------------
  users[randomID] = {
    id: randomID,
    email: userEmail,
    password: hashedPassword
  };
  req.session.user_id = users[randomID].id;
  res.redirect("/urls");
});

//Generating shortURL
app.post("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
    return;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

//Direct shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  if (longURL === undefined) {
    res.status(404);
    res.send("Page not found");
    return;
  }
  res.redirect(longURL);
});

//Get new shortURL page (urls_show)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    users,
    user_id: req.session.user_id
  };
  res.render("urls_show", templateVars);
});

//Edit longURL
app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.updatedURL;
  urlDatabase[req.params.shortURL]["longURL"] = longURL;
  res.redirect(`/urls`);
});

//Delete
app.delete("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
    return;
  }
  res.status(401);
  res.send("Page not found");
});

app.get("*", (req, res) => {
  res.send("Page not found");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

