/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/lessons              ->  index
 * POST    /api/lessons              ->  create
 * GET     /api/lessons/:id          ->  show
 * PUT     /api/lessons/:id          ->  upsert
 * PATCH   /api/lessons/:id          ->  patch
 * DELETE  /api/lessons/:id          ->  destroy
 */
'use strict';

import { json } from 'body-parser';
import request from 'request';

var status = 200;
export function sendSMS(req,res){
    const options = {
        url: 'https://api.smsbroadcast.com.au/api-adv.php',
        json: true,
        body: {
            username: 'pspeare',
            password: 'GSPT2011',
            to: req.body.phone,
            from: '0414504002',
            message: req.body.message
        }
    };
    request.post(options, (err, innerRes, body) => {
        if (err) {
            res.send(err);
        }
        else{
            res.send(body);
        }

    });

}