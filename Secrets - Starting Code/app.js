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
    email: "String",
    password: "String"
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
    res.render('home');
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
