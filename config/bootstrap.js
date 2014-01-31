/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {

	// Get the libs
	var colors = require("colors");
	colors.setTheme({
		silly: 'rainbow',
		input: 'grey',
		verbose: 'cyan',
		info: 'green',
		data: 'white',
		help: 'cyan',
		warn: 'yellow',
		debug: 'magenta',
		error: 'red'
	});

	module.exports.bootstrap.colors = colors;

	var config = require("./local");

	console.log("\n\n");
	console.log ( "info".info + ":".data + " Starting Astra v.".silly + config.version.cyan );

	var channels = {
		irc: [],
		xmpp: []
	};

	Channel.find().done( function(err, list) {
		if ( err ) {
			console.log( 'ERROR: No channels found, '.error, JSON.stringify( err ).error );
		} else if ( list ) {
			for ( var i = 0; i < list.length; i++ ) {
				if ( list[i].hasOwnProperty('irc') ) {
					channels.irc.push( list[i].irc );
				}
				if ( list[i].hasOwnProperty('xmpp') ) {
					channels.xmpp.push( list[i].xmpp );
				}
			}
		}

		main();

	});

	//////////////////////////////////////////////////
	//
	// M * O * D * U * L * E * S
	//
	//////////////////////////////////////////////////

	var mods = [];

	mods['add_chan']	= require( config.cmdpath + '/add_chan' );
	mods['aop']			= require( config.cmdpath + '/aop' );
	mods['cq']			= require( config.cmdpath + '/cq' );
	mods['echo']		= require( config.cmdpath + '/echo' );
	mods['eq']			= require( config.cmdpath + '/eq' );
	mods['exit']		= require( config.cmdpath + '/exit' );
	mods['help']		= require( config.cmdpath + '/help' );
	mods['ident']		= require( config.cmdpath + '/ident' );
	mods['join']		= require( config.cmdpath + '/join' );
	mods['joke']		= require( config.cmdpath + '/joke' );
	mods['levelup']		= require( config.cmdpath + '/levelup' );
	mods['mq']			= require( config.cmdpath + '/mq' );
	mods['promote']		= require( config.cmdpath + '/promote' );
	mods['reload']		= require( config.cmdpath + '/reload' );
	mods['set']			= require( config.cmdpath + '/set' );
	mods['version']		= require( config.cmdpath + '/version' );
	mods['which_chan']	= require( config.cmdpath + '/which_chan' );

	sails.controllers.command.mods = mods;

	//////////////////////////////////////////////////

	function main() {

		if ( config.irc.enabled == true ) {

			var irc = require("irc");
			var data = {};
			data.proto = 'irc';

			// Create the bot
			var irc_bot = new irc.Client( config.irc.host, config.irc.username, {
				userName: 'astra',
				realName: 'Astrabella',
				port: 6667,
				debug: false,
				showErrors: false,
				autoRejoin: true,
				autoConnect: true,
				channels: [], // Could join here, but then no AOP since
				// join before IDENTIFY
				secure: false,
				selfSigned: false,
				certExpired: false,
				floodProtection: false,
				floodProtectionDelay: 1000,
				sasl: false,
				stripColors: false,
				channelPrefixes: "&#",
				messageSplit: 512
			});

			if ( irc_bot ) {
				console.log( "notice".info + ":".data, "IRC connected.".debug );
			}

			module.exports.bootstrap.irc_obj = irc;
			module.exports.bootstrap.irc_client = irc_bot;

			// Listen for 001 connect
			irc_bot.addListener("registered", function(message) {

				setTimeout(function () {
					irc_bot.say( 'NickServ', 'IDENTIFY ' + sails.config.irc.password );
				}, 1000);
				setTimeout(function () {
					irc_bot.send( 'oper', 'root', sails.config.irc.password );
				}, 1000);

				setTimeout(function () {
					for ( var i = 0 ; i < channels.irc.length ; i++ ) {
						irc_bot.join( channels.irc[i] );
					}
				}, 1000);
			});

			// Listen for joins
			irc_bot.addListener("join", function( channel, nick, message ) {
				data.type = 'presence';
				data.target = channel;
				data.author = channel;
				data.message = nick + " enters the channel.";
				sails.controllers.message.process ( data );
			});

			// Listen for parts
			irc_bot.addListener("part", function( channel, nick, reason, message ) {
				data.type = 'presence';
				data.target = channel;
				data.author = channel;
				data.message = nick + " leaves the channel.";
				sails.controllers.message.process ( data );
			});

			// Listen for GroupChats
			irc_bot.addListener("message#", function(from, to, text, message) {
				data.type = 'groupchat';
				data.target = '#' + to.replace('#', '');
				data.author = from;
				data.message = text;
				if ( from != config.irc.username ) {
					console.log ( 'IRC:'.verbose, 'groupchat'.info, data.author, "=>", data.target, " message:", text );
					sails.controllers.message.process ( data );
				}
			});

			// Listen for PMs
			irc_bot.addListener("pm", function(from, text, message) {
				data.type = 'chat';
				data.target = sails.config.irc.username;
				data.author = from;
				data.message = text;
				if ( from != config.irc.username ) {
					console.log ( 'IRC:'.verbose, 'chat'.info, data.author, "=>", config.irc.username, " message:", text );
					sails.controllers.message.process ( data );
				}
			});

			// Listen for Errors
			irc_bot.addListener('error', function(message) {
		        console.log('error:'.error, message);
			});
		}

		if ( config.xmpp.enabled == true ) {

			var xmpp = require('node-xmpp');
			var jid = config.xmpp.username + '@' + config.xmpp.host + "/waffles"
			var room_nick = config.xmpp.local_alias
			var cl = new xmpp.Client({
				jid: jid,
				password: config.xmpp.password
			});

			// Once connected, set available presence and join room
			cl.on('online', function() {

				console.log( "notice".info + ":".data, "XMPP connected.".debug );

			  // set ourselves as online
				cl.send( new xmpp.Element('presence').c('status', { code: 110 } ).c('show').t('chat') );

			  // join rooms (and request no chat history)
				for ( var i = 0 ; i < channels.xmpp.length ; i++ ) {

					cl.send( new xmpp.Element('presence', { to: channels.xmpp[i] + config.xmpp.chat_domain  + '/' + room_nick })
						.c('x', { xmlns: 'http://jabber.org/protocol/muc' })
						.c('history', { maxstanzas: 0, seconds: 1})
					);

				}

				// send keepalive data or server will disconnect us after 150s of inactivity
				cl.connection.socket.setKeepAlive(true, 10000)
			});

			cl.on('stanza', function(stanza) {

				// always log error stanzas
				if (stanza.attrs.type == 'error') {
					console.log('error'.error, stanza.toString() );
					return;
				}

				// ignore messages we sent
				if ( stanza.attrs.from.match( new RegExp(room_nick, 'i') ) ) {
					return;
				} else if ( stanza.attrs.from == jid ) {
					return;
				}

				var data = {};

				data.proto = 'xmpp';

				data.target = stanza.attrs.from.replace( new RegExp('/.+$', 'i'), '');
				data.author = stanza.attrs.from.replace( new RegExp('^.+/', 'i'), '');

				var body = stanza.getChild('body');

				if ( stanza.is('presence') ) {

					if ( stanza.attrs.type == 'subscribe' ) {
						console.log( 'buddy_req'.debug, stanza.toString() );
						data.author = data.from.replace( new RegExp('@.+', 'i'), '');
					} else if ( stanza.attrs.type == 'unavailable' ) {
						data.message = stanza.attrs.from.replace( config.xmpp.chat_domain, '' )
						.replace( new RegExp( '.+/' ), '' ) + " leaves the channel.";

						data.author = stanza.attrs.from.replace( config.xmpp.chat_domain, '' ).replace( new RegExp( '/.+' ), '' );
						data.type = 'presence';

						console.log ( 'XMPP:'.verbose, data.type.info, data.author, "=>", data.target, "message:", JSON.stringify(data.message) );
						sails.controllers.message.process ( data );

					} else if ( ! body ) {
						if ( stanza.children[0].name == 'show' || stanza.children[2].attrs.xmlns == 'vcard-temp:x:update' ) {
							// Just a status change
							return;
						}
						data.message = stanza.attrs.from.replace( config.xmpp.chat_domain, '' )
						.replace( new RegExp( '.+/' ), '' ) + " enters the channel.";

						data.author = stanza.attrs.from.replace( config.xmpp.chat_domain, '' ).replace( new RegExp( '/.+' ), '' );
						data.type = 'presence';

						console.log ( 'XMPP:'.verbose, data.type.info, data.author, "=>", data.target, "message:", JSON.stringify(data.message) );
						sails.controllers.message.process ( data );
					}

				} else {

					data.type = stanza.attrs.type;

					// message without body is probably a topic change
					if ( body ) {
						data.message = body.getText();
					} else if ( ! data.message ) {
						return;
					}

					console.log ( 'XMPP:'.verbose, data.type.info, data.author, "=>", data.target, "message:", JSON.stringify(data.message) );
					sails.controllers.message.process ( data );
				}

			});

			module.exports.bootstrap.xmpp_obj = xmpp;
			module.exports.bootstrap.xmpp_client = cl;
		}

	} // Function main()

	// Garbage Collect Sessions
	(function gc () {

		setTimeout( function() {
			console.log( 'GC:'.debug, 'session_cleanup'.info );
			sails.config.session.store.all( function(n, s) {
				for (var i = 0; i < s.length; i++) {
					sails.config.session.store.get(s[i], function() {} );
				}
			});

			gc();

		}, 60000 );

	})();

	/////////////////////////////////////////////////////////////////////////////

	// It's very important to trigger this callack method when you are finished 
	// with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
	cb();
};
