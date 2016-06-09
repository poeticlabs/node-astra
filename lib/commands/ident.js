// command: ident

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {
		var identee = null;
		var params = {};

		if ( args[0] === 'search' ) {

			if ( ! args[1] ) {
				data.response = "Please provide a search string " + data.author;
				data.irc_color = 'red';
				data.xmpp_color = 'red';
			}

			identee = args[1];

			Identity.find( {
				or: [
					{ irc: { contains: identee }, },
					{ xmpp: { contains: identee }, },
					{ nick: { contains: identee }, },
					{ email: { contains: identee }, },
					{ first: { contains: identee }, },
					{ last: { contains: identee }, },
					{ control: { contains: identee }, },
					{ support: { contains: identee }, }
				]
			}).done( function( err, users ) {
				if ( users ) {
					for ( var i = 0; i < users.length; i++ ) {
						data.response = i + ' => ' + JSON.stringify(users[i]);
						sails.controllers.message.send( data );
					}
				} else {
					data.response = "Sorry, " + data.author + ", no identities were found that match that criteria.";
					data.irc_color = 'red';
					data.xmpp_color = 'red';
					sails.controllers.message.send( data );
				}
			});
			return;
		}

		if ( data.type != 'chat' ) {
			data.response = "Please !ident in a Private Message, " + data.author;
			data.irc_color = 'red';
			data.xmpp_color = 'red';
			//sails.controllers.message.send( data );
			return data;
		}

		for ( var i = 0; i < args.length; i++ ) {
			var elems = args[i].split(':');
			if ( elems.length > 0 ) {
				if ( elems[0] == 's' ) {
					params.support = elems[1];
				} else if ( elems[0] == 'c' ) {
					params.control = elems[1];
				} else if ( elems[0] == 'n' ) {
					params.nick = elems[1];
					var underscores = new RegExp( '_', 'g' );
					params.nick = params.nick.replace( underscores, ' ' );
				} else if ( elems[0] == 'e' ) {
					params.email = elems[1];
				} else if ( elems[0] == 'f' ) {
					params.first = elems[1];
				} else if ( elems[0] == 'l' ) {
					params.last = elems[1];
				} else if ( elems[0] == 'xo' ) {
					if ( data.proto == 'irc' ) {
						params.xmpp = elems[1];
					} else {
						params.irc = elems[1];
					}
				} else if ( elems[0] == 'u' ) {
					if ( data.identified === false || data.identity.level <= 89 ) {
						data.response = "I'm sorry " + data.author + ", you are not allowed to do that.";
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						return data;
					}
					identee = elems[1];
				} else if ( elems[0] == 'lv' ) {
					if ( data.identified === false || data.identity.level <= 89 ) {
						data.response = "I'm sorry " + data.author + ", you are not allowed to do that.";
						data.irc_color = 'red';
						data.xmpp_color = 'red';
						return data;
					}
					params.level = elems[1];
				}
			}
		}

		// if we still don't have a user by now...
		if ( identee == null ) {
			identee = data.author;
		}

		if ( data.identified == true ) {
			//update user
			if ( data.proto == 'irc' ) {
				Identity.update( {
					irc: identee
				}, params, function( err, users ) {
					if ( err ) {
						console.log( JSON.stringify(err).error );
						data.response = JSON.stringify(err);
						sails.controllers.message.send( data );
					} else if ( users ) {
						data.response = "Identity " + users[0].irc + " updated.";
						sails.controllers.message.send( data );
					} else {
						data.response = "Something seems strange about this...";
						sails.controllers.message.send( data );
					}
				});
			} else {
				Identity.update( {
					xmpp: identee
				}, params, function( err, users ) {
					if ( err ) {
						console.log( JSON.stringify(err).error );
						data.response = JSON.stringify(err);
						sails.controllers.message.send( data );
					} else if ( users ) {
						data.response = "Identity " + users[0].xmpp + " updated.";
						sails.controllers.message.send( data );
					} else {
						data.response = "Something seems strange about this...";
						sails.controllers.message.send( data );
					}
				});

			}

		} else {
			if ( data.proto == 'irc' ) {
				params.irc = identee;
			} else {
				params.xmpp = identee;
			}

			if ( params.level == null ) {
				params.level = 0;
			};

			Identity.create( params ).done(function(err, user) {
				if ( err ) {
					console.log( JSON.stringify(err).error );
					data.response = JSON.stringify(err);
					sails.controllers.message.send( data );
				} else if ( user ) {
					data.identified = true;
					data.identity = user;
					if ( data.proto == 'irc' ) {
						data.response = "Identity " + user.irc + " created.";
					} else {
						data.response = "Identity " + user.xmpp + " created.";
					}
					sails.controllers.message.send( data );
				} else {
					data.response = "Something seems wrong...";
					data.irc_color = 'red';
					data.xmpp_color = 'red';
					sails.controllers.message.send( data );
				}
			});
		}

	} else {
		if ( data.identified == true ) {
			data.response = JSON.stringify( data.identity );
			//sails.controllers.message.send( data );
			return data;
		} else {
			data.response = "Please see !help ident for more info on this command, " + data.author;
			data.irc_color = 'red';
			data.xmpp_color = 'red';
			//sails.controllers.message.send( data );
			return data;
		}

	}
}

module.exports.help = {
	ident: '!ident [xo:crossover_user] [c:control_user] [s:support_user]\n'
	+ ' [n:nickname] [f:first_name] [l:last_name] [e:email]\n'
	+ '    Identify yourself across ZL networks, for use with this robot.\n'
	+ '    NOTE: For Hipchat, !ident in a Private Message and provide your group-chat nickname as n:nickname\n'
	+ '    (i.e. Astra II = n:Astra_II, Chris Hart = n:Chris_Hart)\n',
	search: '!ident search [string]\n'
	+ '    Search for identities matching string.',
}
