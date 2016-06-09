// command: flipcoin
module.exports = function ( data, args ) {
	var n = Math.round(Math.random()*1);
	if ( n == 1 ) {
		data.response = "Heads.";
	} else if ( n == 0 ) {
		data.response = "Tails.";
	} else {
		data.response = "Sides. :O";
	}
	return data;
}

module.exports.help = {
	flipcoin: '!flipcoin\n    Heads or Tails!'
}
