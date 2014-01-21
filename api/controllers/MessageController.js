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
	process: function ( proto, from, to, message ) {

		// containers
		var data = {
			proto: proto,
			message: message,
			response: '',
			target: '',
			author: '',
			command: '',
			identified: false,
			identity: {}
		};

		// Ignore Self
		if ( from.match( new RegExp( sails.config.xmpp.local_alias + "|" + sails.config.irc.username, 'i') ) ) {
			next();
		}

		if ( proto == 'irc' ) {
			data.target = '#' + to.replace('#', '');
			data.author = from;
		} else if ( proto == 'xmpp' ) {
			if ( from == 'api' ) {
				data.target = to.replace('#','') + sails.config.xmpp.chat_domain;
				data.author = from;
			} else {
				//target = from.replace('#','') + sails.config.xmpp.chat_domain;
				data.target = from.replace( new RegExp('/.+$', 'i'), '');
				data.author = from.replace( new RegExp('^.+/', 'i'), '');
			}
		}

		//sails.policy.isIdentified( data );

		// decide if this is a command or what
		var cmd_syntax = new RegExp( '^' + sails.config.cmd_shcut + '([a-z0-9\_\-]+)' );
		var cmd = message.match( cmd_syntax );

		if ( cmd != null ) {
			console.log( "Trying to run command: " + cmd[1] );
			data.command = cmd[1];

			// do something with that
			data.response = sails.controllers.command.exec ( data );
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
		if ( data.response != "" ) {

			if ( data.proto == 'all' ) {
				// Only API calls get here
				data.target = '#' + to;
				data.proto = 'irc';
				this.send( data );

				// XMPP portion
				data.proto = 'xmpp';
				if ( data.author == 'api' ) {
					data.target = to.replace('#','') + sails.config.xmpp.chat_domain;
				} else {
					data.target = to + sails.config.xmpp.chat_domain;
				}
				this.send( data );
				return;
			}

			// Private Message
			//if ( to.match( new RegExp( sails.config.xmpp.local_alias + "|" + sails.config.irc.username, 'i') ) ) {
			//	target = from;
			//}

			this.send( data );
		}

		// Crossover
		if ( sails.config.enable_crossover == true && cmd == null ) {
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

				data.response = sails.config.irc.crossover_prefix + from + sails.config.irc.message_delimiter + message

				console.log( "XO:".verbose, data.proto.warn, to, "=>", data.target );

			} else if ( data.proto == 'xmpp' ) {
				data.proto = 'irc';
				data.target = from.replace(sails.config.xmpp.chat_domain, '');
				data.author = data.target.replace( new RegExp('^.+/', 'i'), '' );
				data.target = data.target.replace( new RegExp('/.+$', 'i'), '' );
				data.target = '#' + data.target;

				data.response = sails.config.xmpp.crossover_prefix + from + sails.config.xmpp.message_delimiter + message

				console.log( "XO:".verbose, data.proto.warn, from, "=>", data.target );

			}

			// check for groupchat here also
			if ( data.target ) {
				this.send( data );
			}

		}

	},

	/**
	* Action blueprints:
	*    `/message/send`
	*/
	send: function ( data ) {

		if ( data.proto == 'irc' ) {
			// IRC
			sails.controllers.ircclient.send ( data.target, data.response );

		} else if ( data.proto == 'xmpp' ) {
			// send response XMPP
			sails.controllers.xmppclient.send ( data.target, data.response );
			//bot.send(new conn_obj.Element('message', { to: channel, type: 'groupchat' })
			//	.c('body').t( message )
			//);
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
