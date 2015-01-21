// command: whosout

module.exports = function ( data, args ) {

	var moment = require('moment');

	async.waterfall( [
		function(callback) {
			Identity.find( {
				where: {
					level: { '>': 0 }
				}
			}, callback );
		},
		function(users, callback) {

			var anyone = false;
			var n = 0;
			var max = users.length;

			async.forEach( users, function( user, cb ) {
				Timecard.findOne( {
					where: { ident: user.id }, sort: 'createdAt DESC'
				}, function ( err, clock ) {
					n++;
					if ( clock != undefined ) {
						if ( clock.clock == 0 ) {
							anyone = true;
						}
					}
					if ( n == max && anyone == false ) {
						err = 'Sorry, ' + data.author + ', we found no one.';
					}
					callback( err, n, max, anyone, user, clock );
				});

			});
		},
		function(n, max, anyone, user, clock, callback) {
			var resp = null;
			var err = null;

			if ( clock != undefined ) {
				if ( clock.clock == 0 ) {
					anyone = true;
					var display = moment.utc(clock.createdAt + 'Z').local().format('YYYY-MM-DD HH:mm:ss');
					var delta = moment(display).fromNow();

					resp = ( user.nick ) ? user.nick : ( user.irc ) ? user.irc : user.xmpp;
					resp += '\tOUT ';
					resp += ( clock.comment ) ? clock.comment : '';
					resp += ' ' + display + ' (' + delta + ')';
				}
			}

			callback( err, resp );
		}
	], function ( err, result ) {

		if ( err ) {
			console.log(err);
			data.irc_color = 'red';
			data.xmpp_color = 'red';
			data.response = err;
			sails.controllers.message.send( data );
			return;
		}

		data.response = result;
		sails.controllers.message.send( data );
		return;

	});

}

module.exports.help = {
	whosout: '!whosout\n    Who is currently NOT on shift.'
}
