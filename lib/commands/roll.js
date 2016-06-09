// command: roll
module.exports = function ( data, args ) {

	var die_count = 1;
	var die_sides = 100;
	var roll_total = 0;
	var verbose = false;

	data.response = '';

	if ( args[0] != undefined ) {
		if ( args[0].match(/\d?d\d?/) ) {
			var arr = args[0].split("d");
			die_count = arr[0];
			die_sides = arr[1]; 
		} else if ( args[0].match(/\d?/) ) {
			die_sides = args[0];
		}
	}
	if ( args[1] != undefined ) {
		if ( args[1] == 'v' || args[1] == 'verbose' || args[1] == 'long') {
			verbose = true;
		}
	}

	for ( var i = 0; i < die_count; i++ ) {
		var n = Math.floor(Math.random()*die_sides);

		// adjust here for max_roll = die_sides - 1
		// die range should be (1..die_sides)
		n += 1;

		roll_total += n;

		if ( verbose == true ) {
			data.response += "Die " + (i+1) + " Roll: " + n.toString() + "\n";
		}
	}

	var a = "a ";
	var total = roll_total.toString();

	if ( total.match(/^8|11|18|88/) ) {
		a = "an ";
	}

	data.response += "You rolled " + a + total + ".";
	return data;
}

module.exports.help = {
	roll: '!roll [integer|dnd_die_format] [v|verbose]\n    Roll dice in optionally either integer or DND format'
}
