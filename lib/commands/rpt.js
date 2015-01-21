// command: rpt

module.exports = function ( data, args ) {

	data.command = "harpy_rt.pl ";
	var lines = data.message.split('\n');
    var first_line = lines.pop(0);

	var addr_str = '',
		queues_str = '',
		company_str = '',
		users_str = '',
		time_str = '',
 		period_str = '',
		sort_str = '',
		filter_str = '',
		verbose_str = '';

	for ( var i = 0; i < args.length; i++ ) {
		var elems = args[i].split(':');
			if ( elems.length > 0 ) {
				if ( elems[0] == 'q' ) {
					params.queues_str = elems[1];
				} else if ( elems[0] == 'c' ) {
					params.company_str = elems[1];
				} else if ( elems[0] == 'e' ) {
					params.addr_str = elems[1];
				} else if ( elems[0] == 'f' ) {
					params.filter_str = elems[1];
				} else if ( elems[0] == 'o' ) {
					params.users_str = elems[1];
				} else if ( elems[0] == 't' ) {
					params.time_str = elems[1];
				} else if ( elems[0] == 'p' ) {
					params.period_str = elems[1];
				} else if ( elems[0] == 's' ) {
					params.sort_str = elems[1];
				} else if ( elems[0] == 'v' ) {
					params.verbose_str = elems[1];
				}
			}
	}

	for ( var i = 0; i < lines.length; i++ ) {
		var reg = /set ([\w\-]+):[\s](.+)/;
		var match = reg.exec( lines[i] );
		while ( match != null ) {
			var key = match[1];

                                        if param == 'queue':
                                                queues_str += m.group(2) + ','
                                        elif param == 'company':
                                                company_str += m.group(2) + ','
                                        elif param == 'email':
                                                addr_str = m.group(2)
                                        elif param == 'filter':
                                                filter_str = m.group(2)
                                        elif param == 'owner':
                                                users_str += m.group(2) + ','
                                        elif param == 'time':
                                                time_str = m.group(2)
                                        elif param == 'period':
                                                period_str = m.group(2)
                                        elif param == 'sort':
                                                sort_str = m.group(2)
                                        elif param == 'verbose':
                                                verbose_str = ' -v'

                        cmd += "-q '" + queues_str.rstrip(',') + "' "
                        cmd += "-c '" + company_str.rstrip(',') + "' "
                        cmd += "-o '" + users_str.rstrip(',') + "' "
                        cmd += "-p '" + period_str + "' "
                        cmd += "-t '" + time_str + "' "
                        cmd += "-s '" + sort_str + "' "
                        cmd += "-f '" + filter_str + "' "
                        cmd += "-e '" + Astra.stripml( addr_str ) + "' "
                        cmd += verbose_str


	data.command = 'get-machine-by-name.pl';

	var shell_args = [ 'ssh SupportOhTwo', '"' + data.command + ' ' + args[0] + '"' ];

	var exec = require('child_process').exec;
	var child;

	console.log( shell_args.join(' ') );

	child = exec( shell_args.join(' '), function (error, stdout, stderr) {

		console.log('stderr: ' + stderr);

		if ( stdout ) {
			var machine = {};
			var lines = stdout.split('\n');

			for ( var i = 0; i < lines.length; i++ ) {
				var temp = lines[i].split('|');
				machine[temp[0]] = temp[1];
			}

			data.response = machine['machine_id'] + ' > ' + machine['name'] + ' ~ (' + machine['label'] + ') \n';
			data.response += 'DC: ' + machine['datacenter'] + ' | Cage: ' + machine['cage'] + ' | Rack: ' + machine['rack'];
			data.response += ' | Pos: ' + machine['rack_position'] + ' (' + machine['rack_units'] + 'U) => ';
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
	rpt: '!rpt [options]\n    More info here later.'
}
