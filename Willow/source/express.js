const fs = require('fs');
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const { getServer } = require('./scripts/serverlist');
const { printMajorError, print } = require('./utils/output');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dontstarveHandlers = {};
const dontstarveHandlersDir = path.join(__dirname, './dontstarve/events');

fs.readdirSync(dontstarveHandlersDir).forEach(file => {
    if (file.endsWith('.js')) {
        const key = path.basename(file, '.js');
        dontstarveHandlers[key] = require(path.join(dontstarveHandlersDir, file));
    }
});

app.post("/dst", (req, res) => {
    if (!req.body) return;
    const serverId = req.body.serverid || req.body.serverId;
    const trusted = getServer(serverId);
    if (!trusted) return;
    const handler = dontstarveHandlers[req.body.key];
    if (handler) handler(req.body, res);
});

async function startExpress() {
    return new Promise((resolve, reject) => {
        app.listen(process.env.EXPRESS_PORT, (error) => {
            if (error) return reject(new Error(error));
            print(`[Setup] Express started on: ${process.env.EXPRESS_PORT}`);
            resolve();
        });
    }).catch((error) => {
        printMajorError(error);
    });
}

module.exports = { startExpress }