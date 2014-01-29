/**
 * isValidatedKey
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function isValidKey (req, res, next) {

	var data = {
		version: sails.config.version
	};

	if (req.session.valid_key) {
		// User is allowed, proceed to the next policy, 
		// or if this is the last policy, the controller
		next();
	} else if ( ! req.param('key') ) {
		data.errmsg = "Missing API Key";
		return res.json( data );
	}

	APIKey.findOne( {
		data: req.param('key')
	}, function( err, key ) {
		// Key is valid if here,
		if ( ! key ) {
			// User is not allowed
			// (default res.forbidden() behavior can be overridden in `config/403.js`)
			data.errmsg = "API Key is invalid";
			return res.forbidden( data );
		} else {
			// TODO: altho possibly expired
			console.log ( "Found Key:".verbose, key.name.verbose );
			req.session.valid_key = true;
			next();
		}
	});
};
