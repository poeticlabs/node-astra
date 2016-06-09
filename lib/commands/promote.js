// command: promote

module.exports = function ( data, args ) {

	//var identee = require('./_verify_ident_rank')(data, args);
	var identee = {};

	if ( args.length > 0 ) {

		if ( ! args[0].match ( /\d+_\d+/ ) ) {
			var underscores = new RegExp( '_', 'g' );
			args[0] = args[0].replace(underscores, ' ');
		}

		Identity.findOne( {
			where: {
				or: [ {irc: args[0]}, {xmpp: args[0]}, {nick: args[0]}, {control: args[0]}, {support: args[0]}, {email: args[0]} ]
			}
		}, function ( err, user ) {
			if ( user ) {
				identee.identity = user;
				identee.identified = true;

				var target = '';

				if ( data.proto == 'irc' ) {
					target = identee.identity.irc;
				} else {
					target = identee.identity.xmpp;
				}

				for ( var i = 0; i < sails.config.ranks.length; i++ ) {
					var rank = sails.config.ranks[i];
					if ( identee.identity.level <= rank.max_level && identee.identity.level >= rank.min_level ) {
						identee.rank_max_level = rank.max_level;
						identee.identity.rankname = rank.name;
						identee.identity.rank = i;
					}
				}

				var new_rank = ++identee.identity.rank;
				var new_level = ++identee.rank_max_level;

				if ( new_rank > ( sails.config.ranks.length - 1 ) ) {
					data.response = target + " is at the max rank: " + identee.identity.rankname
					+ ", and cannot be promoted without adding additional ranks to the config. "
					+ "I guess you could say they finished the game, or whatever.";
					data.irc_color = 'red';
					data.xmpp_color = 'red';
					sails.controllers.message.send( data );
					return;
				}

				//update user
				Identity.update( {
					where: {
						or: [ {irc: identee.identity.irc}, {xmpp: identee.identity.xmpp} ]
					}
				}, { level: new_level }, function( err, users ) {
					if ( err ) {
						console.log( JSON.stringify(err).error );
						data.response = JSON.stringify(err);
						sails.controllers.message.send( data );
					} else if ( users ) {
						data.response = "Identity " + target + " updated.";
						sails.controllers.message.send( data );
						//
						data.target = target;
						data.type = 'chat';
						data.response = "Congratulations! You have been promoted and are now: " + sails.config.ranks[new_rank].name.toString() + ", lv. " + new_level;
						sails.controllers.message.send( data );
					} else {
						data.response = "Something seems strange about this...";
						sails.controllers.message.send( data );
					}
				});

			} else {
				data.response = "Sorry, " + data.author + ", I'm unable to promote an unidentified user.";
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				sails.controllers.message.send( data );
			}
		});

	} else {
		//identee.user = data.author;
		identee.identity = data.identity;
		identee.identified = data.identified;

		var target = '';

		if ( data.proto == 'irc' ) {
			target = identee.identity.irc;
		} else {
			target = identee.identity.xmpp;
		}

		for ( var i = 0; i < sails.config.ranks.length; i++ ) {
			var rank = sails.config.ranks[i];
			if ( identee.identity.level <= rank.max_level && identee.identity.level >= rank.min_level ) {
				identee.rank_max_level = rank.max_level;
				identee.identity.rankname = rank.name;
				identee.identity.rank = i;
			}
		}

		var new_rank = ++identee.identity.rank;
		var new_level = ++identee.rank_max_level;

		if ( new_rank > ( sails.config.ranks.length - 1 ) ) {
			data.response = target + " is at the max rank: " + identee.identity.rankname
			+ ", and cannot be promoted without adding additional ranks to the config. "
			+ "I guess you could say they finished the game, or whatever.";
			data.irc_color = 'red';
			data.xmpp_color = 'red';
			return data;
		}

		//update user
		Identity.update( {
			//where: {
				//or: [ {irc: identee.identity.irc}, {xmpp: identee.identity.xmpp} ]
				id: identee.identity.id
			//}
		}, { level: new_level }, function( err, users ) {
			if ( err ) {
				console.log( JSON.stringify(err).error );
				data.response = JSON.stringify(err);
				sails.controllers.message.send( data );
			} else if ( users ) {
				data.response = "Identity " + target + " updated.";
				sails.controllers.message.send( data );
				//
				data.target = target;
				data.response = "Congratulations! You have been promoted and are now: " + sails.config.ranks[new_rank].name.toString() + ", lv. " + new_level;
				sails.controllers.message.send( data );
			} else {
				data.response = "Something seems strange about this...";
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				sails.controllers.message.send( data );
			}
		});

	}

}

module.exports.help = {
	promote: '!promote [user]\n    Increase a user\'s rank by one, as limited by total ranks.\n'
	+ '    Omit [user] for self.'
}
