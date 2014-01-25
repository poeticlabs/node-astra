// command: ident

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		var identee = null;
		var params = {};

		for ( var i = 0; i < args.length; i++ ) {
			var elems = args[i].split(':');
			if ( elems.length > 0 ) {
				if ( elems[0] == 's' ) {
					params.support = elems[1];
				} else if ( elems[0] == 'c' ) {
					params.control = elems[1];
				} else if ( elems[0] == 'n' ) {
					params.nick = elems[1];
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
						return "I'm sorry " + data.author + ", you are not allowed to do that.";
					}
					identee = elems[1];
				} else if ( elems[0] == 'lv' ) {
					if ( data.identified === false || data.identity.level <= 89 ) {
						return "I'm sorry " + data.author + ", you are not allowed to do that.";
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
					sails.controllers.message.send( data );
				}
			});
		}

	} else {
		if ( data.identified == true ) {
			data.response = JSON.stringify( data.identity );
			sails.controllers.message.send( data );
		} else {
			data.response = "Please see !help ident for more info on this command, " + data.author;
			sails.controllers.message.send( data );
		}

	}
}

module.exports.help = {
	ident: '!ident\t[xo:crossover_user] [c:control_user] [s:support_user]\n'
	+ '\t[n:nickname] [f:first_name] [l:last_name] [e:email]\n'
	+ '\tIdentify yourself across ZL networks, for use with this robot.'
}
