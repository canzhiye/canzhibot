var config = require('config.json')('./sample.json');
var login = require("facebook-chat-api");

var fb_api;
var request = require("request");

var extensions = ["spotify", "giphy", "yelp"]

//100001173039455
//552293053
console.log(config.fb_email)
login({email: config.fb_email, password: config.fb_password}, function callback (err, api) {
	if(err) return console.error(err);

	fb_api = api

	api.listen(function callback(err, message) {
		var participant_ids = message.participant_ids;
		var participant_names = message.participant_names;

		console.log(participant_ids);
		console.log(participant_names);

		var e = contains_extension(String(message.body).toLowerCase())
		if (e.contains) {
			var extension = e.extension
			var msg = e.message

			var options = {
				url: "https://vast-dusk-6334.herokuapp.com/" + extension,
				method: "POST",
				json: {
				  "app" : extension,
				  "query" : msg,
			    "lat" : 42,
			    "lng" : 42,
			    "name" : "canzhi",
			    "extra" : ""
				}
			}
			request(options, (function (error, response, body) {
				if (!error) {
					console.log(body);
					switch(body.type) {
						case "image":
							for (var index in body.results) {
								var result = body.results[index];
								var m = result.image;
								if (result.title) {
									m = result.title + "\n" + m;
								}
								if (result.subtitle) {
									m += "\n" + result.subtitle;
								}
								if (result.description) {
									m += "\n" + result.description;
								}
								console.log("msg: " + m) 
								api.sendMessage(m, message.thread_id, function(err, obj) {
									if (err) {
										console.error(err.errorDescription);
									}
								});								
							}
							break;
						case "generic":
						default:
							for (var index in body.results) {
								var result = body.results[index];
								var m = result.title;
								if (result.subtitle) {
									m += "\n" + result.subtitle;
								}
								if (result.description) {
									m += "\n" + result.description;
								}
								m += "\n" + result.text;
								console.log("msg: " + m) 
								api.sendMessage(m, message.thread_id, function(err, obj) {
									if (err) {
										console.error("error: "+err.errorDescription);
									}
								});
							}
							break;
					}
				};
			}.bind(this)))
		}

		// these are first names only so there's gunna be some
		// logic errors with multiple people with the same name...
		if (participant_names.length > 2) {
			for (var i = 0; i < participant_names.length; i++) {
				var name = String(participant_names[i]).toLowerCase();
				// if @mention
				if (String(message.body).toLowerCase().indexOf("@" + name) >= 0) {
					console.log("message: " + message.body);
					var recipient_id = participant_ids[i];

					console.log("recipient_id: " + recipient_id);
					api.sendMessage("You have a new message from " + message.sender_name + " in http://www.messenger.com/t/" + message.thread_id, recipient_id);
				} 
			}
		} else {
			console.log("received message from: " + message.sender_name);				
			//api.sendMessage(reverse(message.body), message.thread_id);
		}

	});
});

function random_wiki(thread_id) {
	request("https://en.wikipedia.org/w/api.php/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=1", function (error, response, body) {
					var json_body = JSON.parse(body)
					console.log(json_body.query.random[0].title)
					fb_api.sendMessage("https://en.wikipedia.org/wiki/" + encodeURIComponent(json_body.query.random[0].title), thread_id);
				})
}

function reverse(s) {
	return s.split('').reverse().join('');
};

function contains_extension(message) {
	for (var i = 0; i < extensions.length; i++) {
		if (message.indexOf("/" + extensions[i]) >= 0) {
			message = message.split("/" + extensions[i])[1]
			return { "contains" : true, "message" : message, "extension" : extensions[i] }
		};
	} 
	return { "contains" : false, "message" : message }
}