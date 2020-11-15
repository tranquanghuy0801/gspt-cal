'use strict';

const request = require('request');

const options = {
    url: 'https://api.smsbroadcast.com.au/api-adv.php',
    json: true,
    body: {
        username: 'pspeare',
        password: 'GSPT2011',
        to: '04503',
        from: '0414504002',
        message: 'Hello'
    }
};
request.post(options, (err, res, body) => {
    if (err) {
        console.log(err);
    }
});