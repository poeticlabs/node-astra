// command: channel

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		switch ( args[0] ) {

			case 'add':

				async.waterfall( [

					function(callback){
						// LookUp Channel
						Channel.findOne( { pretty_name: args[1] }, function( err, channel ) {
							if ( channel != undefined ) {
								err = 'Sorry, ' + data.author + ', there is already a channel called that.';
							}
							callback( err, channel );
						});
					},
					function(channel, callback){
						// Add Channel to DB
						var channel_data = {};
						channel_data.pretty_name = args[1];

						if ( sails.config.enable_crossover_channel_creation == true ) {
							channel_data.irc = '#' + args[1];
							channel_data.xmpp = args[1];
						} else {
							if ( data.proto == 'irc' ) {
								channel_data.irc = '#' + args[1];
							} else if ( data.proto == 'xmpp' ) {
								channel_data.xmpp = args[1];
							}
						}

						Channel.create( channel_data ).done( function(err,chan) {
							callback( err, chan );
						});
					},
					function(chan, callback) {
						// Actually join the channel
						if ( chan == null ) {
							callback( 'There was a problem adding the channel, ' + data.author, null );
						}

						var list = [ data.author ].concat( args.splice(2) );

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

						data.response = "Channel added successfully.";
						sails.controllers.message.send( data );

						for ( var i = 0; i < list.length; i++ ) {
							Identity.findOne( {
								where: {
									or: [ {irc: list[i]}, {xmpp: list[i]}, {nick: list[i]} ]
								}
							}, function ( err, user) {
								callback ( err, chan, user );
							});
						}

					},
					function(chan, user, callback) {
						// Add members / OP them, etc.

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

						callback(null,null);

					}

				], function (err, result) {
					if ( err ) {
						data.response = err;
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						sails.controllers.message.send( data );
						return;
					}
					data.response = result;
					sails.controllers.message.send( data );
				});

				break; // case: add

			case 'del':
				Channel.findOne( { pretty_name: args[1] }, function( err, chan ) {
					if ( chan == undefined ) {
						data.response = 'Sorry, ' + data.author + ', there is no channel called that.';
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						sails.controllers.message.send( data );
					} else {
						if ( chan.irc != null ) {
							sails.config.bootstrap.irc_client.part( chan.irc, 'Adìos!' );
						}
						if ( chan.xmpp != null ) {
							sails.config.bootstrap.xmpp_client.send(
								new sails.config.bootstrap.xmpp_obj.Element('presence', {
									to: chan.xmpp + sails.config.xmpp.chat_domain  + '/' + sails.config.xmpp.local_alias,
									type: 'unavailable'
								}).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxstanzas: 0, seconds: 1})
							);
						}
						chan.destroy( function(err) {
							data.response = 'Channel-splosion!';
							sails.controllers.message.send( data );
						});
					}
				});
				// blah
				break;

		} // switch

	} else {
		var target = data.target.replace( '#', '' );
		target = target.replace( sails.config.xmpp.chat_domain, '' );

		async.waterfall( [
			function(callback) {
				Channel.findOne( { or: [ {pretty_name: target}, {irc: target}, {xmpp: target} ] }, function( err, channel ) {
					if ( channel == undefined ) {
						err = 'Sorry, ' + data.author + ', I have no idea which channel this is.';
					}
					callback( err, channel );
				});
			}
		], function(err, channel) {
			if ( err ) {
				data.response = err;
				data.irc_color = 'red';
				data.xmpp_color = 'red';
			} else {
				data.response = JSON.stringify(channel);
			}

			sails.controllers.message.send( data );
			return;
		});

	}

}

module.exports.help = {
	channel: '!channel\t[options] [params]\n\tChat channel command container.\n',
	add: '!channel\tadd [channel_name] [[user],[user],...]\n\tAdd a channel, optionally with XO, (config setting.)\n'
	+ '\tA note about the additional users: Only add users other than yourself, these are to be Admins/Ops; '
	+ 'IRC and XMPP usernames are supported.\n',
	del: '!channel\tdel [channel_name]\n\tDelete a channel from the internal database, and exit the channel.\n'
	+ '\tAccess lists and channel registration remains in existence at the chatserver level.'
}
