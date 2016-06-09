// command: uptime

module.exports = function ( data, args ) {

	// grep ": ::" logs/astra.error-0.log | tail -1 | awk -F':: ' '{print$NF}'

	data.command = "grep ': ::' /opt/astra/logs/astra.error-0.log | tail -1 | awk -F':: ' '{print$NF}'";

	var shell_args = [ data.command ];

	var exec = require('child_process').exec;
	var child;

	child = exec( shell_args.join(' '), function (error, stdout, stderr) {

		console.log('stderr: ' + stderr);

		if ( stdout ) {
			var last_restart = stdout.replace(/\n$/, '');
			var moment = require('moment');

			var a = moment( last_restart );
			var b = moment();
			var total_msecs = a.diff(b);

			data.response = 'Uptime: ' + moment.duration( total_msecs, 'milliseconds' ).humanize();
		} else {
			data.response = "Sorry, " + data.author + ", I wasn't able to determine the uptime.";
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
	uptime: '!uptime\n    Robot Uptime.'
}
