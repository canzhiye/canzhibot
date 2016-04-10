var config = require('config.json')('./sample.json');
var login = require("facebook-chat-api");

// Create simple echo bot
login({email: config.fb_email, password: config.fb_password}, function callback (err, api) {
	if(err) return console.error(err);

	api.setOptions({listenEvents: true});

	// remove Neeloy first 
	api.removeUserFromGroup("100001173039455", "988566704521094", function callback(err) {
		console.log("neeloy removed")
	});

	var interval = setInterval(function(thread_id, user_id) {
		api.addUserToGroup(user_id, thread_id, function callback(err) {
			console.log("neeloy temporarily added")
			api.removeUserFromGroup(user_id, thread_id, function callback(err) {
				console.log("neeloy removed")
			});
		});
	}, 30000, "988566704521094", "100001173039455");
});