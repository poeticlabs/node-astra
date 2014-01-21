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

  /**
   * Action blueprints:
   *    `/xmppclient/send`
   */
	send: function ( channel, message ) {
		sails.config.bootstrap.xmpp_client.send(new sails.config.bootstrap.xmpp_obj.Element('message', { to: channel, type: 'groupchat' })
			.c('body').t( message )
		);
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to XmppClientController)
   */
	_config: {}
  
};
