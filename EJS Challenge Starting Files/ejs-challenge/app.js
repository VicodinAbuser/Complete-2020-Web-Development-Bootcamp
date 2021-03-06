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
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
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
    public: Boolean,
    account: String,
    email: String,
    authorId: String,
    timestamp: String,
    likes: Number
    // comments: [String],
    // numberOfComments: Number
});

const Post = mongoose.model('Post', postSchema);


const usersSchema = new mongoose.Schema({
    accountName: String,
    email: String,
    password: String,
    googleId: String,
    secret: String,
    // facebookId: String,
    posts: [postSchema],
    likedPosts: [String]
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


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id, accountName: profile.displayName, username: profile.emails[0]['value'] }, function (err, user) {
      return cb(err, user);
    });
  }
));
//
// passport.use(new FacebookStrategy({
//     clientID: process.env.FB_APP_ID,
//     clientSecret: process.env.FB_APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     console.log(profile);
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));



app.get('/', (req, res) => {
    Post.find({public: true}, (err, posts) => {
        posts.sort ( (a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        // console.log(posts);

        if(req.isAuthenticated()) {
            User.findById(req.user.id, (err, foundUser) => {
                if(err) {
                    console.log(err);
                    res.send("There was an error. Please try again.");
                } else {
                    res.render('home', {postsArray: posts, authenticated: req.isAuthenticated(), userLikedPosts: foundUser.likedPosts});
                }
            });

        } else {
            res.render('home', {postsArray: posts, authenticated: req.isAuthenticated(), userLikedPosts: null});
        }
    })
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/login'}), (req, res) => {
    res.redirect('/');
});

// app.get('/auth/facebook',
//   passport.authenticate('facebook'));
//
// app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

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
            console.log(foundUser.posts.length);
            res.render('profile', { postsArray: foundUser.posts, userName: foundUser.accountName, authenticated: req.isAuthenticated(), visitor: false });
        }
    })
});

app.get('/profile/:profileId', (req, res) => {
    const profileId = req.params.profileId;
    console.log(profileId);
    User.findById(profileId, (err, foundUser) => {
        if (err) {
            console.log(err);
            res.send('User not found');
        } else {
            if(req.isAuthenticated()) {
                User.findById(req.user.id, (err, foundMyself) => {
                    if(err) {
                        console.log(err);
                        res.send("Please login to see this profile");
                    } else {
                        if(foundMyself) {
                            if (JSON.stringify(foundMyself._id) === JSON.stringify(foundUser._id)) {

                                res.render('profile', { postsArray: foundUser.posts, userName: foundUser.accountName, authenticated: req.isAuthenticated(), visitor: false });
                            } else {
                                res.render('profile', { postsArray: foundUser.posts, userName: foundUser.accountName, authenticated: req.isAuthenticated(), visitor: true });
                            }
                        } else {
                            res.send("Please login to see this profile");
                        }
                    }
                });
            } else {
                res.render('profile', { postsArray: foundUser.posts, userName: foundUser.accountName, authenticated: req.isAuthenticated(), visitor: true });
            }

        }
    });
});

app.get('/compose', (req, res) => {
    res.render('compose', {authenticated: req.isAuthenticated()});
});

app.get('/posts/:postId', (req, res) => {
    const requestedPostId = req.params.postId;
    Post.findById( requestedPostId, (err, foundPost) => {
        if(err) {
            console.log(err);
            res.send("There was an error retrieving the post.");
        } else {
            if(foundPost) {
                if (req.isAuthenticated()) {
                    User.findById(req.user.id, (err, foundMyself) => {
                        if(err) {
                            console.log(err);
                            res.send("Please login to see this post");
                        } else {
                            if(foundMyself) {
                                console.log(foundPost.post);
                                if (JSON.stringify(foundMyself._id) === JSON.stringify(foundPost.authorId)) {
                                    res.render('post', {id: foundPost._id, title: foundPost.title, author: foundPost.account, content: foundPost.post, visitor: false, authenticated: req.isAuthenticated()});
                                } else {
                                    res.render('post', {id: foundPost._id, title: foundPost.title, author: foundPost.account, content: foundPost.post, visitor: true, authenticated: req.isAuthenticated()});
                                }
                            } else {
                                res.send("Please login to see this post");
                            }
                        }
                    });
                } else {
                    res.render('post', {id: foundPost._id, title: foundPost.title, author: foundPost.account, content: foundPost.post, visitor: true, authenticated: req.isAuthenticated()});
                }

            }
        }
    });
});

app.post('/like', (req, res) => {
    const liked = req.body.liked;
    const postId = req.body.postId;

    if(req.isAuthenticated()) {
        User.findById(req.user.id, (err, foundUser) => {
            if(err) {
                console.log(err);
                res.send("There was an error. Please try again.");
            } else {
                if(liked==='true'){
                    foundUser.likedPosts.push(postId);
                    foundUser.save();
                    Post.findById(postId, (err, foundPost) => {
                        if(err) {
                            console.log(err);
                            res.send("There was an error");
                        } else {
                            foundPost.likes++;
                            console.log(foundPost.likes)
                            foundPost.save();
                            console.log(foundPost.likes)
                        }
                    });
                    res.redirect('/');
                } else {
                    foundUser.likedPosts.splice(foundUser.likedPosts.indexOf(postId), 1);
                    foundUser.save();
                    Post.findById(postId, (err, foundPost) => {
                        if(err) {
                            console.log(err);
                            res.send("There was an error");
                        } else {
                            foundPost.likes--;
                            console.log(foundPost.likes)
                            foundPost.save();
                            console.log(foundPost.likes)
                        }
                    });
                    res.redirect('/');
                }
            }
        });
    }
})


app.post('/delete', (req, res) => {
    const postId = req.body.postId;

    Post.findById(postId, (err, foundPost) => {
        if(err) {
            console.log(err);
            res.send('Post not found.');
        } else {
            if(foundPost) {
                const userId = foundPost.authorId;

                User.findById(userId, (err, foundUser) => {
                    if(err) {
                        console.log(err);
                        res.send("There was an error. Please try again.");
                    } else {
                        if (foundUser) {
                            for(let i = 0; i < foundUser.posts.length; i++) {

                                if (JSON.stringify(foundUser.posts[i]['_id']) === JSON.stringify(postId)) {
                                    // console.log(foundUser.posts.length);
                                    foundUser.posts.splice(i,1);
                                    foundUser.save();
                                    // console.log(foundUser.posts.length);
                                    break;
                                }
                            }
                        } else {
                            res.send("User not found");
                        }
                    }
                });

                Post.findByIdAndDelete(postId, (err, deletedPost) => {
                    if(err) {
                        console.log(err);
                        res.send("There was an error. Please try again.");
                    } else {
                        if(deletedPost) {
                            // console.log(deletedPost);
                            res.redirect('/profile');
                        }
                    }
                });
            } else {
                res.send("Post not found");
            }
        }
    });
});

// app.post('/like', (req, res) => {
//     const toLike = req.body.liked;
//     const postId = req.body.postId;
//
//     if(toLike == "true") {
//         Post.findById(postId, (err, foundPost) => {
//             if(err) {
//                 console.log(err);
//                 res.send('There was an error. Please try again');
//             } else {
//                 if(foundPost) {
//                     foundPost.liked = true;
//                     foundPost.likes++;
//
//                     res.redirect('/');
//                 } else {
//                     res.send("Could not find post. Please try again.");
//                 }
//             }
//         });
//     } else {
//         Post.findById(postId, (err, foundPost) => {
//             if(err) {
//                 console.log(err);
//                 res.send('There was an error. Please try again');
//             } else {
//                 if(foundPost) {
//                     foundPost.liked = true;
//                     foundPost.likes++;
//
//                     res.redirect('/');
//                 } else {
//                     res.send("Could not find post. Please try again.");
//                 }
//             }
//         });
//     }
// })

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.post('/register', (req, res) => {
    User.register({username: req.body.username, accountName: req.body.accountName}, req.body.password, (err, user) => {
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
    User.findById(req.user.id, (err, foundUser)=> {
        if(err) {
            console.log(err);
            res.send('Please log in to post.');
        } else {

            const today = new Date();
            const dateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

            const post = new Post ({
                title: req.body.title,
                post: req.body.post,
                public: req.body.public,
                account: foundUser.accountName,
                email: foundUser.username,
                authorId: req.user.id,
                timestamp: dateTime,
                likes: 0
            });

            // if(post.public) {
            //     post.save();
            // }
            post.save();

            foundUser.posts.push(post);

            foundUser.save(() => {
                res.redirect('/');
                // console.log(foundUser.posts);
            });
        }
    })
})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
