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

module.exports = {

	/**
	* Action blueprints:
	*    `/message/process`
	*/
	process: function ( proto, type, from, to, message ) {

		// everything about this user/message
		var data = {
			proto: proto,
			type: type,
			message: message,
			response: null,
			target: '',
			author: '',
			command: '',
			identified: false,
			identity: {},
			rank: 0,
			allowed_cmds: [],
		};

		// Ignore Self
		if ( from.match( new RegExp( sails.config.xmpp.local_alias + "|" + sails.config.irc.username, 'i') ) ) {
			next();
		}

		// Who is this message from really;
		// And whom is it to?
		if ( proto == 'irc' ) {
			data.target = '#' + to.replace('#', '');
			data.author = from;
		} else if ( proto == 'xmpp' ) {
			if ( from == 'api' ) {
				data.target = to.replace('#','') + sails.config.xmpp.chat_domain;
				data.author = from;
			} else if ( type == 'subscribe' ) {
				data.author = from.replace( new RegExp('@.+', 'i'), '');
			} else {
				//target = from.replace('#','') + sails.config.xmpp.chat_domain;
				data.target = from.replace( new RegExp('/.+$', 'i'), '');
				data.author = from.replace( new RegExp('^.+/', 'i'), '');
			}
		} else if ( proto == 'all' ) {
			data.author = 'api';
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

			// Process buddy junk right away and bail
			// Buddies must be Ident and >= rank 1 (Staff)
			if ( data.type === 'subscribe' ) {
				sails.controllers.xmppclient.subscribe( data );
				return;
			}

			// decide if this is a command or what
			var cmd_syntax = new RegExp( '^' + sails.config.cmd_shcut + '([a-z0-9\_\-]+)' );
			var cmd = message.match( cmd_syntax );

			if ( cmd != null ) {
				console.log( "Trying to run command: " + cmd[1] );
				data.command = cmd[1];
				if ( ( data.identified == true && data.allowed_cmds.indexOf( data.command ) > -1 )
					|| data.author == 'api'
					|| data.command == 'ident' ) {
					// do something with that
					data.response = sails.controllers.command.exec ( data );
				} else {
					data.response = "Sorry, " + data.author + ", you are not allowed to do that.";
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
			// TODO: check for groupchat here also
			if ( data.response != null ) {

				if ( data.proto == 'all' ) {
					// Only API calls get here
					data.target = '#' + to;
					data.proto = 'irc';
					sails.controllers.message.send( data );

					// XMPP portion
					data.proto = 'xmpp';
					if ( data.author == 'api' ) {
						data.target = to.replace('#','') + sails.config.xmpp.chat_domain;
					} else {
						data.target = to + sails.config.xmpp.chat_domain;
					}
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
			if ( sails.config.enable_crossover == true && cmd == null && type != 'chat' ) {
				// response should only == message if
				// 1. this is not a command
				// 2. crossover is enabled
				// 3. the protocol is flipped
				// 4. this is not a PM/IM /whisper (irc:PRIVMSG->nick, xmpp:type=chat)

				data.response = message;

				if ( data.proto == 'irc' ) {
					data.proto = 'xmpp';
					data.target = to.replace('#', '');
					data.target = data.target + sails.config.xmpp.chat_domain;

					data.response = sails.config.irc.crossover_prefix + data.author + sails.config.irc.message_delimiter + message

					console.log( "XO:".verbose, data.proto.warn, to, "=>", data.target );

				} else if ( data.proto == 'xmpp' ) {
					data.proto = 'irc';
					data.target = from.replace(sails.config.xmpp.chat_domain, '');
					data.author = data.target.replace( new RegExp('^.+/', 'i'), '' );
					data.target = data.target.replace( new RegExp('/.+$', 'i'), '' );
					data.target = '#' + data.target;

					data.response = sails.config.xmpp.crossover_prefix + data.author + sails.config.xmpp.message_delimiter + message

					console.log( "XO:".verbose, data.proto.warn, data.author, "=>", data.target );

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

	},

	/**
	* Every (command) controller is going to be required to provide a
	* `/$controller/help` action which details help info related
	* the controllers other actions/attributes.
	*/
	help: {
		process: "Processing an incoming message from a connected chat protocol",
		send: "Send a message to a connected chat protocol",
	},

	/**
	* Overrides for the settings in `config/controllers.js`
	* (specific to MessageController)
	*/
	_config: {}

};
