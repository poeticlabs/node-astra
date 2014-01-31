// command: eq

module.exports = function ( data, args ) {

	data.command = 'get-emails-by-domain.pl';

	var shell_args = [ 'ssh SupportOhTwo', '"' + data.command + ' ' + args[0] + '"' ];

	var exec = require('child_process').exec;
	var child;

	console.log( shell_args.join(' ') );

	child = exec( shell_args.join(' '), function (error, stdout, stderr) {

		console.log('stderr: ' + stderr);

		if ( stdout ) {
			data.response = stdout.replace(/\n$/, '');
		} else {
			data.response = "Sorry, " + data.author + ", we did not find any email accounts for that domain.";
			data.irc_color = 'red';
			data.xmpp_color = 'red';
		}

		sails.controllers.message.send(data);

		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
	//sails.controllers.command.exec_ssh( data );
	return;
}

module.exports.help = {
	eq: '!eq\t[email_domain]\n\tQuery Zerolag control for email accounts matching domain.'
}