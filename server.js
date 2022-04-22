const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const geoip = require("geoip-lite");
const app = express();
const port = process.env.PORT || 8080;
const chatId = "120363021123562891@g.us";

const client = new Client({
        puppeteer: {
                executablePath: "/usr/bin/chromium-browser",
                args: ["--no-sandbox"]
                },
        authStrategy: new LocalAuth()
});

const privateKey = fs.readFileSync("/etc/letsencrypt/live/itzlarz.dev/privkey.pem", "utf8");
const certificate = fs.readFileSync("/etc/letsencrypt/live/itzlarz.dev/cert.pem", "utf8");
const chain = fs.readFileSync("/etc/letsencrypt/live/itzlarz.dev/chain.pem", "utf8");

const serverOptions = {
	key: privateKey,
	cert: certificate,
	ca: [chain]
}

var ipBlacklist = [
	null,
	"119.13.196.199",
	"128.14.134",
	"128.14.209",
	"130.211.54.158",
	"139.162.145.250",
	"149.19.255.175",
	"162.142.125.211",
	"162.221.192.26",
	"164.90.231.93",
	"167.94.138.44",
	"168.151",
	"176.113.43.58",
	"176.223.105.170",
	"176.53.219.95",
	"183.136.226.3",
	"184.105.247.196",
	"185.180.143.138",
	"185.189.182.234",
	"185.240.25",
	"192.241",
	"199.244.60.221",
	"2.57.121.16",
	"203.109.5",
	"203.78.173.102",
	"206.204",
	"208.86.196.76",
	"213.188",
	"34.140.248.32",
	"45.114.242.139",
	"45.146.165.37",
	"45.132.227",
	"45.90.61.179",
	"46.232.209.113",
	"51.210.182.66",
	"69.165.14.227",
	"74.85.209.77"
];

var ipWhitelist = [
	null,
	"84.105.26.25"
];
	
var useBlacklist = true;
var useWhitelist = false;
var useNLOnly = true;

app.use(express.static("scripts"));
app.use(express.static("libraries"));
app.use(express.static("img"));
app.use(express.static("sound"));

app.set("trust proxy", true);

app.get("/", async (req, res) => {
	var ip = getClientIp(req);

	try {
		var ipFile = fs.openSync("./IPAdresses.txt", "r");
        var data = fs.readFileSync(ipFile, "utf8");

   		if (data.includes(ip)) {
   			// await client.sendMessage(chatId, "Client with ip " + ip + " accessed the server (old connection) (country: " + geoip.lookup(ip).country + ")");
   			// await client.markChatUnread(chatId);
   		}
     		
		else {
			// await client.sendMessage(chatId, "Client with ip " + ip + " accessed the server (new connection) (country: " + geoip.lookup(ip).country + ")");
			// await client.markChatUnread(chatId);
		}
        		
        	
       	fs.closeSync(ipFile);
       	if (ip != "84.105.26.25"){
       		ipFile = fs.openSync("./IPAdresses.txt", "a");
       		fs.appendFileSync(ipFile, ip + " - " + new Date() + " - " + JSON.stringify(geoip.lookup(ip))  + "\n", "utf8");
       	}	
	}

	catch(err) {
		// await client.sendMessage(chatId, err);
		// await client.markChatUnread(chatId);
		// console.log(err);
	}

	finally {
		if (ipFile !== undefined) {
			fs.closeSync(ipFile);
		}
	}
	
	if (useBlacklist) {
		for (var i = 0; i < ipBlacklist.length; i++){
			if (!ip.startsWith(ipBlacklist[i])) { continue; }
			else {
				// await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
				// await client.markChatUnread(chatId);
				res.status(403).send("403 Forbidden" + `<br/>` + "IP-Adress on the blacklist" + `<br/>` + new Date());
				return res.end();
			}
		}
	}

	if (useWhitelist) {
		var through = false;
		for (var i = 0; i < ipWhitelist.length; i++){
			if (ip.startsWith(ipWhitelist[i])) { 
				through = true;
				break; 
			}	
		}

		if (!through) {
			// await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
			// await client.markChatUnread(chatId);
			res.status(403).send("403 Forbidden" + `<br/>` + "IP-Adress not on the whitelist" + `<br/>` + new Date());
			return res.end();
		}
	}

	if (useNLOnly) {
		if (geoip.lookup(ip).country != "NL") {
			// await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
			// await client.markChatUnread(chatId);
			res.status(403).send("403 Forbidden" + `<br/>` + "Only dutch IP-Adresses permitted" + `<br/>` + new Date());
			return res.end();
		}
	}

	 return res.sendFile(path.join(__dirname + "/index.html"));

	//res.status(403).send("403 Forbidden" + `<br/>` + "Site Closed" + `<br/>` + new Date());
	//await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
	//return res.end();
});


var getClientIp = function(req) {
	var ip = req.headers["x-real-ip"]
		|| req.connection.remoteAddress
		|| req.socket.remoteAddress
		|| req.connection.socket.remoteAddress;
        if (!ip) { return "" }
	if (ip.substr(0, 7) == "::ffff:") {
                ip = ip.substr(7);
        }
	return ip;
};

// client.on("qr", qr => {
    // qrcode.generate(qr, {small: true});
// });
// 
// client.on("ready", async () => {
	// console.log("Whatsapp-webjs client is ready");
	// await client.sendMessage(chatId,"Whatsapp-webjs client is ready");
// 
	// // https.createServer(serverOptions, app).listen(port, async () => {
		// // await client.sendMessage(chatId,`Server listening on port ${port}, with DNS https://itzlarz.dev`);
	// // });
// });
// 
// client.initialize();

https.createServer(serverOptions, app).listen(port, () => {
	console.log(`Server listening on port ${port}, with DNS https://itzlarz.dev`);
});
