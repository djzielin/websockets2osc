const WebSocket = require('ws');
const { Client, Server, Message } = require('node-osc');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

console.clear();

/*rl.question('What OSC port should we send to? ', (answer) => {
	const oscPort = parseInt(answer);
	console.log("trying to use port: " + oscPort);
});*/

let ws = null;

const client = new Client('127.0.0.1', 7400);

setInterval(() => {
	if (ws === null) {
		console.log("------------------------------------------------------------");
		console.log("1 seconds has expired. trying to connect to server... ");
		connectToServer();
	}
}, 1000);

process.on("SIGINT", () => {
	console.log("received SIGINT (control-c)");
	niceShutdown();

});

function niceShutdown() {
	console.log("shutting down nicely...");
	try {
		client.close();
	} catch (err) {
		//console.log("couldn't close osc connection (perhaps not setup yet)");
	}

	try {
		ws.terminate();
	} catch (err) {
		//console.log("couldn't close ws connection (perhaps not setup yet)");
	}

	console.log("goodbye!");
	process.exit();
}

function connectToServer() {
	ws = new WebSocket('ws://45.55.43.77:3903');

	ws.on('error', (error) => {
		console.log("ERROR: couldn't connect to remote server.");
		weAreConnected = false;
		ws = null;
	});

	ws.on('close', (code, reason) => {
		console.log("CLOSE: connection closed");
		weAreConnected = false;
		ws = null;
	});

	ws.on('open', () => {
		weAreConnected = true;
		console.log("Success! we are connected to server!");
	});

	ws.on('message', function incoming(data) { //process incoming 
		console.log("received: " + data);
		const messageArray = JSON.parse(data); //convert JSON to javascript array

		const message = new Message(messageArray[0]);

		for (var i = 1; i < messageArray.length; i++) {
			message.append(messageArray[i]);
		}

		try {
			client.send(message, (err) => {
				if (err) {
					console.log("ERROR during OSC Send!");
				}
			});
		} catch (err) {
			console.log("ERROR during OSC Send!");
		}
	});
}

