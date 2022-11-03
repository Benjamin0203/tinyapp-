const express = require("express");
const morgan = require("morgan");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8000;

app.set("view engine", "ejs");

//middleware
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey'],
}))
app.use(morgan("dev"));


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
    userID: "aJ48lW",
  },
};

//Function: generate random string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//Function: check if the key exists in users
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
}

//Function: returns the URLs where the userID is qual to the id of the currently logged-in user
const urlsForUser = id => {
  let result = {};
  for (let el in urlDatabase) {
    if (urlDatabase[el].userID === id) {
      result[el] = urlDatabase[el];
    }
  }
  return result;
};

//Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Change
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlsForUser(req.session.user_id),
    users,
    user_id: req.session.user_id,
    noUser: true,
    wrongMsg: false
  }

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
  }
  res.render("urls_new", templateVars);
});


// Login
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    users,
    noUser: false,
    wrongMsg: false
  }
  res.render("login", templateVars)
})

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
  }

  res.status(403)
  res.render("login", templateVars)
  return;
});

//logout
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/login");
});

//Register
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    users
  }
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }

  res.render("registration", templateVars)
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  const randomID = generateRandomString();

  if (getUserByEmail(userEmail, users)) {
    res.status(400)
    res.send(`status code: ${res.statusCode} email already in use`);
    return;
  }
  if (userEmail.length < 1 || userPassword.length < 1) {
    res.status(400)
    res.send(`status code: ${res.statusCode} You must register with a valid Email and password`);
    return;
  }

  users[randomID] = {
    id: randomID,
    email: userEmail,
    password: hashedPassword
  }
  // res.cookie("user_id", users[randomID].id);
  req.session.user_id = users[randomID].id;
  res.redirect("/urls");
})

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
  }
  res.redirect(`/urls/${shortURL}`);
});

//Direct shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  if (longURL === undefined) {
    res.status(404);
    res.send("Error: No Access");
    return;
  }
  res.redirect(longURL);
});

//Get new shortURL page (urls_show)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]["longURL"],  
    users, user_id: req.session.user_id};
  res.render("urls_show", templateVars)
});

//Edit longURL
app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.updatedURL;
  urlDatabase[req.params.shortURL]["longURL"] = longURL;
  res.redirect(`/urls`);
});

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
    return;
  }
  res.status(401);
  res.send("Error: No Access")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//change