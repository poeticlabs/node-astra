// command: whosin

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
						if ( clock.clock == 1 ) {
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
				if ( clock.clock == 1 ) {
					anyone = true;
					var display = moment.utc(clock.createdAt + 'Z').local().format('YYYY-MM-DD HH:mm:ss');
					var delta = moment(display).fromNow();


  //var match = data.response.match( /(\d\d\d\d\d?)/ );
  //if ( match != null ) {
  //data.response = data.response.replace( match[1]

					var autoout = false;
					var worked = delta.split(' ');

					if ( worked[1].match(/minute|few/) ) {
						//pass
					} else if ( worked[1].match(/hour/) ) {
						if ( worked[0] != 'an' ) {
							//pass
						} else if ( worked[0] >= 23 ) {
							// auto clock out
							autoout = true;
						}
					} else {
						// auto clock out
						autoout = true;
					}

					if ( autoout == false ) {
						resp = ( user.nick ) ? user.nick : ( user.irc ) ? user.irc : user.xmpp;
						resp += '\tIN ';
						resp += ( clock.comment ) ? clock.comment : '';
						resp += ' ' + display + ' (' + delta + ')';
					} else {
						Timecard.create( { ident: user.id, clock: 0, comment: 'Auto-Out by Astra' } ).done(
							function( err, result ) {
								if ( err ) {
									callback( err, null )
								} else {
									resp = ( user.nick ) ? user.nick : ( user.irc ) ? user.irc : user.xmpp;
									resp += '\twas clocked OUT, having worked ';
									resp += ' (' + worked[0] + ' ' + worked[1] + ')';
								}
							}
						);
					}
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
	whosin: '!whosin\n    Who is currently on shift.\n    Automatic OUT for users IN >= 24 hours.\n    ...and random others, ya know.. for fun.'
}
