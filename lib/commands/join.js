// command: join

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {
		for ( var i = 0; i < args.length; i++ ) {
			if ( sails.config.irc.enabled != false ) {
				sails.config.bootstrap.irc_client.join( '#' + args[i] );
			}
			if ( sails.config.xmpp.enabled != false ) {
				sails.config.bootstrap.xmpp_client.send(
					new sails.config.bootstrap.xmpp_obj.Element('presence', {
						to: sails.config.xmpp_prefix + args[i] + sails.config.xmpp.chat_domain  + '/' + sails.config.xmpp.local_alias
					}).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxstanzas: 0, seconds: 1})
				);
			}
		}
	} else {
		data.response = "Please provide the pretty-name of a channel or channels to join, " + data.author;
		data.irc_color = 'red';
		data.xmpp_color = 'red';
		return data;
	}
}

module.exports.help = {
	join: '!join [[channel] [channel] ...]\n    Force the bot to join a channel, or channels;\n'
	+ '    IRC/XMPP specific identifiers are affixed to the name as needed.'
}
