const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const cors = require('cors');

const WAREAL = require("./wareal/wareal.js");

// get new instance_id
app.get('/create_instance', cors, async (req, res) => {
    await WAREAL.generateInstanceId(res);
});

// get qr code
app.get('/get_qrcode', cors, async (req, res) => {
    var instance_id = req.query.instance_id;
  
    await WAREAL.instance(instance_id, res, async (client) => {
      await WAREAL.get_qrcode(instance_id, res);
    });
});

// check whatsapp connection
app.get('/instance', cors, async (req, res) => {
    var instance_id = req.query.instance_id;
  
    await WAREAL.instance(instance_id, res, async (client) => {
      await WAREAL.get_info(instance_id, res);
    });
});