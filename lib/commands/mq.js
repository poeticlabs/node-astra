// command: mq

module.exports = function ( data, args ) {

	data.command = 'get-machine-by-name.pl';

	var shell_args = [ data.command, args[0] ];

	var exec = require('child_process').exec;
	var child;

	console.log( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' );
	child = exec( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' , function (error, stdout, stderr) {

		console.log('stderr: ' + stderr);

		if ( stdout ) {
			var machine = {};
			var lines = stdout.split('\n');

			for ( var i = 0; i < lines.length; i++ ) {
				var temp = lines[i].split('|');
				machine[temp[0]] = temp[1];
			}

			data.response = machine['machine_id'] + ' > ' + machine['name'] + ' ~ (' + machine['label'] + ') \n';
			data.response += 'DC : ' + machine['datacenter'] + ' | Cage : ' + machine['cage'] + ' | Rack : ' + machine['rack'];
			data.response += ' | Pos : ' + machine['rack_position'] + ' (' + machine['rack_units'] + 'U) => ';
			data.response += machine['url'];
		} else {
			data.response = "Sorry, " + data.author + ", we did not find a machine called that.";
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
	mq: '!mq [machine_name]\n    Query Zerolag control for details about machine.'
}
