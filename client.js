const WebSocket = require('ws');
const { Client, Server, Message} = require('node-osc');
//var prompt = require('prompt');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
  });

console.clear();

function niceShutdown() {
	console.log("shutting down nicely...");
	try{
		client.close();
	}catch(err)
	{
		//console.log("couldn't close osc connection (perhaps not setup yet)");
	}
	
	try{
		ws.terminate();
	}catch(err)
	{
		//console.log("couldn't close ws connection (perhaps not setup yet)");
	}

	console.log("goodbye!");
	process.exit();
}


rl.question('What OSC port should we send to? ', (answer) => {
	const oscPort = parseInt(answer);
	console.log("trying to use port: " + oscPort);
	const client = new Client('127.0.0.1', 7400);

	const ws = new WebSocket('ws://45.55.43.77:3902');

	ws.on('error', error => {
		console.log("ERROR: couldn't connect to remote server. MRE might not be running.");
		niceShutdown();
	});

	ws.on('message', function incoming(data) { //process incoming 
		console.log("received: " + data);
		const messageArray = JSON.parse(data); //convert JSON to javascript array

		const message = new Message(messageArray[0]);

		for (var i = 1; i < messageArray.length; i++) {
			message.append(messageArray[i]);
		}

		client.send(message, (err) => {
			if (err) {
				niceShutdown();
			}
		});
	});		
});

