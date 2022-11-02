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
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  }
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  let cookie = req.body.username;
  console.log(cookie);
  res.cookie("username", cookie);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    user_id: req.cookies["user_id"]
  }
  res.render("registration", templateVars)
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
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

app.post("/urls", (req, res) => {
  // console.log(req.body); //log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars)
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.updatedURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
