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
				var args = data.message.split(/\s+/);
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

		exec_ssh: function( data ) {

			if ( data.cmd != null ) {
				var Connection = require('ssh2');

				var c = new Connection();
				c.on('ready', function() {
					console.log('Connection :: ready');
					c.exec('uptime', function(err, stream) {
						if (err) throw err;
						stream.on('data', function(data, extended) {
							console.log( (extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ') + data);
						});
						stream.on('end', function() {
							console.log('Stream :: EOF');
						});
						stream.on('close', function() {
							console.log('Stream :: close');
						});
						stream.on('exit', function(code, signal) {
							console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
							c.end();
						});
					});
				});

				c.on('error', function(err) {
					console.log('Connection :: error :: ' + err);
				});
				c.on('end', function() {
					console.log('Connection :: end');
				});
				c.on('close', function(had_error) {
					console.log('Connection :: close');
				});
				c.connect({
					host: data.host,
					port: data.port || 22,
					username: data.user || 'root',
					privateKey: require('fs').readFileSync('/root/.ssh/astra_rsa')
				});
			}
		},

		/**
		* Overrides for the settings in `config/controllers.js`
		* (specific to CommandController)
		*/

		_config: {}

	};

	function extend(target) {
	    var sources = [].slice.call(arguments, 1);
	    sources.forEach(function (source) {
	        for (var prop in source) {
	            target[prop] = source[prop];
	        }
	    });
	    return target;
	}
  
} )();
