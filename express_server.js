var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080; //8080 is the default port
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let urlList = { urls: urlDatabase };
  res.render('urls_index', urlList);
});

app.post("/urls", (req, res) =>{
  let  newShortURL = generateRandomString();
  urlDatabase[newShortURL] = Object.values(req.body)[0];
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/:id", (req, res) =>{
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = Object.values(req.body)[0];
  res.redirect('/urls');
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});