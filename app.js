var config = require('config.json')('./sample.json');
var login = require("facebook-chat-api");


// Create simple echo bot
login({email: config.fb_email, password: config.fb_password}, function callback (err, api) {
    if(err) return console.error(err);

    var participant_ids = [];
    var participant_names = [];

    api.listen(function callback(err, message) {
    	participant_names = message.participant_names;
    	participant_ids = message.participant_ids;

    	console.log(participant_ids);
    	console.log(participant_names);

    	for (var i = 0; i < participant_names.length; i++) {
    		var name = participant_names[i].toLowerCase();
    		console.log("name: " + name);

    		if (message.body.toLowerCase().indexOf("@" + name) >= 0) {
    			console.log("message: " + message.body);
    			var recipient_id = "";

    			for (var i = 0; i < participant_names.length; i++) {
    				console.log("participant_name: " + participant_names[i]);
    				if (participant_names[i].toLowerCase() == name) {
    					recipient_id = participant_ids[i];
    				}
    			}

    			api.sendMessage("You have a new message from " + message.sender_name + " in http://www.messenger.com/t/" + message.thread_id, recipient_id);
    		}
    	}

    	
        //api.sendMessage(message.body, message.thread_id);
    });
});