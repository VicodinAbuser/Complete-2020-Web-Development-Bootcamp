const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/', (req, res) => {
    const query = req.body.city_name;
    const apiKey = 'e3294e8f9e7f5c31a5acccc53a2592d0';
    const unit = 'metric'
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + query + '&appid=' + apiKey + '&units=' + unit;

    https.get(url, (response) => {
        console.log(response.statusCode);

        response.on('data', (data) => {
            const weather_data = JSON.parse(data);
            const temp = parseFloat(weather_data.main.temp);
            const description = weather_data.weather[0].description;
            const icon = weather_data.weather[0].icon;
            const imgURL = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';

            res.write('<h1>The temperature in ' + query + ' is ' + (temp) + ' degree C</h1>');
            res.write('<h3>The weather condition is ' + description + '.</h3>');
            res.write('<img src="' + imgURL + '">');
            res.send();

        });
    });


});

app.listen('3000', () => {
    console.log("Server running on port 3000")
});
