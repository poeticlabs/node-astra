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

	//////////////////////////////////////////////////
	//
	// M * O * D * U * L * E * S
	//
	//////////////////////////////////////////////////

	var mods = [];

	mods['aop']			= require( config.cmdpath + '/aop' );
	mods['channel']		= require( config.cmdpath + '/channel' );
	mods['cq']			= require( config.cmdpath + '/cq' );
	mods['echo']		= require( config.cmdpath + '/echo' );
	mods['eq']			= require( config.cmdpath + '/eq' );
	mods['exit']		= require( config.cmdpath + '/exit' );
	mods['friday']		= require( config.cmdpath + '/friday' );
	mods['help']		= require( config.cmdpath + '/help' );
	mods['host']		= require( config.cmdpath + '/host' );
	mods['ident']		= require( config.cmdpath + '/ident' );
	mods['in']			= require( config.cmdpath + '/in' );
	mods['join']		= require( config.cmdpath + '/join' );
	mods['joke']		= require( config.cmdpath + '/joke' );
	mods['leave']		= require( config.cmdpath + '/leave' );
	mods['levelup']		= require( config.cmdpath + '/levelup' );
	mods['mode']		= require( config.cmdpath + '/mode' );
	mods['mq']			= require( config.cmdpath + '/mq' );
	mods['out']			= require( config.cmdpath + '/out' );
	mods['promote']		= require( config.cmdpath + '/promote' );
	mods['report']		= require( config.cmdpath + '/report' );
	mods['retro_exec']	= require( config.cmdpath + '/retro_exec' );
	mods['return']		= require( config.cmdpath + '/return' );
	mods['reload']		= require( config.cmdpath + '/reload' );
	mods['set']			= require( config.cmdpath + '/set' );
	mods['team']		= require( config.cmdpath + '/team' );
	mods['ticket']		= require( config.cmdpath + '/ticket' );
	mods['timecard']	= require( config.cmdpath + '/timecard' );
	mods['version']		= require( config.cmdpath + '/version' );
	mods['whosin']		= require( config.cmdpath + '/whosin' );
	mods['whosout']		= require( config.cmdpath + '/whosout' );

	sails.controllers.command.mods = mods;

	//////////////////////////////////////////////////

	var channels = {
		irc: [],
		xmpp: []
	};

	async.waterfall( [

		function(callback) {
			Channel.find().done( function(err,list) {
				if ( ! list ) {
					err = 'Sorry, ' + data.author + ', there is no channel called that.';
				}
				callback( err, list );
			});
		},
		function(list, callback) {

			for ( var i = 0; i < list.length; i++ ) {
				if ( list[i].hasOwnProperty('irc') ) {
					channels.irc.push( list[i].irc );
				}
				if ( list[i].hasOwnProperty('xmpp') ) {
					channels.xmpp.push( list[i].xmpp );
				}
			}

			callback( null, channels );
		}

	], function( err, channels ) {

		if ( err ) {
			console.log( err );
		}

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
				data.target = to.replace('#', '');
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
			var jid = config.xmpp.username + '@' + config.xmpp.host + '/bot'
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
				//cl.connection.socket.setKeepAlive(true, 10000)
			});

			cl.on('stanza', function(stanza) {

				// always log error stanzas
				if (stanza.attrs.type == 'error') {
					console.log('error'.error, stanza.toString() );
					return;
				}

				// ignore messages we sent
				if ( stanza.attrs.from != undefined ) {
					if ( stanza.attrs.from.match( new RegExp(room_nick, 'i') ) ) {
						return;
					} else if ( stanza.attrs.from == jid ) {
						return;
					}
				} else {
					// from is undef
					console.log( 'notice'.debug, stanza.toString() );
					return;
				}

				var data = {};

				data.proto = 'xmpp';

				data.target = stanza.attrs.from.replace( /@.+$/, '' );
				//data.author = stanza.attrs.from.replace( /^.+\//, '' );
				data.author = stanza.attrs.from.replace( /^.+\//, '' );
				data.author = data.author.replace( /@.+$/, '' );

				var body = stanza.getChild('body');

				if ( stanza.is('presence') ) {

					if ( stanza.attrs.type == 'subscribe' ) {
						data.type = 'subscribe';
						data.target = stanza.attrs.to.replace( /@.+$/, '' );
						console.log( 'buddy_req'.debug, stanza.toString() );
					} else if ( stanza.attrs.type == 'unavailable' ) {
						data.message = data.author + " leaves the channel.";
						data.author = data.target;
						data.type = 'presence';
					//	console.log ( 'XMPP:'.verbose, data.type.info, data.author, "=>", data.target, "message:", JSON.stringify(data.message) );
					/*} else if ( stanza.children[0].name == 'show' ||
						( stanza.children != undefined && ( stanza.children[2].attrs.xmlns == 'vcard-temp:x:update' || stanza.children[3].attrs.xmlns == 'vcard-temp:x:update' ))
						) {
							// Just a status change
							return;
					*/
					} else if ( ! body ) {
						data.message = data.author + " enters the channel.";
						data.author = data.target;
						data.type = 'presence';
					//	console.log ( 'XMPP:'.verbose, data.type.info, data.author, "=>", data.target, "message:", JSON.stringify(data.message) );
					}

					// sails.controllers.message.process ( data );

				} else {

					data.type = stanza.attrs.type;

					// message without body is probably a topic change
					if ( body ) {
						if ( data.type == 'chat' ) {
							data.author = data.target;
							data.target = stanza.attrs.to.replace( /@.+$/, '' );
						}
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

	}); // async.waterfall

	// Garbage Collect Sessions
	(function gc () {

		setTimeout( function() {
			console.log( 'GarbageCollect:'.debug, 'session_cleanup & keepalive'.info );
			sails.config.session.store.all( function(n, s) {
				for (var i = 0; i < s.length; i++) {
					sails.config.session.store.get(s[i], function() {} );
				}
			});

			var data = {};
			data.response = ' ';
			data.proto = 'xmpp';
			data.type = 'chat';
			data.target = '140065_1014798'; // chrish
			data.author = config.xmpp.username + '@' + config.xmpp.host + '/bot';
			sails.controllers.message.send( data );

			gc();

		}, 60000 );

	})();

	/////////////////////////////////////////////////////////////////////////////

	// It's very important to trigger this callack method when you are finished 
	// with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
	cb();
};
