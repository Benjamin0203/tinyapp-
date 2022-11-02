const express = require("express");
const app = express();
const PORT = 8000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Function: generate random string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//Function: check if the key exists in users
const checkUserKey = (key, variable) => {
  for (let user in users) {
    if (users[user][key] === variable) {
      return true;
    }
  }
  return false;
}
//Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
    users,
    user_id: req.cookies["user_id"]
  }
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    users,
    user_id: req.cookies["user_id"]
    
  }
  res.render("urls_new", templateVars);
});

// Login
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    users
  }
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  for (let user in users) {
    if (checkUserKey("email", userEmail) && checkUserKey("password", userPassword)) {
      res.cookie("user_id", users[user].id);
      res.redirect("/urls");
    }
  }

  res.status(403)
  res.send(`status code: ${res.statusCode} Incorrect Email or password`);
  return;
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Register
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    user_id: req.cookies["user_id"],
    users
  }
  res.render("registration", templateVars)
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (checkUserKey("email", userEmail)) {
    res.status(400)
    res.send(`status code: ${res.statusCode} email already in use`);
    return;
  }
  if (userEmail.length < 1 || userPassword.length < 1) {
    res.status(400)
    res.send(`status code: ${res.statusCode} You must register with a valid Email and password`);
    return;
  }
  

  const randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: userEmail,
    password: userPassword
  }
  res.cookie("user_id", users[randomID].id);
  console.log(users);
  res.redirect("/urls");
})

//Generating long url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"], users, user_id: req.cookies["user_id"]};
  res.render("urls_show", templateVars)
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.updatedURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect("/urls");
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
