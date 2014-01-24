// command: levelup

module.exports = function ( data, args ) {

//	var identee = require('./_verify_ident_rank')(data, args).identee;
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

				var new_level = ++identee.identity.level;
				if ( new_level > identee.rank_max_level ) {
					data.response = identee.identity.user + " is at the max level for rank: " + identee.rankname
					+ ", and cannot level any further without being promoted first.";
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
						data.response = "Congratulations! You have gained a level and are now: " + identee.rankname + ", lv. " + new_level;
						sails.controllers.message.send( data );
					} else {
						data.response = "Something seems strange about this...";
						sails.controllers.message.send( data );
					}
				});

			} else {
				return "Sorry, " + data.author + ", I'm unable to level up an unidentified user.";
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

		var new_level = ++identee.identity.level;
		if ( new_level > identee.rank_max_level ) {
			return identee.identity.user + " is at the max level for rank: " + identee.rankname
			+ ", and cannot level any further without being promoted first.";
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
				data.response = "Congratulations! You have gained a level and are now: " + identee.rankname + ", lv. " + new_level;
				sails.controllers.message.send( data );
			} else {
				data.response = "Something seems strange about this...";
				sails.controllers.message.send( data );
			}
		});

	}
}

module.exports.help = {
	levelup: 'levelup\t[user]\n\tIncrease a user\'s ident level by one, as limited by rank.\n'
	+ 'Omit [user] for self.'
}
