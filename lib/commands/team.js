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
						Membership.find( { where: { team: args[1] } }, callback );
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

			case 'notify':
				// add, del, list, $team
				var cmd = args[1];

				if ( cmd == "add" ) {
					var team_name = args[2];
					var company_id = args[3];

					Membership.findOne({ team: team_name }).done( function( err, team ) {
						if ( team == null ) {
							data.response = "Sorry, " + data.author + ", I am only able to add notifications to existing teams.";
							data.irc_color = 'red';
							data.xmpp_color = 'red';
							sails.controllers.message.send( data );
							return;
						} else {
							TeamsCompanies.findOne({
								team: team_name,
								company_id: company_id
							}).done( function( err, assoc ) {
								if ( err ) {
									console.log( JSON.stringify(err).error );
									data.response = JSON.stringify(err);
									sails.controllers.message.send( data );
									return;
								} else if ( assoc != null ) {
									data.response = "That company is already associated to that team, " + data.author;
									sails.controllers.message.send( data );
									return;
								} else {
									TeamsCompanies.create({
										team: team_name,
										company_id: company_id
									}).done( function( err, assoc ) {
										if ( err ) {
											console.log( JSON.stringify(err).error );
											data.response = JSON.stringify(err);
											sails.controllers.message.send( data );
										} else if ( assoc != null ) {
											data.response = "Company ID " + company_id + " was successfully associated to the team.";
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

				} else if ( cmd == "del" ) {
					var team_name = args[2];
					var company_id = args[3];

					Membership.findOne({ team: team_name }).done( function( err, team ) {
						if ( team == null ) {
							data.response = "Sorry, " + data.author + ", I am only able to add notifications to existing teams.";
							data.irc_color = 'red';
							data.xmpp_color = 'red';
							sails.controllers.message.send( data );
							return;
						} else {
							TeamsCompanies.findOne({
								team: team_name,
								company_id: company_id
							}).done( function( err, assoc ) {
								if ( assoc == null ) {
									data.response = "Sorry, " + data.author + ", that company is not associated to that team.";
									sails.controllers.message.send( data );
									return;
								} else {
									assoc.destroy( function(err) {
										if ( err == null ) {
											data.response = "Company ID " + company_id + " was disassociated from the team.";
											sails.controllers.message.send( data );
											return;
										}
									});

								}
							});

						}
					});

				} else if ( cmd == "list" ) {
					var team_info = {};
					var team_map = {};
					data.response = '';

					if ( args[2] != undefined ) {
						team_info.team = args[2];

						var exec = require('child_process').exec;
						var child;

						TeamsCompanies.find(team_info).done( function( err, teams ) {
							if ( teams != null ) {
								for ( var i = 0; i < teams.length; i++ ) {
									if ( team_map[ teams[i].team ] == null ) {
										team_map[ teams[i].team ] = [];
									}
									team_map[ teams[i].team ].push(teams[i].company_id);
								}
							} else {
								data.response = "Sorry, " + data.author + ", no company-to-team associations were found.";
								sails.controllers.message.send( data );
								return;
							}

							for ( var k in team_map ) {
								data.response = k;
								sails.controllers.message.send(data);

								for ( var i = 0; i < team_map[k].length; i++ ) {
									var c_id = team_map[k][i];

										child = exec( 'ssh ' + sails.config.support.host + ' "/root/get-companies.pl 0 | grep ^' + c_id + ' | cut -f2"',
											function (error, stdout, stderr) {

												console.log('stderr: ' + stderr);

												if ( stdout ) {
													data.response = " * " + stdout;
												} else {
													data.response = "Sorry, " + data.author + ", something was not quite right about that.";
												}

												if (error !== null) {
													console.log('exec error: ' + error);
													data.response = error;
												}
												sails.controllers.message.send( data );
											});
								}
							}
						});
					} else {
						TeamsCompanies.find().done( function( err, teams ) {
							if ( teams != null ) {
								var seen = {};
								for ( var i = 0; i < teams.length; i++ ) {
									var t = teams[i].team;
									if ( seen[t] == null ) {
										data.response += t + "\n";
										seen[t] = true;
									}
								}
							} else {
								data.response = "Sorry, " + data.author + ", no company-to-team associations were found.";
							}
							sails.controllers.message.send( data );
							return;

						});
					}
					return;

				} else {
					// assume this is a team notification toggle then
					var team = args[1];
					var toggle = 0;

					if ( args[2] == "enable" ) {
						toggle = 1;
					} else if ( args[2] == "disable" ) {
						toggle = 0;
					}

					async.waterfall([
						function(callback){
							Membership.update( {
								ident: data.identity.id,
								team: team,
							}, { notify: toggle }, function( err, users ) {
								if ( err ) {
									callback( "Please check !help team notify for more info on how to use this command, " + data.author, null );
								} else if ( users == undefined ) {
									callback( "Please check !help team notify for more info on how to use this command, " + data.author, null );
								} else if ( users ) {
									callback( null, "Ok, " + data.author + ", personal notifications for team " + users[0].team + " set to " + toggle );
								}
							});
						}
					], function (err, result) {
						if ( err ) {
							data.response = err;
							data.irc_color = 'red';
							data.xmpp_color = 'red';
							sails.controllers.message.send( data );
							return;
						};
						data.response = result;
						sails.controllers.message.send( data );
					});

				}

				return;
				break; // case: notify

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
	members: '!team members [team_string]\n    List the members of support teams matching string.\n',
	notify: '!team notify add [team] [company_id]\n    Associate Company to Team.\n'
	+ '!team notify del [team] [company_id]\n    Disassociate Company from Team.\n'
	+ '!team notify list [team]\n    List Company IDs associated to optional arg team, or all teams.\n'
	+ '!team notify [team] [enable|disable]\n    Toggle personal notifications for team.\n'
}
