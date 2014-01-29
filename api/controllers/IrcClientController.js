/**
 * IrcClientController
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
	*    `/ircclient/send`
	*/
	send: function ( data ) {
		var c = require('irc-colors');
		this.color = ( data.irc_color ) ? data.irc_color : sails.config.irc.color;
		if ( data.response != null || data.response != undefined ) {
			if ( typeof data.response === 'string' ) {
				var responses = data.response.split('\n');
				for ( var i = 0; i < responses.length; i++ ) {
					sails.config.bootstrap.irc_client.say ( data.target, c[this.color]( responses[i] ) );
				}
			} else if ( typeof data.response === 'object' ) {
				sails.config.bootstrap.irc_client.say ( data.target, c[this.color]( data.response ) );
			}
		}

		return;
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to IrcClientController)
   */
	_config: {}
  
};
