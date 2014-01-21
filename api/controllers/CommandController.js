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

module.exports = {

	exec: function( data ) {

		if ( sails.controllers.command.mods[data.command] ) {
			console.log ( "CMD:", data.command );
			var args = data.message.split(/\s+/);
			args = args.slice(1)
			// WARNING: Output CUTOFF
			// Any OBJECT data{} responses past this point need to be sails.controllers.message.send() directly!!
			// return will not get your message back to the chat unless it's a STRING
			return sails.controllers.command.mods[data.command] ( data, args );
		} else {
			return "Sorry, " + data.author + ", we did not find a command called: " + data.command;
		}
	},

	/**
	* Overrides for the settings in `config/controllers.js`
	* (specific to CommandController)
	*/

	_config: {}

  
};
