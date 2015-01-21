// command: levelup

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		if ( ! args[0].match ( /\d+_\d+/ ) ) {
			args[0] = args[0].replace(/_/, ' ', 'g');
		}

		Identity.findOne( {
			where: {
				or: [ {irc: args[0]}, {xmpp: args[0]}, {nick: args[0]} ]
			}
		}, function ( err, user ) {
			if ( user ) {
				var identee = {};
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

				var new_level = ++identee.identity.level;
				if ( new_level > identee.rank_max_level ) {
					data.response = target + " is at the max level for rank: " + identee.identity.rankname
					+ ", and cannot level any further without being promoted first.";
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
						data.response = "Congratulations! You have gained a level and are now: " + identee.identity.rankname + ", lv. " + new_level;
						sails.controllers.message.send( data );
					} else {
						data.response = "Something seems strange about this...";
						sails.controllers.message.send( data );
					}
				});

			} else {
				data.response = "Sorry, " + data.author + ", I'm unable to level up an unidentified user.";
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				sails.controllers.message.send(data);
			}
		});

	} else {
		var identee = {};
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

		var new_level = ++identee.identity.level;
		if ( new_level > identee.rank_max_level ) {
			data.response = target + " is at the max level for rank: " + identee.identity.rankname
			+ ", and cannot level any further without being promoted first.";
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
				data.response = "Congratulations! You have gained a level and are now: " + identee.identity.rankname + ", lv. " + new_level;
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
	levelup: '!levelup [user]\n    Increase a user\'s ident level by one, as limited by rank.\n'
	+ '    Omit [user] for self.'
}
