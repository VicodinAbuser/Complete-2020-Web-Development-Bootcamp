const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
})

app.post('/', (req, res) => {
    let firstName = req.body.firstName;
    let secondName = req.body.secondName;
    let email = req.body.email;
    console.log(firstName, secondName, email);
});







app.listen('3000', () => { console.log("Server is running on port 3000") });
