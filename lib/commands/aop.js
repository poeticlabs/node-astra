// command: aop

module.exports = function ( data, args ) {

	var identee = {
		identified: false,
		identity: {},
	};

	if ( args.length > 0 ) {

		Identity.findOne( {
			where: {
				or: [ {irc: args[0]}, {xmpp: args[0]}, {nick: args[0]} ]
			}
		}, function ( err, user ) {

			if ( user ) {
				identee.identity = user;
				identee.identified = true;

				console.log( 'trying to add ' + user.irc + ' to ' + data.target );

				if ( sails.config.irc.enabled == true ) {
					sails.config.bootstrap.irc_client.say( 'ChanServ',
						'OP ' + data.target.replace( sails.config.xmpp.chat_domain, '') + ' ' + identee.identity.irc );
					sails.config.bootstrap.irc_client.say( 'ChanServ',
						'ACCESS ' + data.target.replace( sails.config.xmpp.chat_domain, '') + ' ADD ' + identee.identity.irc + ' 40');
				}

				if ( sails.config.xmpp.enabled == true ) {
					sails.config.bootstrap.xmpp_client.send(
						new sails.config.bootstrap.xmpp_obj.Element('iq', {
							from: sails.config.xmpp.username + '@' + sails.config.xmpp.host,
							to: data.target.replace('#','') + sails.config.xmpp.chat_domain, type: 'set'
						}).c('query', { xmlns:'http://jabber.org/protocol/muc#admin' })
						.c('item', { affiliation:'admin', jid: identee.identity.xmpp + '@' + sails.config.xmpp.host, nick: identee.identity.xmpp })
					);
				}
			
			} else {
				data.response = "Sorry, " + data.author + ", I'm unable to auto-op an unidentified user.";
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				sails.controllers.message.send(data);
				//return data;
			}
		});

	} else {
		identee.identity = data.identity;
		identee.identified = data.identified;

		if ( sails.config.irc.enabled == true ) {
			sails.config.bootstrap.irc_client.say( 'ChanServ', 'OP ' + data.target + ' ' + identee.identity.irc );
			sails.config.bootstrap.irc_client.say( 'ChanServ', 'ACCESS ' + data.target + ' ADD ' + identee.identity.irc + ' 40');
		}

		if ( sails.config.xmpp.enabled == true ) {
			sails.config.bootstrap.xmpp_client.send(
				new sails.config.bootstrap.xmpp_obj.Element('iq', {
					from: sails.config.xmpp.username + '@' + sails.config.xmpp.host,
					to: data.target.replace(sails.config.xmpp.chat_domain, '') + sails.config.xmpp.chat_domain, type: 'set'
				}).c('query', { xmlns:'http://jabber.org/protocol/muc#admin' })
				.c('item', { affiliation:'admin', jid: identee.identity.xmpp + '@' + sails.config.xmpp.host, nick: identee.identity.xmpp })
			);
		}
	}

}

module.exports.help = {
	aop: '!aop [user]\n    Auto-Op [user] in this channel.\n'
	+ '    Omit [user] for self, IRC and XMPP usernames supported.'
}
