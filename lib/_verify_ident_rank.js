
module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		Identity.findOne( {
			where: {
				or: [ {user: args[0]}, {xo: args[0]}, {nick: args[0]} ]
			}
		}, function ( err, user ) {
			var identee = {};
			if ( user ) {
				console.log (user);
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

				return identee;

			} else {
				identee.identified = false;
				identee.identity = {
					level: 0,
				}
			}
		});

	} else {
		var identee = {};
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

		return identee;
	}

}
