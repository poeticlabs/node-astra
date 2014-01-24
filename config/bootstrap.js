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
		}
		if ( list ) {
			for ( var i = 0; i < list.length; i++ ) {
				if ( list[i].hasOwnProperty('irc') ) {
					channels.irc.push( list[i].irc );
				}
				if ( list[i].hasOwnProperty('xmpp') ) {
					channels.xmpp.push( list[i].xmpp );
				}
			}
		}
	});

	module.exports.bootstrap.colors = colors;

	// Get the Modules
	var mods = [];

	//////////////////////////////////////////////////

	mods['add_chan'] = require( config.libpath + '/add_chan' );
	mods['echo'] = require( config.libpath + '/echo' );
	mods['help'] = require( config.libpath + '/help' );
	mods['ident'] = require( config.libpath + '/ident' );
	mods['levelup'] = require( config.libpath + '/levelup' );
	mods['promote'] = require( config.libpath + '/promote' );
	mods['version'] = require( config.libpath + '/version' );
	mods['which_chan'] = require( config.libpath + '/which_chan' );

	//////////////////////////////////////////////////

	sails.controllers.command.mods = mods;

	if ( config.irc.enabled == true ) {

		var irc = require("irc");

		// Create the bot
		var irc_bot = new irc.Client( config.irc.host, config.irc.username, {
			channels: channels.irc
		});

		if ( irc_bot ) {
			console.log( "notice".info + ":".data, "IRC connected.".debug );
		}

		module.exports.bootstrap.irc_obj = irc;
		module.exports.bootstrap.irc_client = irc_bot;

		// Listen for any messages
		irc_bot.addListener("message", function(from, to, text, message) {
			var type = 'groupchat';
			if ( ! to.match( new RegExp( '#', 'i' ) ) ) {
				type = 'chat';
			}
			if ( from != config.irc.username ) {
				console.log ( 'IRC:'.verbose, type.info, from, "=>", to, " message:", text );
				sails.controllers.message.process ( 'irc', type, from, to, text );
			}
		});

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
			//setInterval(function() {
			//	cl.send(' ');
			//}, 30000);
		});

		cl.on('stanza', function(stanza) {

			// always log error stanzas
			if (stanza.attrs.type == 'error') {
				console.log('error'.error, stanza.toString() );
				return;
			}

			if ( stanza.is('presence') && stanza.attrs.type == 'subscribe' ) {

				console.log( 'buddy_req'.debug, stanza.toString() );

			} //else if ( ! stanza.is('message') || ! stanza.attrs.type == 'groupchat' ) {
				// ignore everything that isn't a room message
				//return;
				//console.log( 'debug'.debug, stanza.toString() );
			//}

			// ignore messages we sent
			if ( stanza.attrs.from.match( new RegExp(room_nick, 'i') ) ) {
				return;
			} else if ( stanza.attrs.from == jid ) {
				return;
			}

			var body = stanza.getChild('body');
			var message = '';

			// message without body is probably a topic change
			if ( stanza.attrs.type != 'subscribe' && ! body ) {
				return;
			} else if ( body ) {
				message = body.getText();
			}

			console.log ( 'XMPP:'.verbose, stanza.attrs.type.info, stanza.attrs.from, "=>", stanza.attrs.to, "message:", JSON.stringify(message) );
			sails.controllers.message.process ( 'xmpp', stanza.attrs.type, stanza.attrs.from, stanza.attrs.to, message );

		});

		module.exports.bootstrap.xmpp_obj = xmpp;
		module.exports.bootstrap.xmpp_client = cl;
	}

	/////////////////////////////////////////////////////////////////////////////

	// It's very important to trigger this callack method when you are finished 
	// with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
	cb();
};
