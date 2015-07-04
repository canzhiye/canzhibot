var config = require('config.json')('./sample.json');
var login = require("facebook-chat-api");
Omegle = require('omegle').Omegle;

var fb_api;
var omegle_convo_list = {};
var request = require("request");

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
			} else {
				console.log("received message from: " + message.sender_name);
				// it's not ready yet....
				//startOmegle(message.body, message.thread_id);
				//api.sendMessage(reverse(message.body), message.thread_id);
			}
		};

		// cat bombs
		// USAGE `cat bomb DIGIT`
		// this sends a cat GIF DIGIT times
		var res = message.body.match(/cat bomb (\d*)/i);
		if (res) {
			for (var i = 0; i < res[1]; i++) {
				request({
					url: 'http://edgecats.net/random',
					json: true
				}, function (error, response, body) {
					if (!error && response.statusCode === 200) {
						console.log(body);
						api.sendMessage(body, message.thread_id);
					}
				});
			};
		};
	});
});

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
