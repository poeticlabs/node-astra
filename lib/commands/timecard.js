// command: timecard

module.exports = function ( data, args ) {

	// Time worked

	var moment = require('moment');

	Timecard.query( 'SELECT * FROM timecard WHERE ident = ? AND createdAt >= NOW() - INTERVAL 1 WEEK ORDER BY createdAt ASC', [ data.identity.id ],
	function( err, times ) {
		var total_msecs = 0;
		var timecard = {};

		for ( var i = 0; i < times.length; i++ ) {
			var this_time = times[i];
			var this_day = moment.utc(this_time.createdAt + 'Z').local().format('YYYY-MM-DD');

			if ( timecard[this_day] == undefined ) {
			// first
				timecard[this_day] = [];
				data.response = this_day;
				sails.controllers.message.send( data );

				if ( this_time.clock == 0 ) {
					// worked overnight
					var a = moment.utc( this_time.createdAt + 'Z' ).local().startOf('day');
					var b = moment.utc( this_time.createdAt + 'Z' ).local();
					total_msecs += a.diff(b);
					timecard[this_day].push( '0|' + moment(b).format('HH:mm:ss') );
				}
			} else {

			if ( this_time.clock == 1 ) {
				continue;
			} else {
				var a = moment.utc( this_time.createdAt + 'Z' ).local();
				var b = moment.utc( times[i-1].createdAt + 'Z' ).local();
				total_msecs += a.diff(b);
				timecard[this_day].push( '1|' + moment(b).format('HH:mm:ss') );
				timecard[this_day].push( '0|' + moment(a).format('HH:mm:ss') );
			}

			}

		}

		console.log ( JSON.stringify(timecard) );

		data.irc_color = 'green';
		data.xmpp_color = 'green';
		data.response = 'Time worked this week: ' + moment.duration( total_msecs, 'milliseconds' ).humanize();
		sails.controllers.message.send( data );
		return;

	});

}

module.exports.help = {
	out: '!out [comment]\n    Clock out from your shift or when going to lunch.'
}
