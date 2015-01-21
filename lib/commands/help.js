// command: help

module.exports = function ( data, args ) {

	var got_help = false;
	data.response = '/code ';

	if ( args.length == 1 ) {

		for ( var i in sails.controllers.command.mods ) {
			if ( args[0] == i ) {
				if ( sails.controllers.command.mods[i].hasOwnProperty('help') ) {
					for ( var j in  sails.controllers.command.mods[i].help ) {
						if ( sails.controllers.command.mods[i].help[j].toString() == '' ) {
							continue;
						}
						got_help = true;
						data.response += sails.controllers.command.mods[i].help[j].toString();
						data.irc_color = 'yellow';
						data.xmpp_color = 'orange';
					}

					sails.controllers.message.send( data );
					data.response = null;
					return;

				}
			}
		}

	} else if ( args.length == 2 ) {

		if ( sails.controllers.command.mods.hasOwnProperty( args[0] ) ) {
			if ( sails.controllers.command.mods[args[0]].hasOwnProperty('help') ) {
				if ( sails.controllers.command.mods[args[0]].help[args[1]] ) {
					data.response += sails.controllers.command.mods[args[0]].help[args[1]].toString();
					data.irc_color = 'yellow';
					data.xmpp_color = 'orange';
					sails.controllers.message.send( data );
					data.response = null;
					return;
				}
			}
		}

	} else {

		for ( var i in sails.controllers.command.mods ) {
			if ( sails.controllers.command.mods[i].hasOwnProperty('help') ) {
				got_help = true;
				var main = '';
				var n = 0;
				for ( var j in  sails.controllers.command.mods[i].help ) {
					if ( n == 0 ) {
						main = j;
					}
					n++;
					//data.response = sails.controllers.command.mods[i].help[j].toString();

					if ( main == j ) {
						data.response += '!help ' + main + '\n';
					} else {
						data.response += '!help ' + main + ' ' + j + '\n';
					}

					data.irc_color = 'yellow';
					data.xmpp_color = 'orange';
				}

			}
		}

		data.response = data.response.replace( /\n$/, '');
		sails.controllers.message.send( data );
		data.response = null;
		return;
	}

	if ( got_help == false ) {
		data.response = "Sorry, " + data.author + ", we found no help for that topic.";
		data.irc_color = 'red';
		data.xmpp_color = 'red';
		return data;
	}

}

module.exports.help = {
	help: "!help [command] [action]\n    This is the help help, confusing: i know.\n",
	man: "!help man\n    There\'s no help for you, maaan."
}
