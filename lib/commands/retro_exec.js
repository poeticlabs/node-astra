// command: retro_exec
module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		var http = require('http');
		var line = args.join(' ');
		var chan = data.target.replace( /@.+/, '' );

		// Build the post string from an object
		var post_data = JSON.stringify(
			{ 'api_key':'33a78f2848dd9de657cb5488f7a234656072ffee', 'cmd':'api_passthru', 'args': [ chan.replace( /\d+_/, '' ), 'astra ' + line ], }
		);

		// An object of options to indicate where to post to
		var post_options = {
			host: 'hyperion.zerolag.com',
			port: '9999',
			path: '/astra/zcapi/',
			method: 'POST',
			headers: {
				'Content-Type': 'text/json',
				'Content-Length': post_data.length
			}
		};

		// Set up the request
		var post_req = http.request(post_options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log('Response: ' + chunk);
				data.response = chunk;
				sails.controllers.message.send( data );
				//return data;
			});
		});

		console.log( post_data );

		// post the data
		post_req.write(post_data);
		post_req.end();
//		data.response = "Not really sure if that worked or not, you may want to check the API 1.x delivery location, " + data.author;

	} else {
		data.response = "Please see !help retro_exec for more info on how to use this command, " + data.author;
		data.irc_color = 'red';
		data.xmpp_color = 'red';
		return data;
	}

	return data;
}

module.exports.help = {
	retro_exec: '!retro_exec [command] [args]\n    Run command via Astra 1.x, ** DEPRECATED **'
}
