const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/getdate.js');
const mongoose = require('mongoose');

const app = express();

// let items = ['By Food', 'Cook the food', 'Eat the food'];
// let workItems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true })

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: 'Welcome to your to-do list'
});
const item2 = new Item({
    name: 'Hit the + button to add a new item'
});
const item3 = new Item({
    name: "<-- Hit this to delete and item"
});

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);


app.get('/', (req, res) => {

    Item.find((err, result) => {

        if(err) {
            console.log(err);
        } else {

            if(result.length === 0) {
                Item.insertMany(defaultItems, (err) => {

                    if(err) {
                        console.log(err);
                    } else {
                        console.log("Successfully inserted default items to Items collection");
                    }

                });
                res.redirect('/');
            } else {
                res.render('list', {listTitle: date.getDate(), newListItem: result, action: '/'});
            }
            //console.log(result);
        }
    });
});



app.post('/', (req, res) => {
    const itemName = req.body.newItem;

    const newItem = new Item({
        name: itemName
    });

    newItem.save();
    // items.push(item);

    res.redirect('/');
    console.log(req.body);
});


app.post('/delete', (req, res) => {
    console.log(req.body.checkbox);

    const checkedItemId = req.body.checkbox;
    Item.deleteOne({_id: checkedItemId}, (err) => {
        if(err) {
            console.log(err);
        } else {
            console.log("Successfullydeleted the entry from the database");
        }
    });

    res.redirect('/');
})


app.get('/:custom', (req, res) => {
    console.log(req.params.custom);

    const customeListName = req.params.custom;

    List.findOne({name: customeListName}, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            if (!result) {
                const list = new List({
                    name: customeListName,
                    items: defaultItems
                });
                list.save();
                res.render('list', {listTitle: list.name, newListItem: list.items, action: `/${list.name}`});
            } else {
                console.log("List of given name already exists");
                res.render('list', {listTitle: result.name, newListItem: result.items, action: `/${result.name}`});
            }
        }
    });





})


app.get('/work', (req, res) => {
    res.render('list', {listTitle: 'Work List', newListItem: workItems, action: '/work'});
});


app.post('/work', (req, res) => {
    let item = req.body.newItem;
    workItems.push(item);

    res.redirect('/work');
})


app.get('/about', (req, res) => {
    res.render('about');
})



app.listen('3000', () => {
    console.log("Server up and running on port 3000");
});
