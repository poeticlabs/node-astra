// command: join

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {
		if ( sails.config.irc.enable != false ) {
			sails.config.bootstrap.irc_client.join( '#' + args[0] );
		}
		if ( sails.config.xmpp.enable != false ) {
			sails.config.bootstrap.xmpp_client.send(
				new sails.config.bootstrap.xmpp_obj.Element('presence', {
					to: args[0] + sails.config.xmpp.chat_domain  + '/' + sails.config.xmpp.local_alias
				}).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxstanzas: 0, seconds: 1})
			);
		}
	} else {
		return "Please provide the pretty-name of a channel to join, " + data.author;
	}
}

module.exports.help = {
	join: '!join\t[pretty-name]\n\tForce the bot to join a channel.\n'
	+ 'IRC/XMPP specific identifiers are affixed to the name as needed.'
}
