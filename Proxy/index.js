const express = require("express");
const axios = require("axios");
const { log } = require("./source/utils");
const config = require("./config.json");

const axiosConfig = { headers: { "Content-Type": "application/json" }, timeout: 5000 };
const app = express();
app.use(express.json());

let willowStatus = 3;

function filterContent(body) {
    // Add any filter you want
    if (body.key != "update") {
        log(`[Request] Request from: localhost : ${body.key}`);
        if (body.key != "cycle") {
            log(`-> Value: ${JSON.stringify(body.value)}`);
        }
    }
    return body;
}

app.use((req, res, next) => {
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).json({ error: "[Error] Request timeout" }).end();
        }
    }, 5000);
    res.on("finish", () => clearTimeout(timeout));
    res.on("close", () => clearTimeout(timeout));
    next();
});

console.clear();
console.log("____________________________________________\n");
log(`[Setup] Content: Initializing Application...`);

app.post("/dst", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    if (req.body.source === "proxy") return res.sendStatus(400);
    req.body.serverId = config.SERVERID;
    req.body.source = "proxy";
    if (req.body.key === "ping") {
        req.body.value = { starttime: Date.now() };
    }
    let response = null;
    let requestCompleted = false;
    let filteredBody = filterContent(req.body);
    try {
        const targetUrl = config.SERVERIP ? `http://${config.SERVERIP}:${config.SERVERPORT}/dst` : `http://cultismocasual.ddns.net:${config.SERVERPORT}/dst`;
        response = await axios.post(targetUrl, filteredBody, axiosConfig);
        requestCompleted = true;
        if (willowStatus != 1) log(`[Log] Willow was found : ${new Date().toLocaleTimeString()}`);
        willowStatus = 1;
        if (!res.headersSent) {
            for (const command of response.data) {
                if (command.key) log(`[Response] Response from: Willow : ${command.key}`);
            }
            return res.status(response.status).json(response.data);
        }
    } catch (error) {
        if (!res.headersSent) {
            if (willowStatus != 0) log(`[Error] Willow's unreachable : ${new Date().toLocaleTimeString()}`);
            willowStatus = 0;
            res.status(502).json({ error: "[Error] Willow's unreachable" }).end();
        }
    }
    if (!requestCompleted || !response) return;
});

const server = app.listen(config.CLIENTPORT, () => {
    log(`[Setup] Server started on port: ${config.CLIENTPORT}`);
    console.log("____________________________________________\n");
});

server.setTimeout(10000);
