// command: ticket

module.exports = function ( data, args ) {

	var cmd = 'rt';
	var ticket_lines = data.message.split('\n');
	var shell_args = [];

	if ( args.length > 0 ) {

		switch ( args[0] ) {

			case 'add':
				var ticket_body = '';
				shell_args = [ cmd, 'new', '-t', 'ticket', 'set' ];

				if ( args[1] != undefined ) {
					console.log( 'queue: ', args[1] );
					shell_args.push( "queue='" + args[1] + "'" );
				}

				for ( var i = 1; i < ticket_lines.length; i++ ) {
					var item = ticket_lines[i].match( /^([^ ]+):\s?(.+)$/ );

					console.log( 'examining...', ticket_lines[i] );

					if ( item != undefined ) {
						shell_args.push( item[1] + "='" + item[2] + "'" );
					} else {
						ticket_body += ticket_lines[i] + '\n';
					}
				
				}

				ticket_body = ticket_body.replace( "'", '&quot;' );
				ticket_body = ticket_body.replace( '"', '&quot;' );
				shell_args.push( "text='" + ticket_body.replace(/ $/, '') + "'" );

				if ( data.identity.support != null ) {
					shell_args.push( "set creator='" + data.identity.support + "'" );
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
							+ args[1] + "' AND Type = 'Comment' AND Creator = 95871\\\""
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
							+ args[1] + "' AND Type = 'Correspond' AND Creator = 95871\\\""
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
							+ args[1] + "' AND Type = '" + args[2] + "' AND Creator = 95871\\\" ;"
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
	ticket: '!ticket\t[options]\n\tSupport ticket interface container.\n',
	add: '!ticket\tadd [queue]\n\toption: value\n'
	+ '\t[ticket_body]\n\tAdd a new ticket, required options include subject and queue.\n',
	comment: '!ticket\tcomment [ticket_id]\n\t[comment_body]\n\tComment on an existing ticket.\n',
	reply: '!ticket\treply [ticket_id]\n\t[reply_body]\n\tReply to an existing ticket.\n',
	resolve: '!ticket\tresolve [ticket_id] comment|reply\n\t[comment_or_reply_body]\n\tResolve a ticket, optionally commenting or replying beforehand.'
}
