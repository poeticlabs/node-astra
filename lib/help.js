// command: help

module.exports = function ( data, args ) {

	if ( args.length == 1 ) {

		for ( var i in sails.controllers.command.mods ) {
			if ( args[0] == i ) {
				if ( sails.controllers.command.mods[i].hasOwnProperty('help') ) {
				//if ( sails.controllers.command.mods[i].help != undefined ) {
					return sails.controllers.command.mods[i].help[i].toString();
				}
			}
		}

	} else if ( args.length == 2 ) {

		if ( sails.controllers.command.mods[args[0]].help[args[1]] ) {
			return sails.controllers.command.mods[args[0]].help[args[1]].toString();
		}

	} else {

		for ( var i in sails.controllers.command.mods ) {
			if ( sails.controllers.command.mods[i].hasOwnProperty('help') ) {

				for ( var j in  sails.controllers.command.mods[i].help ) {
					console.log( i, j );
					data.response = sails.controllers.command.mods[i].help[j].toString();
					sails.controllers.message.send( data );
				}

			}
		}

	}

}

module.exports.help = {
	help: "help\t[command] [action]\n\tThis is the help help, confusing: i know.",
	man: "man\n\tThere\'s no help for you, maaan."
}
