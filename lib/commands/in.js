// command: in

module.exports = function ( data, args ) {

		async.waterfall( [
			function(callback){
				Timecard.findOne( {
					where: { ident: data.identity.id }, sort: 'createdAt DESC'
				}, function(err, clock) {
					if ( clock && clock.clock == 1 ) {
						console.log(clock);
						err = 'Already IN, please !out first, ' + data.author;
					}
					callback(err, clock);
				});
			},
			function(clock, callback) {
				var comment = ( args.length > 0 ) ? args.join(' ') : null;
				Timecard.create( { ident: data.identity.id, clock: 1, comment: comment } ).done( callback );
			}
		], function ( err, result ) {
			if ( err ) {
				console.log(err);
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				data.response = err;
			} else {
				data.response = "IN @ " + result.createdAt;
			}
			sails.controllers.message.send( data );
		});

}

module.exports.help = {
	in: '!in [comment]\n    Clock in for your shift or when returning from lunch.'
}
