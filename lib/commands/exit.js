// command: exit

module.exports = function ( data, args ) {
	var sys = require('sys')
	var exec = require('child_process').exec;
	var child;

	data.response = 'So long and thanks for all the bits!';
	data.irc_color = 'rainbow';
	data.xmpp_color = 'pink';
//	sails.controllers.message.send(data);
	console.log( "Exiting...".rainbow );

	// executes `pm2 stop astra`
	child = exec("pm2 stop astra", function (error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});

	return null; // if possible
}

module.exports.help = {
	exit: '!exit\n    Exit Program!'
}
