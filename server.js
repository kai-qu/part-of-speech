// ------------ Dictionary API querying

var Dictionary = require("oxford-dictionary-api");

var app_id = 'YOUR_APP_ID_HERE';
var app_key = 'YOUR_APP_KEY_HERE';
var word = "ace";

var dict = new Dictionary(app_id,app_key);

function bad(arr) {
    return arr === undefined || arr.length == 0;
}

function ok(arr) { return !bad(arr); }

function get(x, i) {
    if (bad(x)) { 
	return undefined;  // prevent runtime error from accessing property of undefined
    }

    return x[i];
}

function combine(arr1, arr2) { 
    if (bad(arr1) && ok(arr2)) {
	return arr2;
    }

    if (ok(arr1) && bad(arr2)) {
	return arr1;
    }

    if (bad(arr1) && bad(arr2)) {
	return [];
    }

    return arr1.concat(arr2); 
}

function randElem(arr) {
    var randIndex = Math.floor(Math.random() * arr.length);
    return arr[randIndex];
}

// ------------ Server

var express = require('express'),
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');

// start webserver on heroku's port or port 8080
var server =  http.createServer(app);
var io = socketIo.listen(server);

// To run on Heroku
const PORT = process.env.PORT || 8080;

server.listen(PORT);

// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on localhost:8080 (OR Heroku's port)");
console.log("Port", PORT);

var num_clients = 0;

io.on('connection', function (socket) {
    num_clients = num_clients + 1;
    console.log('Client connected');
    console.log(num_clients + ' clients connected');
    // TODO: log/store client leaving
 
    socket.on('join', function (data) {
	console.log('Client sent join message');
    });

    socket.on('lookup', function (data) {
	var word = data.word;
	console.log('Client looking up: ', data.word);

	dict.find(word, function(error, word_data) { 
	    if (error) { 
		io.emit('word_result', { sentence: undefined, client_id: data.client_id });
		console.log("error ", error);
	    } else {
		var all_data = word_data;
		console.log("success ", all_data); 

		var entries = get(get(get(all_data, "results"), 0), "lexicalEntries");

		if (bad(entries)) {
		    io.emit('word_result', { sentence: undefined, client_id: data.client_id });
		} else {
 		    console.log("entries", entries);

		    var sentences = entries
			.map(o => get(o, "entries"))
			.filter(ok)
			.reduce(combine, [])
			.map(o => get(o, "senses"))
			.filter(ok)
			.reduce(combine, [])
			.map(o => get(o, "examples"))
			.filter(ok)
			.reduce(combine, [])
			.map(o => get(o, "text"))
			.filter(ok);

 		    console.log("sentences", sentences);

		    if (bad(sentences)) {
			io.emit('word_result', { sentence: undefined, client_id: data.client_id });
		    } else {
			var sentence = randElem(sentences);
			io.emit('word_result', { sentence: sentence , client_id: data.client_id });
		    }
		}		

	    }
	});

    });
   
});
