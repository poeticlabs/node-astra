// command: set

module.exports = function ( data, args ) {

	if ( args.length > 1 ) {
		var props = args[0].split('.');
		if ( sails.config.hasOwnProperty ( props[0] ) ) {
			if ( sails.config[props[0]].hasOwnProperty( props[1] ) ) {
				var obj = sails.config[props[0]];
				obj[props[1]] = args[1];
			} else {
				sails.config[props[0]] = args[1];
			}
			data.response = args[0] + " set: OK.";
			sails.controllers.message.send( data );
		} else {
			return "That is not a valid config option, " + data.author;
		}
	} else {
		return "Please review !help set for the required arguments, " + data.author;
	}
}

module.exports.help = {
	set: '!set\t[key] [value]\n\tSet various config options for this connected session.\n'
	+ '\tIf you want persistence, edit the config file directly.'
}
