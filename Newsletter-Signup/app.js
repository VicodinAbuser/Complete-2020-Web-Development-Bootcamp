const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
})

app.post('/', (req, res) => {
    const firstName = req.body.firstName;
    const secondName = req.body.secondName;
    const email = req.body.email;

    const data = {
        members: [
            {
                email_address: email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: firstName,
                    LNAME: secondName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);
    const url = 'https://us10.api.mailchimp.com/3.0/lists/f7106fc297';
    const options = {
        method: "POST",
        auth: "naman:abffb77b889b85801785cbc50ce67fa31-us10"
    };

    const request = https.request(url, options, (response) => {

        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html")
        } else {
            res.sendFile(__dirname + "/failure.html");
        }


        response.on('data', (data) => {
            console.log(JSON.parse(data));
        })
    })

    request.write(jsonData);
    request.end();
    console.log(firstName, secondName, email);
});


app.post('/failure', (req, res) => {
    res.redirect('/');
})


app.listen('3000', () => { console.log("Server is running on port 3000") });

// API Key
// bffb77b889b85801785cbc50ce67fa31-us10

// List ID
// f7106fc297
