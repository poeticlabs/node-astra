/**
 * MessageController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var moment = require('moment');

module.exports = {

		/**
		* Action blueprints:
		*    `/message/process`
		*/
		process: function ( params ) {

			var data_obj = require(sails.config.libpath + '/data_object_config');
			var data = extend( {}, data_obj, params );

			// If you are who you say you are...
			async.waterfall( [

				function(callback) {

					Identity.findOne( {

						where: {
							or: [ {irc: data.author}, {xmpp: data.author}, {nick: data.author} ]
						}

					}, function(err, user) {

						if ( user ) {
							if ( user.level == null ) {
								user.level = 0;
							};
							data.identified = true;
							data.identity = user;
						}

						if ( data.identified == true ) {
							for ( var i = 0; i < sails.config.ranks.length; i++ ) {
								var rank = sails.config.ranks[i];
								if ( data.identity.level <= rank.max_level && data.identity.level >= rank.min_level ) {
									data.allowed_cmds = data.allowed_cmds.concat( rank.allowed_cmds );
									data.identity.rank = i;
									data.identity.rankname = rank.name;
								} else if ( data.identity.level > rank.max_level ) {
									data.allowed_cmds = data.allowed_cmds.concat( rank.allowed_cmds );
									data.identity.rank = i;
									data.identity.rankname = rank.name;
								}
							}

							// Disable Nicks for now (HC)
							//if ( data.identity.nick != null ) {
							//	data.author = data.identity.nick;
							//}

						} else {
							data.allowed_cmds = data.allowed_cmds.concat( sails.config.ranks[0].allowed_cmds );
							data.identity.rank = 0;
							data.identity.rankname = sails.config.ranks[0].name;
						}

						callback( null, data );

					});
				}

			], function ( err, data ) {

				// Process buddy junk right away and bail
				// Buddies must be Ident and >= rank 1 (Staff)
				if ( data.type == 'subscribe' ) {
					sails.controllers.xmppclient.subscribe( data );
					return;
				}

				if ( err ) {
					data.response = err;
					data.irc_color = 'red';
					data.xmpp_color = 'red';
					return;
				}

				if ( data.type === 'chat' ) {
					if ( data.author != 'api' ) {
						data.target = data.author;
					}
				}

				// decide if this is a command or what
				var cmd_syntax = new RegExp( '^' + sails.config.cmd_shcut + '([\s]*[a-z0-9\_\-]+)' );
				var cmd = data.message.match( cmd_syntax );

				if ( cmd != null ) {

					if ( cmd[1] == '?' ) {
						cmd[1] = 'retro_exec';
					}

					//console.log( "Trying to run command: " + cmd[1] );
					data.command = cmd[1];

					if ( data.allowed_cmds.indexOf( data.command ) > -1
						|| data.author == 'api'
						|| data.command == 'ident' ) {
						// concat data object
						data = extend( {}, data, sails.controllers.command.exec ( data ) );
					} else {
						var message = sails.config.noauth_array[Math.floor(Math.random()*sails.config.noauth_array.length)];
						data.response = message.replace( '%AUTHOR%', data.author );
						data.irc_color = 'red';
						data.xmpp_color = 'red';
					}

				} else {

					// Process any open modes if cmd == null
					if ( ! data.message.match( /^\%/ ) ) {
						Mode.findOne( {
							ident: data.identity.id
						}, function ( err, mode ) {
							if ( mode ) {
								mode.data += '\n' + data.message;
								mode.save( function(err) {
									return; // Do not XO !mode append/concat
								});
							}
						});
					}
				}

				// API is calling for the data to be returned
				// rather than sent to a channel
				if ( data.author == 'api' ) {
					if ( data.target == 'return' ) {
						return data.response;
					}
				}

				// data.response set before this point.

				// do normal response if required
				if ( data.response != null ) {

					if ( data.proto == 'all' ) {
						// Only API calls get here
						if ( sails.config.irc.enabled == true ) {
							data.proto = 'irc';
							data.target = '#' + data.target.replace('#', '');
							sails.controllers.message.send( data );
						}

						// XMPP portion
						if ( sails.config.xmpp.enabled == true ) {
							data.proto = 'xmpp';
							data.target = sails.config.xmpp_prefix + data.target.replace('#','') + sails.config.xmpp.chat_domain;
							sails.controllers.message.send( data );
						}

						return;
					}

					// Private Message
					//if ( to.match( new RegExp( sails.config.xmpp.local_alias + "|" + sails.config.irc.username, 'i') ) ) {
					if ( data.type === 'chat' ) {
						if ( data.author != 'api' ) {
							data.target = data.author;
						}
					}

					if ( sails.config.irc.enabled == true || sails.config.xmpp.enabled == true ) {
						sails.controllers.message.send( data );
					}
				} else {
					// Client Response Notification
					var ignore_this = sails.config.client_response_ignore_channels.join('|');
					ignore_this = '/' + ignore_this + '/';

					if ( (
							// Skip these People ...
							data.author != 'Alias' &&
							data.author != 'Auto Bot' &&
							data.author != 'Backups' &&
							data.author != 'GitLab' &&
							data.author != 'Linky' &&
							data.author != 'PagerDuty' &&
							data.author != 'QOTD' &&

							// ... and these Channels/Rooms
							! data.target.match( ignore_this )

						) && ( data.identity.rank == 0 || data.identified == false ) ) {

						// a customer
						if ( data.author == 'Relay' ) {
							var user = data.message.split(':');
							data.author = user[0];
						}

						ClientResponse.findOne( {
							where: { channel: data.target }
						}, function (err, chan) {
							if ( err ) {
								console.log( JSON.stringify(err).error );
							} else if ( chan == undefined ) {
								// create record
								ClientResponse.create( { channel: data.target } ).done(function(err, chan) {
									if ( err ) {
										console.log( JSON.stringify(err).error );
									}
								});

								// notify
								data.target = data.target.replace(sails.config.xmpp_prefix,'');
								data.response = "(failed) [CLIENT_RESPONSE] Activity in room " + data.target + " by Client " + data.author;
								data.response += " at " + moment().format('h:mm:ss a');
								data.target = sails.config.xmpp_prefix + sails.config.default_channel + sails.config.xmpp.chat_domain;
								sails.controllers.message.send( data );
							} else {
								var a = moment().utc().local();
								var b = moment.utc(chan.createdAt + 'Z').local();
								var total_msecs = a.diff(b);

								var n_timer = 5 * 60 * 1000; // 5m milliseconds

								if ( total_msecs >= n_timer ) {
									// notify
									data.target = data.target.replace(sails.config.xmpp_prefix,'');
									data.response = "(failed) [CLIENT_RESPONSE] Activity in room " + data.target + " by Client " + data.author;
									data.response += " at " + moment().format('h:mm:ss a');
									data.target = sails.config.xmpp_prefix + sails.config.default_channel + sails.config.xmpp.chat_domain;
									sails.controllers.message.send( data );
								}
							}
						} );

					} else {
						// delete record when employee speaks
						ClientResponse.destroy( {
							where: { channel: data.target }
						}, function (err, chan) {
							if ( err ) {
								console.log( JSON.stringify(err).error );
							}
						});
					}
				}

				// Crossover
				if ( sails.config.enable_crossover == true
					&& cmd == null && data.type != 'chat' && data.author != 'api' ) {
					// response should only == message if
					// 1. this is not a command
					// 2. crossover is enabled
					// 3. the protocol is flipped
					// 4. this is not a PM/IM /whisper (irc:PRIVMSG->nick, xmpp:type=chat)

					data.response = data.message;

					if ( data.type == 'presence' ) {
						data.irc_color = 'grey';
						data.xmpp_color = 'grey';
						data.type = 'groupchat';
					}

					if ( data.proto == 'irc' && sails.config.xmpp.enabled == true ) {
						data.proto = 'xmpp';
						data.target = data.target.replace( '#', '');

						data.response = sails.config.irc.crossover_prefix + data.author + sails.config.irc.message_delimiter + data.message
						console.log( "XO:".verbose, data.proto.warn, data.author, "=>", data.target );

					} else if ( data.proto == 'xmpp' && sails.config.irc.enabled == true ) {
						data.proto = 'irc';
						data.target = data.target.replace( /@.+/, '' );

						data.response = sails.config.xmpp.crossover_prefix + data.author + sails.config.xmpp.message_delimiter + data.message
						console.log( "XO:".verbose, data.proto, data.author, "=>", data.target );
					}

					if ( data.target ) {
						sails.controllers.message.send( data );
					}

				}

			}); // async.waterfall

		},

		/**
		* Action blueprints:
		*    `/message/send`
		*/
		send: function ( data ) {
			if ( data.proto == 'irc' ) {
				// IRC
				if ( data.type == 'groupchat' ) {
					data.target = '#' + data.target.replace( '#', '');
				}
				sails.controllers.ircclient.send ( data );

			} else if ( data.proto == 'xmpp' ) {
				// XMPP
				if ( data.type == 'chat' ) {
					data.target = data.target.replace( '@' + sails.config.xmpp.host, '' ).replace( sails.config.xmpp.chat_domain, '' );
					data.target += '@' + sails.config.xmpp.host;
				} else {
					data.target = data.target.replace( sails.config.xmpp.chat_domain, '' ).replace( '@' + sails.config.xmpp.host, '' );
					data.target += sails.config.xmpp.chat_domain;
				}
				sails.controllers.xmppclient.send ( data );
			}
			return;
		},

	/**
	* Overrides for the settings in `config/controllers.js`
	* (specific to MessageController)
	*/
	_config: {}

};

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
