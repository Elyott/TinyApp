var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080; //8080 is the default port
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser())


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.set('view engine', 'ejs');

app.get('/', (req, res) =>{
  res.end('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.cookies['user_id'] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies['user_id']
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) =>{
  let  newShortURL = generateRandomString();
  urlDatabase[newShortURL] = Object.values(req.body)[0];
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/:id", (req, res) =>{
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user: req.cookies['user_id']
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = Object.values(req.body)[0];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.cookies['user_id'] };
  res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: req.cookies['user_id'] };
  res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  for(user in users){
    if(users[user].email === req.body.email && users[user].password === req.body.password){
      res.cookie('user_id', user);
      res.redirect('/urls')
    };
  };
  res.statusCode = 403;
  res.end();
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls")
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  if(req.body.email === '' || req.body.password === ''){
    res.statusCode = 400;
    res.end();
  } else{
  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', newID);
  console.log(users);
  res.redirect('/urls');
  }
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

