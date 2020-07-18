const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect('mongodb://localhost:27017/wikiDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const articleSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Article = mongoose.model("Article", articleSchema);


app.route('/articles')

.get((req, res) => {
    Article.find((err, articlesFound) => {
        if (err) {
            console.log(err);
        } else {
            console.log(articlesFound);
            res.send(articlesFound);
        }
    });
})

.post((req, res) => {
    const title = req.body.title;
    const content = req.body.content;

    const article = new Article({
        title: title,
        content: content
    });
    article.save((err) => {
        if(err) {
            res.send(err);
        } else {
            res.send("Successfully added new article.");
        }
    });
})

.delete((req, res) => {
    Article.deleteMany((err) => {
        if(err) {
            res.send(err);
        } else {
            res.send("Deleted all articles!");
        }
    })
});



app.route('/articles/:articleTitle')

.get((req, res) => {
    const articleName = req.params.articleTitle;
    Article.findOne({title: articleName}, (err, article) => {
        if(err) {
            res.send(err);
        } else {
            if (article) {
                res.send(article);
            } else {
                res.send("No articles matching that title was found.");
            }
        }
    });
})

.put((req, res) => {
    Article.update(
        {title: req.params.articleTitle},
        {title: req.body.title, content: req.body.content},
        {overwrite: true},
        (err) => {
            if(err) {
                res.send(err);
            } else {
                res.send("Successfully updated the article.");
            }
        }
    );
})

.patch((req, res) => {
    Article.update(
        {title: req.params.articleTitle},
        {$set: req.body},
        (err) => {
            if(err) {
                res.send(err);
            } else {
                res.send("Successfully updated the article.");
            }
        }
    );
})

.delete((req, res) => {
    Article.deleteOne({title: req.params.articleTitle}, (err) => {
        if(err) {
            res.send(err);
        } else {
            res.send("Successfully deleted the given article.");
        }
    });
});



app.listen(3000, () => {
    console.log("Server up and running!");
})
