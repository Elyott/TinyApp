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
  let templateVars = { user: req.session.user_id };
  if(req.session.user_id){
    res.render("urls_new", templateVars);
  }else{
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.session.user_id
  };
  res.render('urls_index', templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: req.session.user_id };
  res.render('login', templateVars);
});

app.get("/urls/:id", (req, res) =>{
  if(req.session.user_id === urlDatabase[req.params.id].userID){
    let templateVars = {
      shortURL: req.params.id,
      urls: urlDatabase,
      user: req.session.user_id
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
  let templateVars = { user: req.session.user_id };
  res.render('register', templateVars);
});

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
  };
});

app.post("/urls/:id", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.id].userID){
    urlDatabase[req.params.id].longurl = Object.values(req.body)[0];
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  for(user in users){
    if(users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)){
      req.session.user_id = user;
      res.redirect('/urls')
    };
  };
  res.statusCode = 403;
  res.end();
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
});

app.post("/urls/:id/delete", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.id].userID){
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  if(!req.body.email || !req.body.password){
    res.statusCode = 400;
    res.end();
  } else{
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  };
  console.log(users);
  req.session.user_id = newID;
  res.redirect('/urls');
  }
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

