'use strict';

var os = require('os');
var nodeStatic = require('node-static');

var fileServer = new nodeStatic.Server('./public');

const DEBUG = (process.argv[2] == "debug") ? true : false;

if (DEBUG) {
    console.log("Running in debug mode. Note that MIDI is not available without HTTPS");
    console.log("Up on localhost:30001");
    const http = require('http');
    var app = http.createServer(function(req, res) {
        log(req.url);
        fileServer.serve(req, res);
    }).listen(30001);
} else {
    const Https = require('https');
    const Fs = require('fs');
    var secureApp = Https.createServer({
        key: Fs.readFileSync('/etc/letsencrypt/live/jminjie.com/privkey.pem'),
        cert: Fs.readFileSync('/etc/letsencrypt/live/jminjie.com/cert.pem'),
        ca: Fs.readFileSync('/etc/letsencrypt/live/jminjie.com/chain.pem')
    }, function(req, res) {
        fileServer.serve(req, res);
    }).listen(30001);
}

function log(m) {
    console.log(m);
}
