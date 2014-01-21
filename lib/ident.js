// command: ident

module.exports = function ( data, args ) {

	if ( ! sails.policies.isAdmin( data ) ) {
		return "I'm sorry " + data.author + ", I cannot do that.";
	}

	if ( args.length > 0 ) {

		Channel.findOne({

			pretty_name: args[0]

		}).done( function( err, chan ) {

			if ( err ) {
				console.log( JSON.stringify(err).error );
				data.response = JSON.stringify(err);
				sails.controllers.message.send( data );
				return;
			} else if ( chan ) {
				data.response = "That channel already exists, " + data.author;
				sails.controllers.message.send( data );
				return;
			}

			var channel_data = {};
			channel_data.pretty_name = args[0];

			if ( sails.config.enable_crossover_channel_creation == true ) {
				channel_data.irc = '#' + args[0];
				channel_data.xmpp = args[0];
			} else {
				if ( data.proto == 'irc' ) {
					channel_data.irc = '#' + args[0];
				} else if ( data.proto == 'xmpp' ) {
					channel_data.xmpp = args[0];
				}
			}

			Channel.create( channel_data ).done(function(err, chan) {

				if ( err ) {
					console.log( JSON.stringify(err).error );
					data.response = JSON.stringify(err).error;
					sails.controllers.message.send( data );
					return;
				} else {
					if ( chan.irc != null ) {
						sails.config.bootstrap.irc_client.join( chan.irc );
						sails.controllers.ircclient.send( data.author, "Please join the channel: " + chan.irc );
					}
					if ( chan.xmpp != null ) {
						sails.config.bootstrap.xmpp_client.send(
							new sails.config.bootstrap.xmpp_obj.Element('presence', {
								to: chan.xmpp + sails.config.xmpp.chat_domain  + '/' + sails.config.room_nick
							}).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxstanzas: 0, seconds: 1})
						);
						sails.config.bootstrap.xmpp_client.send(new sails.config.bootstrap.xmpp_obj.Element('message', { to: data.author + sails.config.xmpp.chat_domain, type: 'invite' }));
					}
				}

				data.response = "Channel created successfully, " + data.author;
				sails.controllers.message.send( data );
			});
		});

	} else {
		data.response = "Please provide a channel name to add, " + data.author;
		sails.controllers.message.send( data );
	}
}
