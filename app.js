require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const findOrCreate = require('mongoose-findorcreate')


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "This is a secret",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/TigerTixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const UserSchema = {
  userName: String,
  firstName: String,
  lastName: String,
  password: String
}

// UserSchema.plugin(passportLocalMongoose);
// UserSchema.plugin(findOrCreate);

const User = mongoose.model('User', UserSchema);

// passport.use(User.createStrategy());

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
  done(null, user.id); 
 // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
      done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/TigerTix"
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile)
  User.findOne({
    'google.id' : profile.id 
}, function(err, user) {
    if (err) {
        return done(err);
    }
    //No user was found... so create a new user with values from Google (all the profile. stuff)
    if (!user) {
        user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            provider: 'google',
            //now in the future searching on User.findOne({'google.id': profile.id } will match because of this next line
            google: profile._json
        });
        user.save(function(err) {
            if (err) console.log(err);
            return done(err, user);
        });
    } else {
        //found user. Return
        return done(err, user);
    }
});
  
}
));

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/auth/google',
  passport.authenticate("google", { scope: ["profile"] })
);

app.get('/auth/google/TigerTix', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/viewEvent');
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

app.get('/events', (req, res) => {
  res.render("events");
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