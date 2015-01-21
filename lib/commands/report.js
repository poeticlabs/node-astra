// command: report

module.exports = function ( data, args ) {

	var exec = require('child_process').exec;
	var shell_args = [];

	if ( args.length > 2 ) {

		switch ( args[0] ) {

			case 'queue':
				var cmd = 'harpy_rt_queues.pl';
				async.waterfall( [
					function(callback) {
						data.response = '~ ' + args[1].charAt(0).toUpperCase() + args[1].slice(1) + ' ~\n';
						data.response += '                         ' + ' Total(UN) | UN | RESOLVED';
						sails.controllers.message.send( data );

						shell_args = [ cmd, args[1], args[2] ];

						var child = exec( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' , function (error, stdout, stderr) {
							console.log('stderr: ' + stderr);
							if ( stdout ) {
								callback(null, stdout);
							}
						});

					}
				], function ( err, result ) {
					if ( err ) {
						data.response = err;
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						sails.controllers.message.send( data );
						return;
					}
					data.response = result.replace(/\n$/, '');
					sails.controllers.message.send( data );
				});

				break;

			case 'team':
				var cmd = 'harpy_rt_report.pl';
				async.waterfall( [
					function(callback) {
						data.response = '~ ' + args[1].charAt(0).toUpperCase() + args[1].slice(1) + ' ~\n';
						data.response += '      ' + ' Total(UN) | UN | RESOLVED';
						sails.controllers.message.send( data );

						Membership.find({ team: args[1] }).done( function(err, teams) {
							if ( teams == undefined ) {
								err = "Sorry, " + data.author + ", we found no team called that.";
							}
							for ( var i = 0; i < teams.length; i++ ) {
								callback(err, teams[i]);
							}
						});
					},
					function(team, callback) {
						Identity.findOne( { id: team.ident }, function(err,user) {
							if ( user ) {
								callback(null, team, user.support);
							}
						});
					},
					function(team, user, callback) {
						shell_args = [ cmd, user, args[2] ];
						var child = exec( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' , function (error, stdout, stderr) {
							console.log('stderr: ' + stderr);
							if ( stdout ) {
								callback(null, stdout);
							}
						});

					}
				], function ( err, result ) {
					if ( err ) {
						data.response = err;
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						sails.controllers.message.send( data );
						return;
					}
					data.response = result.replace(/\n$/, '');
					sails.controllers.message.send( data );
				});

				break;

			case 'user':
				var cmd = 'harpy_rt_report.pl';
				async.waterfall( [
					function(callback) {
						data.response = '    ' + ' Total(UN) | UN | RESOLVED';
						sails.controllers.message.send( data );

						shell_args = [ cmd, args[1], args[2] ];

						var child = exec( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' , function (error, stdout, stderr) {
							console.log('stderr: ' + stderr);
							if ( stdout ) {
								callback(null, stdout);
							}
						});

					}
				], function ( err, result ) {
					if ( err ) {
						data.response = err;
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						sails.controllers.message.send( data );
						return;
					}
					data.response = result.replace(/\n$/, '');
					sails.controllers.message.send( data );
				});

				break;

		} // switch

	} else {
		data.response = "Please see !help report for more info on how to use this command, " + data.author;
		data.irc_color = 'red';
		data.xmpp_color = 'red';
		return data;
	}

}

module.exports.help = {
	report: '!report [options]\n    Reports interface container.\n',
	team: '!report team [team] [period]\n    Report support ticket stats for [team] over [period].\n',
	queue: '!report queue [queue] [period]\n    Report support ticket stats for [queue] over [period].\n',
	user: '!report user [support_user] [period]\n    Report support ticket stats for [support_user] over [period].'
}
