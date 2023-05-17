// Importing all required dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const geoip = require("geoip-lite");

// Declaring express constants
const app = express();
const router = express.Router();

// Configurating Chromium Client
const client = new Client({
  puppeteer: {
    executablePath: "/usr/bin/chromium-browser",
    args: ["--no-sandbox"],
  },
  authStrategy: new LocalAuth(),
});

// Declaring HSTS (HTTPS) certificate
const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/itzlarz.dev/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/itzlarz.dev/cert.pem",
  "utf8"
);
const chain = fs.readFileSync(
  "/etc/letsencrypt/live/itzlarz.dev/chain.pem",
  "utf8"
);
const serverOptions = {
  key: privateKey,
  cert: certificate,
  ca: [chain],
};

// Declaring variables
var port = process.env.PORT || 443; // Port to create server on
var chatId = fs.readFileSync("./whatsappChatID.txt", "utf8").toString().trim(); // Whatsapp Chat ID
var closed = false; // Close site
var debugMode = false; // Turning off wwebjs messaging for faster debugging
var useBlacklist = false; // Use IP Blacklist
var useWhitelist = false; // Use IP Whitelist
var useNLOnly = true; // Use NL IP only mode

// IP Blacklist for server
var ipBlacklist = [null];

// IP Whitelist for server
var ipWhitelist = [
	null,
	"77.175.92.205"
];

// Stating which directories to use
app.use(express.static("scripts"));
app.use(express.static("libraries"));
app.use(express.static("img"));
app.use(express.static("sound"));

// Redirecting all subdomains to origin domain
app.use((req, res, next) => {
  if (req.subdomains != "") {
    return res.redirect(301, "https://itzlarz.dev/");
  }
  return next();
});

// Adding the IP-Adress to log and alerting host
app.use(async (req, res, next) => {
	var ip = getClientIp(req);
	if (ip != "77.175.92.205"){
		if (!ip.startsWith("192.168")){
			try {
				var ipFile = fs.openSync("./IP-Log.txt", "r");
		        var data = fs.readFileSync(ipFile, "utf8");

		   		if (data.includes(ip)) {
		   			if (!debugMode) {
			   			await client.sendMessage(chatId, "Client with ip " + ip + " accessed the server (old connection) (country: " + geoip.lookup(ip).country + ")");
			   			await client.markChatUnread(chatId);
		   			}
		   		}

				else {
					if (!debugMode) {
						await client.sendMessage(chatId, "Client with ip " + ip + " accessed the server (new connection) (country: " + geoip.lookup(ip).country + ")");
						await client.markChatUnread(chatId);
					}
				}


		       	fs.closeSync(ipFile);

		  		ipFile = fs.openSync("./IP-Log.txt", "a");
		  		fs.appendFileSync(ipFile, ip + " - " + new Date() + " - " + JSON.stringify(geoip.lookup(ip))  + "\n", "utf8");
			}

			catch(err) {
				if (!debugMode) {
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
	}
	return next();
});

// Choosing what to send to client based on IP-Adress
app.get("/", async (req, res) => {
	var ip = getClientIp(req);
	if (useBlacklist) {
		for (var i = 0; i < ipBlacklist.length; i++){
			if (!ip.startsWith(ipBlacklist[i])) { continue; }
			else {
				if (!debugMode) {
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
			if (!debugMode) {
				await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
				await client.markChatUnread(chatId);
			}
			res.status(403).send("403 Forbidden" + `<br/>` + "IP-Adress not on the whitelist" + `<br/>` + new Date());
			return res.end();
		}
	}

	if (useNLOnly) {
		if (!ip.startsWith("192.168")) {
			if (geoip.lookup(ip)) {
				if (geoip.lookup(ip).country != "NL") {
					if (!debugMode) {
						await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
						await client.markChatUnread(chatId);
					}
					res.status(403).send("403 Forbidden" + `<br/>` + "Only Dutch IP-Adresses permitted" + `<br/>` + new Date());
					return res.end();
				}
			}

			else {
				if (!debugMode) {
					await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: unknown)");
					await client.markChatUnread(chatId);
				}
				res.status(403).send("403 Forbidden" + `<br/>` + "Only Dutch IP-Adresses permitted" + `<br/>` + new Date());
				return res.end();
			}
		}
	}

	if (closed) {
		res.status(403).send("403 Forbidden" + `<br/>` + "Site Closed" + `<br/>` + new Date());
		if (!debugMode) {
			await client.sendMessage(chatId, "Client with ip " + ip + " was kicked from the server (country: " + geoip.lookup(ip).country + ")");
		}
		return res.end();
	}

	else {
		return res.sendFile(path.join(__dirname + "/index.html"));
	}
});

// Send wwebjs message if Game Over
app.get("/gameOver", async (req, res) => {
  var result = req.query.result;
  var bombs = req.query.bombs;
  var rows = req.query.rows;
  var columns = req.query.columns;

  var ip = getClientIp(req);

  if (!debugMode) {
    if (result == "win") {
      await client.sendMessage(
        chatId,
        "Alert: IP " +
          ip +
          " won the game with \nbombs = " +
          bombs +
          "\nrows = " +
          rows +
          "\ncolumns = " +
          columns
      );
    } else if (result == "defeat") {
      await client.sendMessage(
        chatId,
        "Alert: IP " +
          ip +
          " lost the game with \nbombs = " +
          bombs +
          "\nrows = " +
          rows +
          "\ncolumns = " +
          columns
      );
    } else {
      await client.sendMessage(
        chatId,
        "Error: IP " +
          ip +
          ' got the value: "' +
          result +
          '"' +
          " with \nbombs = " +
          bombs +
          "\nrows = " +
          rows +
          "\ncolumns = " +
          columns
      );
    }

    await client.markChatUnread(chatId);
  } else if (debugMode) {
    if (result == "win") {
      console.log(
        "Alert: IP " +
          ip +
          " won the game with \nbombs = " +
          bombs +
          "\nrows = " +
          rows +
          "\ncolumns = " +
          columns
      );
    } else if (result == "defeat") {
      console.log(
        "Alert: IP " +
          ip +
          " lost the game with \nbombs = " +
          bombs +
          "\nrows = " +
          rows +
          "\ncolumns = " +
          columns
      );
    } else {
      console.log(
        "Error: IP " +
          ip +
          ' got the value: "' +
          result +
          '"' +
          " with \nbombs = " +
          bombs +
          "\nrows = " +
          rows +
          "\ncolumns = " +
          columns
      );
    }
  }
});

// Getting the IP of the client
var getClientIp = function (req) {
  var ip =
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  if (!ip) {
    return "";
  }
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7);
  }
  return ip;
};

if (!debugMode) {
  // Generating QR-code for wwebjs
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  // When the wwebjs client is ready
  client.on("ready", async () => {
    await client.sendMessage(chatId, "Whatsapp-webjs client is ready");

    // Initializing server (with wwebjs running)
    https.createServer(serverOptions, app).listen(port, async () => {
      await client.sendMessage(
        chatId,
        `Server listening on port ${port}, with DNS https://itzlarz.dev`
      );
    });
  });

  // Initializing the wwebjs client
  client.initialize();
}

if (debugMode) {
  // Initializing server (without wwebjs running)
  https.createServer(serverOptions, app).listen(port, () => {
    console.log(
      `Server listening on port ${port}, with DNS https://itzlarz.dev`
    );
  });
}

process.on('uncaughtException', async (err, origin) => {			
	try {
		var errorFile = fs.openSync("./Errors.txt","a");
		fs.appendFileSync(errorFile,
			new Date() +
			"\nCaught exception: " + err + 
			"Exception origin: "+ origin +
			"\n \n \n \n \n"
		);
		
	}

	catch {
		console.log("\nServer has crashed: ")
		console.log(`Caught exception: ${err}`)
		console.log(`Exception origin: ${origin}\n`)	
	}

	finally {
		if (errorFile !== undefined) {
			fs.closeSync(errorFile);
		}

		try {
			await client.sendMessage(chatId, 
				`Server has crashed.`
				`Caught exception: ${err}`
				`Exception origin: ${origin}\n`
			);
		}

		finally {
			process.exit();
		}
	}
});
