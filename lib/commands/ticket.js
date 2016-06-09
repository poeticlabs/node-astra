// command: ticket

module.exports = function ( data, args ) {

	var cmd = 'rt';
	var ticket_lines = data.message.split('\n');
	var shell_args = [];

	var ticket_fields = [
		'id', 'effectiveid', 'queue', 'type', 'issuestatement', 'resolution',
		'owner', 'subject', 'initialpriority', 'finalpriority', 'priority', 'timeestimated',
		'timeworked', 'status', 'timeleft', 'told', 'starts', 'started', 'due', 'resolved',
		'lastupdatedby', 'lastupdated', 'creator', 'created', 'disabled',

		'cf-6', 'cf-22',
	];

	if ( args.length > 0 ) {

		switch ( args[0] ) {

			case 'add':
				var ticket_body = '';
				shell_args = [ cmd, 'new', '-t', 'ticket', 'set' ];

				if ( args[1] != undefined ) {
					console.log( 'queue: ', args[1] );
					shell_args.push( "queue='" + args[1] + "'" );
				}

				// Ticket Lines
				for ( var i = 1; i < ticket_lines.length; i++ ) {
					var item = ticket_lines[i].match( /^([^ ]+):\s?(.+)$/ );
					var is_field = false;

					if ( item != undefined ) {
						// Ticket Fields
						for ( var j = 0; j < ticket_fields.length; j++ ) {
							if ( item[1] == ticket_fields[j] ) {
								is_field = true;
							}
						}

						if ( is_field == true ) {
							shell_args.push( item[1] + "='" + item[2] + "'" );
						} else {
							ticket_body += ticket_lines[i] + '\n';
						}
					} else {
						ticket_body += ticket_lines[i] + '\n';
					}
				
				}

				ticket_body = ticket_body.replace( "'", '&quot;' );
				ticket_body = ticket_body.replace( '"', '&quot;' );
				shell_args.push( "text='" + ticket_body.replace(/ $/, '') + "'" );

				if ( data.identity.support != null ) {
					shell_args.push( "add requestor='" + data.identity.support + "'" );
					shell_args.push( "del requestor='astra'" );
				}

				break; // case: add

			case 'comment':
				if ( ! args[1] ) {
					data.response = "Please provide a ticket id to comment on, " + data.author;
					data.irc_color = 'red';
					data.xmpp_color = 'red';	
					return data;
				}

				var comment_body = ticket_lines.splice(1).join('\n');
				shell_args = [ cmd, 'comment', '-m', "'" + comment_body + "'", args[1] ];

				var this_user = ( data.identity.support ) ? data.identity.support : sails.config.irc.username;
				var sql = "mysql -e \\\"select id from rt.Users where Users.Name = '" + this_user + "'\\\"";

				var exec = require('child_process').exec;
				var child;

				child = exec( 'ssh ' + sails.config.support.host + ' "' + sql + '"' , function (error, stdout, stderr) {
					console.log('stderr: ' + stderr);

					var uid = 95871; // astra

					if ( stdout ) {
						uid = stdout.split('\n')[1];
						shell_args.push ( "; mysql -e \\\"update rt.Transactions set Creator = '"
							+ uid + "' WHERE ObjectType = 'RT::Ticket' AND ObjectId = '"
							+ args[1] + "' AND Type = 'Comment' AND Creator = " + uid + "\\\""
						);
					}

					console.log ( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' );

					child = exec( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' , function (error, stdout, stderr) {

						console.log('stderr: ' + stderr);

						if ( stdout ) {
							data.response = stdout.replace(/\n$/, '');
							var match = data.response.match( /(\d\d\d\d\d?)/ );
							if ( match != null ) {
								data.response = data.response.replace( match[1], 'https://support.zerolag.com/rt/Ticket/Display.html?id=' + match[1] );
							}
						} else {
							data.response = "Sorry, " + data.author + ", something was not quite right about that.";
							data.irc_color = 'red';
							data.xmpp_color = 'red';
						}

						sails.controllers.message.send(data);

						if (error !== null) {
							console.log('exec error: ' + error);
						}
						return;
					});

					return;
				});

				return;
				break; // case: comment

			case 'hup':
				if ( ! args[1] ) {
					data.response = "Please provide a ticket id to reset reply notifications, " + data.author;
					data.irc_color = 'red';
					data.xmpp_color = 'red';
					return data;
				}

				var id = args[1];
				var cmd = "sed -i '/.*\\t" + id + ".*/d' /etc/harpy-reply.dat";

				var exec = require('child_process').exec;
				var child;

				child = exec( 'ssh ' + sails.config.support.host + ' "' + cmd + '"' , function (error, stdout, stderr) {
					console.log('stderr: ' + stderr);

					if ( stdout ) {
						data.response = "I received this: " + stdout;
					} else {
						data.response = "Ticket ID: " + id + " reply notifications reset successfully.";
					}

					if (error !== null) {
						console.log('exec error: ' + error);
					}

					sails.controllers.message.send(data);
					return;
				});

				return;
				break; // case: hup
			case 'reply':
				if ( ! args[1] ) {
					data.response = "Please provide a ticket id to reply to, " + data.author;
					data.irc_color = 'red';
					data.xmpp_color = 'red';
					return data;
				}

				var reply_body = ticket_lines.splice(1).join('\n');
				shell_args = [ cmd, 'correspond', '-m', "'" + reply_body + "'", args[1] ];

				var this_user = ( data.identity.support ) ? data.identity.support : sails.config.irc.username;
				var sql = "mysql -e \\\"select id from rt.Users where Users.Name = '" + this_user + "'\\\"";

				var exec = require('child_process').exec;
				var child;

				child = exec( 'ssh ' + sails.config.support.host + ' "' + sql + '"' , function (error, stdout, stderr) {
					console.log('stderr: ' + stderr);

					var uid = 95871; // astra

					if ( stdout ) {
						uid = stdout.split('\n')[1];
						shell_args.push ( "; mysql -e \\\"update rt.Transactions set Creator = '"
							+ uid + "' WHERE ObjectType = 'RT::Ticket' AND ObjectId = '"
							+ args[1] + "' AND Type = 'Correspond' AND Creator = " + uid + "\\\""
						);
					}

					child = exec( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' , function (error, stdout, stderr) {

						console.log('stderr: ' + stderr);

						if ( stdout ) {
							data.response = stdout.replace(/\n$/, '');
							var match = data.response.match( /(\d\d\d\d\d?)/ );
							if ( match != null ) {
								data.response = data.response.replace( match[1], 'https://support.zerolag.com/rt/Ticket/Display.html?id=' + match[1] );
							}
						} else {
							data.response = "Sorry, " + data.author + ", something was not quite right about that.";
							data.irc_color = 'red';
							data.xmpp_color = 'red';
						}

						sails.controllers.message.send(data);

						if (error !== null) {
							console.log('exec error: ' + error);
						}
						return;
					});

					return;
				});

				return;
				break; // case: reply

			case 'resolve':
				if ( ! args[1] ) {
					data.response = "Please provide a ticket id to resolve, " + data.author;
					data.irc_color = 'red';
					data.xmpp_color = 'red';
					return data;
				}

				var this_user = ( data.identity.support ) ? data.identity.support : sails.config.irc.username;
				var sql = "mysql -e \\\"select id from rt.Users where Users.Name = '" + this_user + "'\\\"";

				var exec = require('child_process').exec;
				var child;

				child = exec( 'ssh ' + sails.config.support.host + ' "' + sql + '"' , function (error, stdout, stderr) {
					console.log('stderr: ' + stderr);

					var uid = 95871; // astra

					if ( stdout ) {
						uid = stdout.split('\n')[1];
					}

					if ( args[2] != undefined ) {

						if ( args[2] == 'reply' ) {
							args[2] = 'correspond';
						}

						var reply_body = ticket_lines.splice(1).join('\n');
						shell_args = [ cmd, args[2], '-m', "'" + reply_body + "'", args[1] ];

						shell_args.push ( "; mysql -e \\\"update rt.Transactions set Creator = '"
							+ uid + "' WHERE ObjectType = 'RT::Ticket' AND ObjectId = '"
							+ args[1] + "' AND Type = '" + args[2] + "' AND Creator = " + uid + "\\\" ;"
						);

					}

					shell_args = shell_args.concat( [ cmd, 'resolve', args[1] ] );
					child = exec( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' , function (error, stdout, stderr) {

						console.log('stderr: ' + stderr);

						if ( stdout ) {
							data.response = stdout.replace(/\n$/, '');
							var match = data.response.match( /(\d\d\d\d\d?)/ );
							if ( match != null ) {
								data.response = data.response.replace( match[1], 'https://support.zerolag.com/rt/Ticket/Display.html?id=' + match[1] );
							}
						} else {
							data.response = "Sorry, " + data.author + ", something was not quite right about that.";
							data.irc_color = 'red';
							data.xmpp_color = 'red';
						}

						sails.controllers.message.send(data);

						if (error !== null) {
							console.log('exec error: ' + error);
						}

						return;
					});

					return;
				});

				return;
				break; // case: resolve

			default:
				data.response = "Sorry, " + data.author + ", " + args[0] + " is an unrecognized subcommand.\n"
				+ "Please see !help ticket for more info about how to use this command.";
				data.irc_color = 'red';
				data.xmpp_color = 'red';

				break; // case: default

		} // switch

		console.log( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' );

		/*
		*
		* CHILD.
		*
		*/

		var exec = require('child_process').exec;
		var child;

		child = exec( 'ssh ' + sails.config.support.host + ' "' + shell_args.join(' ') + '"' , function (error, stdout, stderr) {

			console.log('stderr: ' + stderr);

			if ( stdout ) {
				data.response = stdout.replace(/\n$/, '');
				var match = data.response.match( /(\d\d\d\d\d)/ );
				if ( match != null ) {
					data.response = data.response.replace( /\d\d\d\d\d/, 'https://support.zerolag.com/rt/Ticket/Display.html?id=' + match[1] );
				}
			} else {
				data.response = "Sorry, " + data.author + ", something was not quite right about that.";
				data.irc_color = 'red';
				data.xmpp_color = 'red';
			}

			sails.controllers.message.send(data);

			if (error !== null) {
				console.log('exec error: ' + error);
			}
		});

	} else {
		data.response = "Please see !help ticket for more info on how to use this command, " + data.author;
		data.irc_color = 'red';
		data.xmpp_color = 'red';
		return data;
	}

}

module.exports.help = {
	ticket: '!ticket [options]\n    Support ticket interface container.\n',
	add: '!ticket add [queue]\n    option: value\n'
	+ '    [ticket_body]\n    Add a new ticket, required options include subject and queue.\n',
	comment: '!ticket comment [ticket_id]\n    [comment_body]\n    Comment on an existing ticket.\n',
	hup: '!ticket hup [ticket_id]\n    Reset reply harpy notifications on this ticket.\n',
	reply: '!ticket reply [ticket_id]\n    [reply_body]\n    Reply to an existing ticket.\n',
	resolve: '!ticket resolve [ticket_id] comment|reply\n    [comment_or_reply_body]\n    Resolve a ticket, optionally commenting or replying beforehand.'
}
