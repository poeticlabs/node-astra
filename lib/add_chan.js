// command: add_chan

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		Channel.findOne({

			pretty_name: args[0]

		}).done( function( err, chan ) {

			if ( err ) {
				console.log( JSON.stringify(err).error );
				data.response = JSON.stringify(err);
				sails.controllers.message.send( data );
			} else if ( chan ) {
				data.response = "That channel already exists, " + data.author;
				sails.controllers.message.send( data );
			} else {

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
					} else {

						var memberlist = [ data.author ];
						memberlist = memberlist.concat( args.splice(1) );

						if ( chan.irc != null ) {
							// join
							sails.config.bootstrap.irc_client.join( chan.irc );
							// register
							sails.config.bootstrap.irc_client.say( 'ChanServ', 'REGISTER ' + chan.irc + ' ' + sails.config.irc.password );
						}

						if ( chan.xmpp != null ) {
							// join & register
							sails.config.bootstrap.xmpp_client.send(
								new sails.config.bootstrap.xmpp_obj.Element('presence', {
									to: chan.xmpp + sails.config.xmpp.chat_domain  + '/' + sails.config.xmpp.local_alias
								}).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxstanzas: 0, seconds: 1})
							);
						}

						for ( var i = 0; i < memberlist.length; i++ ) {
							Identity.findOne( {
								where: {
									or: [ {irc: memberlist[i]}, {xmpp: memberlist[i]}, {nick: memberlist[i]} ]
								}
							}, function ( err, user ) {

								if ( ! user ) {
									console.log ( 'No user found for ' + memberlist[i] );
									return;
								}

								if ( chan.irc != null ) {
									// invite author
									sails.config.bootstrap.irc_client.send( 'invite', user.irc, chan.irc );
									setTimeout( function() { console.log( 'Setting ChanServ ACCESS for', user.irc) }, 1000 );
									// setting access level
									sails.config.bootstrap.irc_client.say( 'ChanServ', 'ACCESS ' + chan.irc + ' ADD ' + user.irc + ' 40');
									sails.controllers.ircclient.send( user.irc, "Please join the channel: " + chan.irc );
								}

								if ( chan.xmpp != null ) {
									// invite author
									setTimeout( function() {
										sails.config.bootstrap.xmpp_client.send(
											new sails.config.bootstrap.xmpp_obj.Element('message', {
												to: chan.xmpp + sails.config.xmpp.chat_domain
											}).c('x', { xmlns:'http://jabber.org/protocol/muc#user' }).c('invite', {
												to: user.xmpp + '@' + sails.config.xmpp.host
											})
										);
									}, 2000 );

									setTimeout( function() { console.log( 'Setting AFFILIATION for', user.xmpp) }, 1000 );
									// setting conf affiliation/role
									sails.config.bootstrap.xmpp_client.send(
										new sails.config.bootstrap.xmpp_obj.Element('iq', {
											from: sails.config.xmpp.username + '@' + sails.config.xmpp.host,
											to: chan.xmpp + sails.config.xmpp.chat_domain, type: 'set'
										}).c('query', { xmlns:'http://jabber.org/protocol/muc#admin' })
										.c('item', { affiliation:'admin', jid: user.xmpp + '@' + sails.config.xmpp.host, nick: user.xmpp })
									);

								}

							});

						}

						data.response = "Channel created successfully, " + data.author;
						sails.controllers.message.send( data );
					}
				});
			}
		});

	} else {
		return "Please provide a channel name to add, " + data.author;
	}
}

module.exports.help = {
	add_chan: '!add_chan\t[channel_name] [[user],[user],...]\n\tAdd a channel, optionally with XO, (config setting.)\n'
	+ '\tA note about the additional users: Only add users other than yourself, these are to be Admins/Ops.\n'
	+ '\tBoth IRC and XMPP usernames are supported.'
}
