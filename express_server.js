var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080; //8080 is the default port
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}))
app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": {
    longurl: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
  },
  "9sm5xK": {
    longurl: "http://www.google.com",
    userID: 'user2RandomID'
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

app.get('/', (req, res) =>{
  if(req.session.user_id){
    res.redirect("urls");
  }else{
  res.redirect('/login');
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: req.session.user_id,
    userInfo: users[req.session.user_id]
  };
  if(req.session.user_id){
    res.render("urls_new", templateVars);
  }else{
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.session.user_id,
    userInfo: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get("/login", (req, res) => {
  if(!req.session.user_id){
  let templateVars = {
    user: req.session.user_id,
    userInfo: users[req.session.user_id]
  };
    res.render('login', templateVars);
  }else{
    res.redirect('/urls');
  }
});

app.get("/urls/:id", (req, res) =>{
  if(req.session.user_id === urlDatabase[req.params.id].userID){
    let templateVars = {
      shortURL: req.params.id,
      urls: urlDatabase,
      user: req.session.user_id,
      userInfo: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longurl)
});

app.get("/register", (req, res) => {
  if(!req.session.user_id){
  let templateVars = {
    user: req.session.user_id,
    userInfo: users[req.session.user_id]
  };
    res.render('register', templateVars);
  }else{
    res.redirect('/urls');
  }
});

//randomly generates a new short url and stores it in urldatabase then redirects to new created page for shorturl
app.post("/urls", (req, res) =>{
  if(req.session.user_id){
    let  newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {
      longurl: Object.values(req.body)[0],
      userID: req.session.user_id
    };
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.redirect('/urls');
  }
});

//updates long url to new long url from user
app.post("/urls/:id", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.id].userID){
    urlDatabase[req.params.id].longurl = Object.values(req.body)[0];
  }
  res.redirect('/urls');
});

//checks if the login info matches the stored user info
app.post("/login", (req, res) => {
  let emailNotFound = false;
  for(user in users){
    if(users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)){
      req.session.user_id = user; //creates a cookie with userid on it
      res.redirect('/urls');
      return;
    }
  };
  //this makes sure the above loop is run first and doesn't prematurely send the 403 status code
  emailNotFound = true;
  if(emailNotFound){
    res.statusCode = 403;
    res.end();
  };
});

//deletes login cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//removes short url from urldatabase
app.post("/urls/:id/delete", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.id].userID){
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

//creates a new user id
app.post("/register", (req, res) => {
  for(user in users){
    if(users[user].email === req.body.email){
      res.statusCode = 400;
      res.end();
    }
  }
  if(!req.body.email || !req.body.password){
    res.statusCode = 400;
    res.end();
  }else{
    //hashes the password then saves the hashed password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    let newID = generateRandomString();
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = newID; //creates a cookie with userid on it
    res.redirect('/urls');
  }
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

