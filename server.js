// Importing all required dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const geoip = require("geoip-lite");

// Declaring express constants
const app = express();
const router = express.Router();

// Configurating Chromium Client
const client = new Client({
	puppeteer:
	{
	    executablePath: "/usr/bin/chromium-browser",
	    args: ["--no-sandbox"]
	},
	authStrategy: new LocalAuth()
});

// Declaring HSTS (HTTPS) certificate
const privateKey = fs.readFileSync("/etc/letsencrypt/live/itzlarz.dev/privkey.pem", "utf8");
const certificate = fs.readFileSync("/etc/letsencrypt/live/itzlarz.dev/cert.pem", "utf8");
const chain = fs.readFileSync("/etc/letsencrypt/live/itzlarz.dev/chain.pem", "utf8");
const serverOptions = {
	key: privateKey,
	cert: certificate,
	ca: [chain]
}

// Declaring variables
var port = process.env.PORT || 8080;
var chatId = "120363021123562891@g.us";
var closed = false;
var useWwebjs = false;
var useBlacklist = true;
var useWhitelist = false;
var useNLOnly = true;

// IP Blacklist for server
var ipBlacklist = [
	null,
];

// IP Whitelist for server
var ipWhitelist = [
	null,
	"84.105.26.25"
];

// app.set("trust proxy", true);
// Stating which directories to use
app.use(express.static("scripts"));
app.use(express.static("libraries"));
app.use(express.static("img"));
app.use(express.static("sound"));

// Redirecting all subdomains to origin domain
app.use((req, res, next) => {
	if(req.subdomains != "") {
		return res.redirect(301, "https://itzlarz.dev/")
	}
	return next();
});

// Adding the IP-Adress to log and alerting host
app.use(async (req, res, next) => {
	var ip = getClientIp(req);
	if (ip != "84.105.26.25"){
		try {
			var ipFile = fs.openSync("./IP-Log.txt", "r");
	        var data = fs.readFileSync(ipFile, "utf8");

	   		if (data.includes(ip)) {
	   			if (useWwebjs) {
		   			await client.sendMessage(chatId, "Client with ip " + ip + " accessed the server (old connection) (country: " + geoip.lookup(ip).country + ")");
		   			await client.markChatUnread(chatId);
	   			}
	   		}
	     		
			else {
				if (useWwebjs) {
					await client.sendMessage(chatId, "Client with ip " + ip + " accessed the server (new connection) (country: " + geoip.lookup(ip).country + ")");
					await client.markChatUnread(chatId);
				}
			}
	        		
	        	
	       	fs.closeSync(ipFile);
	       	
	  		ipFile = fs.openSync("./IP-Log.txt", "a");
	  		fs.appendFileSync(ipFile, ip + " - " + new Date() + " - " + JSON.stringify(geoip.lookup(ip))  + "\n", "utf8");
	       		
		}

		catch(err) {
			if (useWwebjs) {
				await client.sendMessage(chatId, err);
				await client.markChatUnread(chatId);
			}

			else {
				console.log(err);
			}
		}

		finally {
			if (ipFile !== undefined) {
				fs.closeSync(ipFile);
			}
		}
	}
	return next();
});

// Choosing what to send to Client based on IP-Adress
app.get("/", async (req, res) => {
	var ip = getClientIp(req);
	if (useBlacklist) {
		for (var i = 0; i < ipBlacklist.length; i++){
			if (!ip.startsWith(ipBlacklist[i])) { continue; }
			else {
				if (useWwebjs) {
					await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
					await client.markChatUnread(chatId);
				}
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
			if (useWwebjs) {
				await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
				await client.markChatUnread(chatId);
			}
			res.status(403).send("403 Forbidden" + `<br/>` + "IP-Adress not on the whitelist" + `<br/>` + new Date());
			return res.end();
		}
	}

	if (useNLOnly) {
		if (geoip.lookup(ip).country != "NL") {
			if (useWwebjs) {
				await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
				await client.markChatUnread(chatId);
			}
			res.status(403).send("403 Forbidden" + `<br/>` + "Only dutch IP-Adresses permitted" + `<br/>` + new Date());
			return res.end();
		}
	}

	 return res.sendFile(path.join(__dirname + "/index.html"));

	if (closed) {
		res.status(403).send("403 Forbidden" + `<br/>` + "Site Closed" + `<br/>` + new Date());
		if (useWwebjs) {
			await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
		}
		return res.end();
	}
});

// Getting the IP of the Client
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

if (useWwebjs) {
	// Generating QR-code for wwebjs
	client.on("qr", qr => {
	    qrcode.generate(qr, {small: true});
	});

	// When the wwebjs Client is ready
	client.on("ready", async () => {
		await client.sendMessage(chatId,"Whatsapp-webjs client is ready");

		// Initializing server (with wwebjs running)
		https.createServer(serverOptions, app).listen(port, async () => {
			await client.sendMessage(chatId,`Server listening on port ${port}, with DNS https://itzlarz.dev`);
		});
	});

	// Initializing the wwebjs Client
	client.initialize();
}

if (!useWwebjs) {
	// Initializing server (without wwebjs running)
	https.createServer(serverOptions, app).listen(port, () => {
		console.log(`Server listening on port ${port}, with DNS https://itzlarz.dev`);
	});
}
