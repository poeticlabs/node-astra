// command: team

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		switch ( args[0] ) {

			case 'add':

				var identee = args[1];

				Identity.findOne( {
					or: [
						{ irc: identee },
						{ xmpp: identee },
						{ nick: identee },
						{ email: identee },
						{ first: identee },
						{ last: identee },
						{ control: identee },
						{ support: identee }
					]
				}).done( function( err, user ) {

					if ( user == null ) {

						data.response = "Sorry, " + data.author + ", I am only able to add idented users to support teams.";
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						sails.controllers.message.send( data );
						return;

					} else {

						Membership.findOne({
							ident: user.id,
							team: args[2].toLowerCase()
						}).done( function( err, member ) {

							if ( err ) {
								console.log( JSON.stringify(err).error );
								data.response = JSON.stringify(err);
								sails.controllers.message.send( data );
								return;
							} else if ( member != null ) {
								data.response = "That user is already on that team, " + data.author;
								sails.controllers.message.send( data );
								return;
							} else {
								Membership.create({
									ident: user.id,
									team: args[2].toLowerCase()
								}).done( function( err, member ) {
									if ( err ) {
										console.log( JSON.stringify(err).error );
										data.response = JSON.stringify(err);
										sails.controllers.message.send( data );
									} else if ( member != null ) {
										data.response = identee + " was successfully added to the team.";
										sails.controllers.message.send( data );
									} else {
										data.response = "Something unexpected happened, which is never good.";
										data.irc_color = 'red';
										data.xmpp_color = 'red';
										sails.controllers.message.send( data );
									}
									return;
								});

							}
						});

					}
				});

				return;
				break; // case: add

			case 'del':

				var identee = args[1];

				Identity.findOne( {
					or: [
						{ irc: identee },
						{ xmpp: identee },
						{ nick: identee },
						{ email: identee },
						{ first: identee },
						{ last: identee },
						{ control: identee },
						{ support: identee }
					]
				}).done( function( err, user ) {

					if ( user == null ) {

						data.response = "Sorry, " + data.author + ", I am only able to add idented users to support teams.";
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						sails.controllers.message.send( data );
						return;

					} else {

						Membership.findOne({
							ident: user.id,
							team: args[2].toLowerCase()
						}).done( function( err, member ) {

							if ( member == null ) {
								data.response = "Sorry, " + data.author + ", that user is not on that team.";
								sails.controllers.message.send( data );
								return;
							} else {
								member.destroy( function(err) {
									if ( err == null ) {
										data.response = identee + " was removed from the team.";
										sails.controllers.message.send( data );
										return;
									}
								});

							}
						});

					}
				});

				return;
				break; // case: del

			case 'list':

				var team_counts = {};

				Membership.find().done( function( err, teams ) {
					if ( teams != null ) {
						console.log ( teams );

						for ( var i = 0; i < teams.length; i++ ) {
							if ( team_counts[ teams[i].team ] == null ) {
								team_counts[ teams[i].team ] = 0;
							}
							team_counts[ teams[i].team ]++;
						}

					} else {
						data.response = "Sorry, " + data.author + ", no teams were found.";
						sails.controllers.message.send( data );
						return;
					}

					for ( var i in team_counts ) {
						data.response = i + "\t\t" + team_counts[i];
						sails.controllers.message.send( data );
					}

					return;
				});

				return;
				break; // case: list

			case 'members':
				console.log ( 'sub cmd: members' );

				async.waterfall([
					function(callback){
						Membership.find( { team: { contains: args[1] } }, callback );
					},
					function(members, callback){
						for ( var i = 0; i < members.length; i++ ) {
							Identity.findOne( { id: members[i].ident }, function(err,user) {
								if ( user ) {
									callback(null, user.support);
								}
							});
						}
					}
				], function (err, result) {
					if ( err ) {
						data.response = "Sorry, " + data.author + ", we found no team called that, or no members.. (same thing.)";
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						sails.controllers.message.send( data );
						return;
					};
					data.response = result;
					sails.controllers.message.send( data );
				});

				return;
				break; // case: members

		} // switch

	} else {
		data.response = "Please see !help team for more info on how to use this command, " + data.author;
		return data;
	}
}

module.exports.help = {
	team: '!team [option] [params]\n    Command for associating idented users to support teams, etc.\n',
	add: '!team add [ident] [team]\n    Add an identified user to a support team.\n',
	del: '!team del [ident] [team]\n    Remove a user from a support team.\n'
	+ '    Note that a team ceases to exist once all members are removed.\n',
	list: '!team list\n    List the support teams and their member counts.\n',
	members: '!team members [team_string]\n    List the members of support teams matching string.'
}
