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
							channel_data.xmpp = '140065_' + args[1];
						} else {
							if ( data.proto == 'irc' ) {
								channel_data.irc = '#' + args[1];
							} else if ( data.proto == 'xmpp' ) {
								channel_data.xmpp = '140065_' + args[1];
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

						// Add author to invite list
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
							// invite user
							sails.config.bootstrap.irc_client.send( 'invite', user.irc, chan.irc );
							setTimeout( function() { console.log( 'Setting ChanServ ACCESS for', user.irc) }, 1000 );
							// setting access level
							sails.config.bootstrap.irc_client.say( 'ChanServ', 'ACCESS ' + chan.irc + ' ADD ' + user.irc + ' 40');
							data.target = user.irc;
							data.response = "Please join the channel: " + chan.irc
							sails.controllers.ircclient.send( data.target, data.response );
						}

						if ( chan.xmpp != null ) {
							// invite user
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
				break; // case: del

			case 'outage':
				if ( sails.config.irc.enabled != false ) {
					sails.config.bootstrap.irc_client.join( '#' + args[1] );
				}
				if ( sails.config.xmpp.enabled != false ) {
					sails.config.bootstrap.xmpp_client.send(
						new sails.config.bootstrap.xmpp_obj.Element('presence', {
							to: '140065_' + args[1] + sails.config.xmpp.chat_domain  + '/' + sails.config.xmpp.local_alias
						}).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxstanzas: 0, seconds: 1})
					);
				}

				Identity.find( {
					where: {
						level: { '>': 0 },
					}
				}, function ( err, users) {
					if ( users == undefined ) {
						return;
					} else {						
						for ( var i = 0; i < users.length; i++ ) {
							if ( users[i] == undefined ) {
								console.log( 'warn:'.warn, 'users[i] is undefined' );
								continue;
							}

							if ( users[i].irc != null ) {
								if ( sails.config.irc.enabled != false ) {
									// invite user
									sails.config.bootstrap.irc_client.send( 'invite', users[i].irc, args[1] );
									setTimeout( function() { console.log( 'Setting ChanServ ACCESS for', users[i].irc) }, 1000 );
									// setting access level
									sails.config.bootstrap.irc_client.say( 'ChanServ', 'ACCESS ' + args[1] + ' ADD ' + users[i].irc + ' 40');
									data.target = users[i].irc;
									data.response = "Please join the channel: " + args[1]
									sails.controllers.ircclient.send( data.target, data.response );
								}
							}
							if ( users[i].xmpp != null ) {			
								if ( sails.config.xmpp.enabled != false ) {
									// invite user
									//setTimeout( function() {
										sails.config.bootstrap.xmpp_client.send(
											new sails.config.bootstrap.xmpp_obj.Element('message', {
												to: '140065_' + args[1] + sails.config.xmpp.chat_domain
											}).c('x', { xmlns:'http://jabber.org/protocol/muc#user' }).c('invite', {
												to: users[i].xmpp + '@' + sails.config.xmpp.host
											})
										);
									//}, 2000 );
								}
							}
						}
					}
				});

				break; // case: outage

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
	channel: '!channel [options] [params]\n    Chat channel command container.\n',
	add: '!channel add [channel_name] [[user],[user],...]\n    Add a channel, optionally with XO, (config setting.)\n'
	+ '    A note about the additional users: Only add users other than yourself, these are to be Admins/Ops; '
	+ 'IRC and XMPP usernames are supported.\n',
	del: '!channel del [channel_name]\n    Delete a channel from the internal database, and exit the channel.\n'
	+ '    Access lists and channel registration remains in existence at the chatserver level.\n',
	outage: '!channel outage [channel_name]\n    Temporarily join channel and invite everyone, (all non-customer identities.)\n'
	+ '    If you need a temp channel but don\'t want to invite others, use !join.\n'
}
