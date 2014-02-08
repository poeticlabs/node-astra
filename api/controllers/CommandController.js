/**
 * CommandController
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

module.exports = ( function() {

	return {

		exec: function( data ) {

			if ( sails.controllers.command.mods[data.command] ) {

				console.log ( "CMD:", data.command );
				var args = [];

				if ( data.message.match( /\n/ ) ) {
					var lines = data.message.split(/\n/);
					args = lines[0].split(/\s+/);
				} else {
					args = data.message.split(/\s+/);
				}

				args = args.slice(1)
				// WARNING: Output CUTOFF
				// You cannot reliably `return` data past this point due to async() !!
				// Any OBJECT data{} responses past this point need to be sails.controllers.message.send() directly!!
				// You've been warned.
				return sails.controllers.command.mods[data.command] ( data, args );
			} else {
				data.response = "Sorry, " + data.author + ", we did not find a command called: " + data.command;
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				return data;
			}
		},

		/**
		* Overrides for the settings in `config/controllers.js`
		* (specific to CommandController)
		*/

		_config: {}

	};

} )();
