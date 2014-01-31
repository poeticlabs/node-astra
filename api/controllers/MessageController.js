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

module.exports = ( function() {

	return {
		/**
		* Action blueprints:
		*    `/message/process`
		*/
		process: function ( params ) {

			var data_obj = require(sails.config.libpath + '/data_object_config');
			var data = extend( {}, data_obj, params );

			// Ignore Self
			if ( data.author.match( new RegExp( sails.config.xmpp.local_alias + "|" + sails.config.irc.username, 'i') ) ) {
				next();
			}

			// If you are who you say you are...
			Identity.findOne( {
				where: {
					or: [ {irc: data.author}, {xmpp: data.author}, {nick: data.author} ]
				}
			}, function ( err, user ) {

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
				} else {
					data.allowed_cmds = data.allowed_cmds.concat( sails.config.ranks[0].allowed_cmds );
					data.identity.rank = 0;
					data.identity.rankname = sails.config.ranks[0].name;
				}

				// Process buddy junk right away and bail
				// Buddies must be Ident and >= rank 1 (Staff)
				if ( data.type === 'subscribe' ) {
					sails.controllers.xmppclient.subscribe( data );
					return;
				}

				// decide if this is a command or what
				var cmd_syntax = new RegExp( '^' + sails.config.cmd_shcut + '([a-z0-9\_\-]+)' );
				var cmd = data.message.match( cmd_syntax );

				if ( cmd != null ) {
					console.log( "Trying to run command: " + cmd[1] );
					data.command = cmd[1];
					if ( data.allowed_cmds.indexOf( data.command ) > -1
						|| data.author == 'api'
						|| data.command == 'ident' ) {
						// concat data object
						data = extend( {}, data, sails.controllers.command.exec ( data ) );
					} else {
						data.response = "Sorry, " + data.author + ", you are not allowed to do that.";
						data.irc_color = 'red';
						data.xmpp_color = 'red';
					}
				}

				// API is calling for the data to be returned
				// rather than sent to a channel
				if ( data.author == 'api' ) {
					if ( data.target == 'return' ) {
						return data.response;
					}
				}

				// do normal response if required
				if ( data.response != null ) {

					if ( data.proto == 'all' ) {
						// Only API calls get here
						data.proto = 'irc';
						data.target = '#' + data.target.replace('#', '');
						sails.controllers.message.send( data );

						// XMPP portion
						data.proto = 'xmpp';
						data.target = data.target.replace('#','') + sails.config.xmpp.chat_domain;
						sails.controllers.message.send( data );
						return;
					}

					// Private Message
					//if ( to.match( new RegExp( sails.config.xmpp.local_alias + "|" + sails.config.irc.username, 'i') ) ) {
					if ( data.type === 'chat' ) {
						data.target = data.author;
					}

					sails.controllers.message.send( data );
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

					if ( data.proto == 'irc' ) {
						data.proto = 'xmpp';
						data.target = data.target.replace( '#', '');
						data.target = data.target + sails.config.xmpp.chat_domain;

						data.response = sails.config.irc.crossover_prefix + data.author + sails.config.irc.message_delimiter + data.message
						console.log( "XO:".verbose, data.proto.warn, data.target, "=>", data.target );

					} else if ( data.proto == 'xmpp' ) {
						data.proto = 'irc';
						data.target = data.target.replace( sails.config.xmpp.chat_domain, '');
						data.author = data.author.replace( new RegExp('^.+/', 'i'), '' );
						data.target = data.target.replace( new RegExp('@.+', 'i'), '' );
						data.target = '#' + data.target;

						data.response = sails.config.xmpp.crossover_prefix + data.author + sails.config.xmpp.message_delimiter + data.message
						console.log( "XO:".verbose, data.proto, data.author, "=>", data.target );
					}

					if ( data.target ) {
						sails.controllers.message.send( data );
					}

				}

			}); // Identity.findOne().callback

		},

		/**
		* Action blueprints:
		*    `/message/send`
		*/
		send: function ( data ) {

			if ( data.proto == 'irc' ) {
				// IRC
				sails.controllers.ircclient.send ( data );

			} else if ( data.proto == 'xmpp' ) {
				// send response XMPP
				sails.controllers.xmppclient.send ( data );
			}

			return;

		},

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

	/**
	* Overrides for the settings in `config/controllers.js`
	* (specific to MessageController)
	*/
	_config: {}

} )();
