// command: mode

module.exports = function ( data, args ) {

	var identee = {};

	if ( args.length > 0 ) {

		if ( args[0] == 'fml' ) {
			Mode.findOne( {
				ident: data.identity.id
			}, function ( err, mode ) {

				if ( mode ) {
					var array = mode.data.split('\n');
					array.pop();
					if ( array.length == 0 || array[0] == '' ) {
						mode.destroy( function (err) {
							data.response = "Mode updated.";
							sails.controllers.message.send( data );
						});
					} else {
						mode.data = array.join('\n');
						mode.save( function (err) {
							data.response = "Mode updated.";
							sails.controllers.message.send( data );
						});
					}
				} else {
					data.irc_color = 'red';
					data.xmpp_color = 'red';
					data.response = "Sorry, " + data.author + ", we didn't find any lines to forget.";
					sails.controllers.message.send( data );
				}
			});

			return;
		}

		Mode.findOne( {
			ident: data.identity.id
		}, function ( err, mode ) {

			if ( mode ) {
				data.response = "Sorry, " + data.author + ", you must complete your existing command before entering another mode.\n"
				+ "Enter more data or use !return to complete it and return to chat mode."
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				sails.controllers.message.send( data );
				return;
			} else {
				//new mode
				Mode.create( {
					ident: data.identity.id,
					data: '!' + args.join(' '),
				}).done( function( err, mode ) {
					if ( err ) {
						console.log( JSON.stringify(err).error );
						data.irc_color = 'red';
						data.xmpp_color = 'red';				
						data.response = JSON.stringify(err);
						sails.controllers.message.send( data );
					} else if ( mode ) {
						data.irc_color = 'green';
						data.xmpp_color = 'green';				
						data.response = "Mode " + args.join(' ') + " entered, use !return to finish.";
						sails.controllers.message.send( data );
						//
					} else {
						data.irc_color = 'red';
						data.xmpp_color = 'red';				
						data.response = "There was a problem, and I don't know what it was...";
						sails.controllers.message.send( data );
					}
				});
			}
		});

	} else {

		Mode.findOne( {
			ident: data.identity.id
		}, function ( err, mode ) {

			if ( mode ) {
				var mode_str = mode.data.split('\n').shift().replace('!','');
				data.response = "Current Mode: " + mode_str;
				sails.controllers.message.send( data );
				return;
			} else if ( err ) {
				console.log( JSON.stringify(err).error );
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				data.response = JSON.stringify(err);
				sails.controllers.message.send( data );
				return;
			} else {
				data.response = "You are already in chat mode, " + data.author;
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				sails.controllers.message.send( data );
				return;
			}

		});

	}

}

module.exports.help = {
	mode: '!mode\t[command] [sub]\n\tEnter Multi-line command entry mode.\n'
	+ '\tProvide no args to remember your current mode.\n'
	+ '\tUse !return to complete the command and return to chat mode.\n'
	+ '\tStart lines with % if you need to quickly chat without entering that line as data, (think comment.)\n',
	fml: '!mode\tfml\n\tForget My Last (line.)'
}
