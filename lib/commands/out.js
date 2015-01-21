// command: out

module.exports = function ( data, args ) {

		async.waterfall( [
			function(callback){
				Timecard.findOne( {
					where: { ident: data.identity.id }, sort: 'createdAt DESC'
				}, function(err, clock) {
					if ( clock && clock.clock == 0 ) {
						err = 'Already OUT, please !in first, ' + data.author;
					}
					callback(err, clock);
				});
			},
			function(clock, callback) {
				var comment = ( args.length > 0 ) ? args.join(' ') : null;
				Timecard.create( { ident: data.identity.id, clock: 0, comment: comment } ).done( callback );
			}
		], function ( err, result ) {
			if ( err ) {
				console.log(err);
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				data.response = err;
			} else {
				data.response = "OUT @ " + result.createdAt;
			}
			sails.controllers.message.send( data );

			// Time worked

			var moment = require('moment');

			Timecard.find( {
				where: { ident: data.identity.id }, sort: 'createdAt DESC', limit: 2
			},

			function( err, times ) {
				var a = moment( times[0].createdAt );
				var b = moment( times[1].createdAt );
				var total_msecs = a.diff(b);

				data.irc_color = 'green';
				data.xmpp_color = 'green';
				data.response = 'Time worked: ' + moment.duration( total_msecs, 'milliseconds' ).humanize();
				sails.controllers.message.send( data );

			});

		}); // async

}

module.exports.help = {
	out: '!out [comment]\n    Clock out from your shift or when going to lunch.'
}
