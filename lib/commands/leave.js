// command: leave

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		for ( var i = 0; i < args.length; i++ ) {

			if ( sails.config.irc.enabled != false ) {
				sails.config.bootstrap.irc_client.part( '#' + args[i], 'Adìos!' );
			}
			if ( sails.config.xmpp.enabled != false ) {
				sails.config.bootstrap.xmpp_client.send(
					new sails.config.bootstrap.xmpp_obj.Element('presence', {
						to: sails.config.xmpp_prefix + args[i] + sails.config.xmpp.chat_domain  + '/' + sails.config.xmpp.local_alias,
						type: 'unavailable'
					}).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxstanzas: 0, seconds: 1})
				);
			}
		}

	} else {

		if ( sails.config.irc.enabled != false ) {
			sails.config.bootstrap.irc_client.part( data.target, 'Adìos!' );
		}

		if ( sails.config.xmpp.enabled != false ) {
			sails.config.bootstrap.xmpp_client.send(
				new sails.config.bootstrap.xmpp_obj.Element('presence', {
					to: data.target + sails.config.xmpp.chat_domain  + '/' + sails.config.xmpp.local_alias,
					type: 'unavailable'
				}).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).c('history', { maxstanzas: 0, seconds: 1})
			);
		}

	}

	data.response = "OK, " + data.author;
	//data.irc_color = 'red';
	//data.xmpp_color = 'red';
	return data;
}

module.exports.help = {
	leave: '!leave [[channel] [channel] ...]\n    Force the bot to leave this channel,'
	+ 'or optional list of pretty-name channels.'
}
