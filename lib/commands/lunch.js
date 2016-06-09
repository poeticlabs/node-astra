// command: lunch

module.exports = function ( data, args ) {

		async.waterfall( [
			function(callback){
				Timecard.findOne( {
					where: { ident: data.identity.id }, sort: 'createdAt DESC'
				}, function(err, clock) {
					if ( clock == undefined ) {
						err = "You need to !in before you can !lunch " + data.author;
					}
					callback(err, clock);
				});
			},
			function(clock, callback) {
				var comment = ( args.length > 0 ) ? args.join(' ') : null;
				// Toggle !in / !out status for !lunch
				if ( (clock && clock.clock == 0) ) {
					Timecard.create( { ident: data.identity.id, clock: 1, comment: comment } ).done(
						function(err,result) {
							result.status_string = 'Back from Lunch @ ';
							callback(err,result);
						}
					); // dont wanna have to expand this callback :X
				} else {
					Timecard.create( { ident: data.identity.id, clock: 0, comment: comment } ).done(
						function(err,result) {
							result.status_string = 'Out to Lunch @ ';
							callback(err,result);
						}
					);
				}
			}
		], function ( err, result ) {
			if ( err ) {
				console.log(err);
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				data.response = err;
			} else {
				data.response = result.status_string + result.createdAt;
			}
			sails.controllers.message.send( data );

		}); // async

}

module.exports.help = {
	lunch: '!lunch [comment]\n    Clock out/in from your shift when going to lunch.'
}
