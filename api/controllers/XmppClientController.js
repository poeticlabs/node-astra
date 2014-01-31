/**
 * XmppClientController
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
	/*
	RE: http://xmpp.org/rfcs/rfc3921.html >>
	The 'type' attribute of a presence stanza is OPTIONAL. A presence stanza that does not possess a 'type' attribute is used to signal to the server that the sender is online and available for communication. If included, the 'type' attribute specifies a lack of availability, a request to manage a subscription to another entity's presence, a request for another entity's current presence, or an error related to a previously-sent presence stanza. If included, the 'type' attribute MUST have one of the following values:

	unavailable -- Signals that the entity is no longer available for communication.
	subscribe -- The sender wishes to subscribe to the recipient's presence.
	subscribed -- The sender has allowed the recipient to receive their presence.
	unsubscribe -- The sender is unsubscribing from another entity's presence.
	unsubscribed -- The subscription request has been denied or a previously-granted subscription has been cancelled.
	probe -- A request for an entity's current presence; SHOULD be generated only by a server on behalf of a user.
	error -- An error has occurred regarding processing or delivery of a previously-sent presence stanza.
	*/

  /**
   * Action blueprints:
   *    `/xmppclient/send`
   */
	send: function ( data ) {
		data.color = ( data.xmpp_color != undefined ) ? data.xmpp_color : sails.config.xmpp.color;
		if ( data.response != null || data.response != undefined ) {
			if ( typeof data.response === 'string' ) {
				var responses = data.response.split('\n');
				for ( var i = 0; i < responses.length; i++ ) {
					sails.config.bootstrap.xmpp_client.send(new sails.config.bootstrap.xmpp_obj.Element('message', { to: data.target, type: data.type })
						.c('body').t( responses[i] ).up()
						.c('html', { xmlns: 'http://jabber.org/protocol/xhtml-im' } ).c('body').c('span', { style: 'color:' + data.color }).t( responses[i] )
					);
				}
			} else if ( typeof data.response === 'object' ) {
				sails.config.bootstrap.xmpp_client.send(new sails.config.bootstrap.xmpp_obj.Element('message', { to: data.target, type: data.type })
					.c('body').t( data.response ).up()
					.c('html', { xmlns: 'http://jabber.org/protocol/xhtml-im' } ).c('body').c('span', { style: 'color:' + data.color }).t( data.response )
				);
			}
		}

		return;
	},

	subscribe: function ( data ) {
		var identee = data.author + '@' + sails.config.xmpp.host;

		if ( data.identified == true && data.identity.rank >= 1 ) {
			sails.config.bootstrap.xmpp_client.send( new sails.config.bootstrap.xmpp_obj.Element('presence', { to: identee, type: 'subscribed' })
				.c('x', { 'xmlns:stream':"http://etherx.jabber.org/streams" })
			);
			console.log('info'.info, 'User is Authorized');
		} else {
			sails.config.bootstrap.xmpp_client.send( new sails.config.bootstrap.xmpp_obj.Element('presence', { to: identee, type: 'unsubscribed' })
				.c('x', { 'xmlns:stream':"http://etherx.jabber.org/streams" })
			);
			console.log('info'.info, 'User is Not-Authorized');
		}
		
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to XmppClientController)
   */
	_config: {}
  
};
