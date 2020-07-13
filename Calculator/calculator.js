const bodyParser = require('body-parser');
const express = require('express');

const app = express();

app.use(bodyParser.urlencoded({ extended: true} ));

app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html') });

app.post('/', (req, res) => {
    let num1 = Number(req.body.num1);
    let num2 = Number(req.body.num2);
    let result = num1 + num2;
    res.send("The answer is " + result);

});

app.get('/bmicalculator', (req, res) => { res.sendFile(__dirname + '/bmicalculator.html')});

app.post('/bmicalculator', (req, res) => {
    function roundToXDigits(value, digits) {
        value = value * Math.pow(10, digits);
        value = Math.round(value);
        value = value / Math.pow(10, digits);
        return value;
    }
    let weight = Number(req.body.weight);
    let height = Number(req.body.height);
    let bmi = roundToXDigits(weight/Math.pow(height, 2),2);
    res.send("Your BMI is : <strong>" + bmi + '</strong>');
})

app.listen('3000', () => { console.log("Server started on port 3000") } );
