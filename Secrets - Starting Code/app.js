require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();

app.use(express.static('public'));
app.set('view engine' ,'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set('useCreateIndex', true);


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets', passport.authenticate('google', {failureRedirect: '/login'}), (req, res) => {
    res.redirect('/secrets');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});


app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()){
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});


app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.post('/register', (req, res) => {
    //
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    //
    //     newUser.save((err) => {
    //         if(err) {
    //             console.log(err);
    //         } else {
    //             res.render('secrets');
    //         }
    //     });
    // });

    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res,() => {
                res.redirect('/secrets')
            });
        }
    });

});


app.post('/login', (req, res) => {
    // const username = req.body.username;
    //
    // User.findOne({email: username}, (err, result) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //
    //         if(result) {
    //             bcrypt.compare(req.body.password, result.password, function(err, correct) {
    //                 if (correct){
    //                     res.render('secrets');
    //                     console.log(result);
    //                 } else {
    //                     res.send("Incorrect username or password");
    //                 }
    //             });
    //         } else {
    //             res.send("Incorrect username or password");
    //         }
    //     }
    // });

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, ()=> {
                res.redirect('/secrets');
            });
        }
    });


});









app.listen('3000', ()=> {
    console.log('Successfully connected to server on port 3000');
});
