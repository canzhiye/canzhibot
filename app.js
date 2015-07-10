var config = require('config.json')('./sample.json');
var login = require("facebook-chat-api");
Omegle = require('omegle').Omegle;

var fb_api;
var omegle_convo_list = {};
var request = require("request");

var neeloy_thread_id = "100001173039455"
//100001173039455
//552293053
var conversations_with_neeloy = []

login({email: config.fb_email, password: config.fb_password}, function callback (err, api) {
	if(err) return console.error(err);

	fb_api = api

	var participant_ids = [];
	var participant_names = [];

	api.listen(function callback(err, message) {
		participant_names = message.participant_names;
		participant_ids = message.participant_ids;

		console.log(participant_ids);
		console.log(participant_names);
				// if @mention
		for (var i = 0; i < participant_names.length; i++) {
			var name = participant_names[i].toLowerCase();
			console.log("name: " + name);

			if (participant_names.length > 2) {
				for (var i = 0; i < participant_names.length; i++) {
					var name = String(participant_names[i]).toLowerCase();
					console.log("name: " + name);
					if (String(message.body).toLowerCase().indexOf("@" + name) >= 0) {
						console.log("message: " + message.body);
						var recipient_id = "";

						for (var i = 0; i < participant_names.length; i++) {
							console.log("participant_name: " + participant_names[i]);
							if (String(participant_names[i]).toLowerCase() == name) {
								recipient_id = participant_ids[i];
							}
						}

						console.log("recipient_id: " + recipient_id);
						api.sendMessage("You have a new message from " + message.sender_name + " in http://www.messenger.com/t/" + message.thread_id, recipient_id);
					}
				}
			} else if(message.type === "file") {
				console.log("file name: " + message.name);						
				for (var i = 0; i < participant_names.length; i++) {
					console.log("participant_name: " + participant_names[i]);
					recipient_id = participant_ids[i];
					api.sendMessage("A new " + message.type + " with name: \"" + message.name + "\" was added from " + message.sender_name + " in http://www.messenger.com/t/" + message.thread_id
					+ "\n Link to download file @ " + message.file_url, recipient_id);
				}
			} else if(message.type === "photo") {
				console.log("photo name: " + message.name);						
				for (var i = 0; i < participant_names.length; i++) {
					console.log("participant_name: " + participant_names[i]);
					recipient_id = participant_ids[i];
					console.log(message.url)
					api.sendMessage("A new " + message.type + " with name: \"" + message.name + "\" was added from " + message.sender_name + " in http://www.messenger.com/t/" + message.thread_id
					+ "\n Link to download photo @ " + message.hires_url, recipient_id);
				}
			} else if(message.type === "animated_image") {
				console.log("gif name: " + message.name);						
				for (var i = 0; i < participant_names.length; i++) {
					console.log("participant_name: " + participant_names[i]);
					recipient_id = participant_ids[i];
					api.sendMessage("A new " + message.type + " with name: \"" + message.name + "\" was added from " + message.sender_name + " in http://www.messenger.com/t/" + message.thread_id
					+ "\n Link to download gif @ " + message.url, recipient_id);
				}
			} else if (message.thread_id == neeloy_thread_id) {
				if (message.body.split(" ").length > 1) {
					var key = message.body.split(" ")[0];
					var thread_id = conversations_with_neeloy[key]
					var msg = message.body.substr(message.body.indexOf(" ") + 1);
					api.sendMessage(msg, thread_id);
				};
			} else {
				console.log("received message from: " + message.sender_name);
				// it's not ready yet.... too many bots on omegle...
				//startOmegle(message.body, message.thread_id);
				setTimeout(function() {pipe_to_neeloy(message.sender_name, message.thread_id, message.body)}, Math.floor((Math.random() * 10) + 1) * 1000)
				//setTimeout(function() {random_wiki(message.thread_id)}, Math.floor((Math.random() * 10) + 1) * 1000);
				
				//api.sendMessage(reverse(message.body), message.thread_id);
			}
		};

		// cat bombs
		// USAGE `cat bomb DIGIT`
		// this sends a cat GIF DIGIT times
		// var res = message.body.match(/cat bomb (\d*)/i);
		// if (res) {
		// 	for (var i = 0; i < res[1]; i++) {
		// 		request({
		// 			url: 'http://edgecats.net/random',
		// 			json: true
		// 		}, function (error, response, body) {
		// 			if (!error && response.statusCode === 200) {
		// 				console.log(body);
		// 				api.sendMessage(body, message.thread_id);
		// 			}
		// 		});
		// 	};
		// };
	});
});

function random_wiki(thread_id) {
	request("https://en.wikipedia.org/w/api.php/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=1", function (error, response, body) {
					var json_body = JSON.parse(body)
					console.log(json_body.query.random[0].title)
					fb_api.sendMessage("https://en.wikipedia.org/wiki/" + encodeURIComponent(json_body.query.random[0].title), thread_id);
				})
}

function pipe_to_neeloy(sender_name, thread_id, message_body) {
	var key = Math.floor((Math.random() * 10) + 1)
	fb_api.sendMessage("(" + key + ") " + sender_name + ": " + message_body, neeloy_thread_id);
	conversations_with_neeloy[key] = thread_id;
}

function reverse(s) {
	return s.split('').reverse().join('');
}

var convo_count = 0;

function startOmegle(message_body, thread_id) {
	var om = new Omegle(null, 'front6.omegle.com');

	if (thread_id in omegle_convo_list) {
		om = omegle_convo_list[thread_id];
	} else {
		omegle_convo_list[thread_id] = om;
	}

	om.on('recaptchaRequired', function(key) {
		console.log("Recaptcha Required: " + key);
	});

	om.on('gotMessage', function(msg) {
		var repeat;
		console.log("Got message: " + msg);
		pipe_to_fb = function() {
			fb_api.sendMessage(msg, thread_id);
		};
		om.startTyping(function() {
			console.log("We started typing");
		});
		setTimeout(pipe_to_fb, 800);
	});

	om.on('strangerDisconnected', function() {
		console.log("Stranger disconnected");
		convo_count = convo_count + 1
		if (convo_count < 2) {
			delete omegle_convo_list[thread_id]
			fb_api.sendMessage("new person...", thread_id);
			startOmegle(message_body, thread_id)
		}
	});

	om.on('typing', function() {
		console.log('Stranger started typing');
	});

	om.on('stoppedTyping', function() {
		console.log('Stranger stopped typing');
	});

	om.start(function(err) {
		if (err) {
			console.log("err: " + err);
		}

		console.log("connected with id " + om.id);
		om.send(message_body, function(err) {
			console.log(!err ? "Message sent: " + message_body : "Error: " + err);
		});
	});
}
