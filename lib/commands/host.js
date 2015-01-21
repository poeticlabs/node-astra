// command: host

module.exports = function ( data, args ) {
	var sys = require('sys')
	var exec = require('child_process').exec;
	var child;

	if ( args.length == 0 ) {
		args[0] = 'localhost';
	}

	data.response = '';

	// executes `cmd`
	child = exec("host " + args[0], function (error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (error != null) {
			console.log('exec error: ' + error);
		}

		if ( stderr != "" ) {
			//data.response = JSON.stringify(stderr);
			data.response = stderr;
			data.irc_color = 'red';
			data.xmpp_color = 'red';
		} else if (stdout != "" ) {
			//data.response = JSON.stringify(stdout);
			data.response = stdout;
		} else {
			data.response = "Sorry, " + data.author + ", but there was no response.";
		}

		sails.controllers.message.send(data);

	});

	return;
}

module.exports.help = {
	host: '!host [host]\n    Provide a partial or FQDN or IP address to foward/reverse lookup.'
}
