const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/getdate.js');

const app = express();

let items = ['By Food', 'Cook the food', 'Eat the food'];
let workItems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.render('list', {listTitle: date.getDate(), newListItem: items, action: '/'});
});



app.post('/', (req, res) => {
    let item = req.body.newItem;
    items.push(item);

    res.redirect('/');
    console.log(req.body);
});


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
