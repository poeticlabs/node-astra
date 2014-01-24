// command: help

module.exports = function ( data, args ) {

	var got_help = false;

	if ( args.length == 1 ) {

		for ( var i in sails.controllers.command.mods ) {
			if ( args[0] == i ) {
				if ( sails.controllers.command.mods[i].hasOwnProperty('help') ) {
					got_help = true;
					return sails.controllers.command.mods[i].help[i].toString();
				}
			}
		}

	} else if ( args.length == 2 ) {

		if ( sails.controllers.command.mods.hasOwnProperty( args[0] ) ) {
			if ( sails.controllers.command.mods[args[0]].hasOwnProperty('help') ) {
				if ( sails.controllers.command.mods[args[0]].help[args[1]] ) {
					return sails.controllers.command.mods[args[0]].help[args[1]].toString();
				}
			}
		}

	} else {

		for ( var i in sails.controllers.command.mods ) {
			if ( sails.controllers.command.mods[i].hasOwnProperty('help') ) {
				for ( var j in  sails.controllers.command.mods[i].help ) {
					got_help = true;
					data.response = sails.controllers.command.mods[i].help[j].toString();
					sails.controllers.message.send( data );
				}

			}
		}

	}

	if ( got_help == false ) {
		return "Sorry, " + data.author + ", we found no help for that topic.";
	}

}

module.exports.help = {
	help: "!help\t[command] [action]\n\tThis is the help help, confusing: i know.",
	man: "!help\tman\n\tThere\'s no help for you, maaan."
}
