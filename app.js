const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/TigerTixDB")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const UserSchema = {
  userName: String,
  firstName: String,
  lastName: String,
  password: String
}

const User = mongoose.model('User', UserSchema);

app.get('/', (req, res) => {
    res.render("home");
});


app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/login", (req, res) => {
  res.render("login");
})

app.get('/successRegister', (req, res) => {
  res.render("successRegister");
});

app.get('/successEvent', (req, res) => {
  res.render("successEvent");
});

app.get('/event', (req, res) => {
  res.render("event");
  // add validation and redirect to the event
});

app.get('/viewEvent', (req, res) => {
  res.render("viewEvent");
});

app.post("/register", (req, res) => {
    
    const user = new User ({
        userName: req.body.userName,
        firstName: req.body.fName,
        lastName: req.body.lName,
        password: req.body.password
    })

      user.save(err => {
        if (err) console.log("error adding new user")
        else res.redirect("/successRegister");
      });
})

app.post("/login", (req, res) => {
    
    email = req.body.userName,
    pswd = req.body.password

    User.findOne({userName: email}, (err, foundUser) => {
      if (foundUser.password === pswd){
        res.redirect("/events");
      }
      else {
        res.redirect("/login")
        console.log("error adding new user");
      }
    })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});