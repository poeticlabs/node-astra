/**
	* APIController
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

module.exports	= {
	
	/**
	*	Action blueprints:
	*    `/api/route`
	*/
	route: function (req, res) {

		console.log ( "API Routing: /".debug + req.param('controller').debug + "/".debug + req.param('action').debug );
		var data = {};

		if ( req.param('key') ) {

			if ( req.param('controller') == 'api' && req.param('action') == 'generate' && req.param('name') != null ) {
				sails.controllers.api.generate( req, res, data );

			// route the controller action here
			} else if ( req.param('action') != null ) {

				data.message = '';

				if ( req.param('controller') == 'message' ) {
					data.message = req.param('action') + ": " + req.param('data');
				} else {
					data.message = sails.config.cmd_shcut + req.param('action') + " " + req.param('data');
				}

				console.log ( "Data: ".yellow, data.message.yellow );

				data.proto = req.param('proto') || 'all';
				data.type = req.param('type') || 'groupchat';
				data.target = req.param('target').replace( /#/,'') || 'return';
				data.author = 'api';
				data.color = null;

				if ( data.message.match ( /RECOVERY|Bravo/ ) ) {
					data.irc_color = 'green';
					data.xmpp_color = 'green';
				} else if ( data.message.match ( /CRIT|Tango/ ) ) {
					data.irc_color = 'red';
					data.xmpp_color = 'red';
				} else if ( data.message.match ( /WARN/ ) ) {
					data.irc_color = 'yellow';
					data.xmpp_color = 'orange';
				}

				if ( data.message.match ( /ACKNO/ ) ) {
					data.irc_color = 'cyan';
					data.xmpp_color = 'lightblue';
				}

				data.response = sails.controllers.message.process ( {
					proto: data.proto,
					type: data.type,
					target: data.target,
					author: data.author,
					message: data.message,
					irc_color: data.irc_color,
					xmpp_color: data.xmpp_color,
				});

				if ( ! data.response && ! data.errmsg ) {
					data.response = "OK";
				}

			} else {
				data.errmsg = "Not sure what you want.";
			}

		} else {
			data.errmsg = "Missing API Key";
		}

		return res.json( data );
	},


	/**
	* Action blueprints:
	*    `/api/generate`
	*/
	generate: function (req, res, data) {
		var crypto = require('crypto');
		var shasum = crypto.createHash('sha1');
		shasum.update( req.param('name') );

		APIKey.create( {
			name: req.param('name'),
			data: shasum.digest('hex')
		} ).done( function ( err, key ) {
			if ( err ) {
				console.log ( err );
				data.errmsg = err;
				return res.json( data );
			} else {
				console.log ( "Key generated successfully: " + key );
				data.response = "Key generated successfully: " + key;
				return res.json( data );
			}
		});
	},

	/**
	* Overrides for the settings in `config/controllers.js`
	* (specific to APIController)
	*/
	_config: {}

};
