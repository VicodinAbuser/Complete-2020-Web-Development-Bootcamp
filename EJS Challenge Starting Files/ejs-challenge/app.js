require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require('lodash');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Daily journal is blogging site where you can post your blogs publicly for the world to see. What makes it different from most other blogging sites though, is that apart from posting public blogs you can use it as a personal diary as well. Yes you read it right! All you need to do is select your posts to be private while creating them and voila! You have a personal journal entry! Hope you have a good time on Daily Journal.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
// const posts = [];

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/blogDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
mongoose.set('useCreateIndex', true);


const postSchema = new mongoose.Schema({
    title: String,
    post: String,
    public: Boolean
});

const Post = mongoose.model('Post', postSchema);


const usersSchema = new mongoose.Schema({
    email: String,
    password: String,
    posts: [postSchema]
});

usersSchema.plugin(passportLocalMongoose);
usersSchema.plugin(findOrCreate);

const User = mongoose.model('User', usersSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get('/', (req, res) => {
    Post.find({public: true}, (err, posts) => {
        console.log(posts);
        res.render('home', {content: homeStartingContent, postsArray: posts, authenticated: req.isAuthenticated()});
    })
});

app.get('/login', (req, res) => {
    res.render('login', {authenticated: req.isAuthenticated()});
});

app.get('/register', (req, res) => {
    res.render('register', {authenticated: req.isAuthenticated()});
});

app.get('/about', (req, res) => {
    res.render('about', {aboutContent: aboutContent, authenticated: req.isAuthenticated()});
});

app.get('/contact', (req, res) => {
    res.render('contact', {contactContent: contactContent, authenticated: req.isAuthenticated()});
});

app.get('/profile', (req, res) => {
    User.findById(req.user.id, (err, foundUser)=> {
        if(err) {
            console.log(err);
            res.send('Please log in to see your profile.');
        } else {
            res.render('profile', { postsArray: foundUser.posts, authenticated: req.isAuthenticated() });
        }
    })
})

app.get('/compose', (req, res) => {
    res.render('compose', {authenticated: req.isAuthenticated()});
});

app.get('/posts/:postId', (req, res) => {
    const requestedPostId = req.params.postId;
    Post.findOne({_id: requestedPostId}, (err, foundPost) => {
        res.render('post', {title: foundPost.title, content: foundPost.post, authenticated: req.isAuthenticated()});
    });
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.post('/register', (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res,() => {
                res.redirect('/')
            });
        }
    });
})

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if(err) {
            console.log(err);
            res.send("Incorrect email or password");
        } else {
            passport.authenticate('local')(req, res, ()=> {
                res.redirect('/');
            });
        }
    });

})


app.post('/compose', (req, res) => {
    const post = new Post ({
        title: req.body.title,
        post: req.body.post,
        public: req.body.public
    });

    if(post.public) {
        post.save();
    }

    User.findById(req.user.id, (err, foundUser)=> {
        if(err) {
            console.log(err);
            res.send('Please log in to post.');
        } else {
            foundUser.posts.push(post);
            foundUser.save(() => {
                res.redirect('/');
                console.log(foundUser.posts);
            });
        }
    })
})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
