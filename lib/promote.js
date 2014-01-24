// command: promote

module.exports = function ( data, args ) {

	//var identee = require('./_verify_ident_rank')(data, args);
	var identee = {};

	if ( args.length > 0 ) {

		Identity.findOne( {
			where: {
				or: [ {user: args[0]}, {xo: args[0]}, {nick: args[0]} ]
			}
		}, function ( err, user ) {
			if ( user ) {
				identee.identity = user;
				identee.identified = true;

				for ( var i = 0; i < sails.config.ranks.length; i++ ) {
					var rank = sails.config.ranks[i];
					if ( identee.identity.level <= rank.max_level && identee.identity.level >= rank.min_level ) {
						identee.rank_max_level = rank.max_level;
						identee.rankname = rank.name;
						identee.rank = i;
					}
				}

				var new_rank = ++identee.rank;
				var new_level = ++identee.rank_max_level;

				if ( new_rank > ( sails.config.ranks.length - 1 ) ) {
					data.response = identee.identity.user + " is at the max rank: " + identee.rankname
					+ ", and cannot be promoted without adding additional ranks to the config. "
					+ "I guess you could say they finished the game, or whatever.";
					sails.controllers.message.send( data );
					return;
				}

				//update user
				Identity.update( {
					user: identee.identity.user
				}, { level: new_level }, function( err, users ) {
					if ( err ) {
						console.log( JSON.stringify(err).error );
						data.response = JSON.stringify(err);
						sails.controllers.message.send( data );
					} else if ( users ) {
						data.response = "Identity " + users[0].user + " updated.";
						sails.controllers.message.send( data );
						//
						data.target = identee.identity.user;
						data.response = "Congratulations! You have been promoted and are now: " + sails.config.ranks[new_rank].name.toString() + ", lv. " + new_level;
						sails.controllers.message.send( data );
					} else {
						data.response = "Something seems strange about this...";
						sails.controllers.message.send( data );
					}
				});

			} else {
				return "Sorry, " + data.author + ", I'm unable to promote an unidentified user.";
			}
		});

	} else {
		//identee.user = data.author;
		identee.identity = data.identity;
		identee.identified = data.identified;

		for ( var i = 0; i < sails.config.ranks.length; i++ ) {
			var rank = sails.config.ranks[i];
			if ( identee.identity.level <= rank.max_level && identee.identity.level >= rank.min_level ) {
				identee.rank_max_level = rank.max_level;
				identee.rankname = rank.name;
				identee.rank = i;
			}
		}

		var new_rank = ++identee.rank;
		var new_level = ++identee.rank_max_level;

		if ( new_rank > ( sails.config.ranks.length - 1 ) ) {
			return identee.identity.user + " is at the max rank: " + identee.rankname
			+ ", and cannot be promoted without adding additional ranks to the config. "
			+ "I guess you could say they finished the game, or whatever.";
		}

		//update user
		Identity.update( {
			user: identee.identity.user
		}, { level: new_level }, function( err, users ) {
			if ( err ) {
				console.log( JSON.stringify(err).error );
				data.response = JSON.stringify(err);
				sails.controllers.message.send( data );
			} else if ( users ) {
				data.response = "Identity " + users[0].user + " updated.";
				sails.controllers.message.send( data );
				//
				data.target = identee.identity.user;
				data.response = "Congratulations! You have been promoted and are now: " + sails.config.ranks[new_rank].name.toString() + ", lv. " + new_level;
				sails.controllers.message.send( data );
			} else {
				data.response = "Something seems strange about this...";
				sails.controllers.message.send( data );
			}
		});

	}

}

module.exports.help = {
	promote: '!promote\t[user]\n\tIncrease a user\'s rank by one, as limited by total ranks.\n'
	+ '\tOmit [user] for self.'
}
