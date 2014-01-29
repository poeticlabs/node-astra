// command: which_chan

module.exports = function ( data, args ) {
	data.response = data.target;
	return data;
}

module.exports.help = {
	which_chan: '!which_chan\n\tReturn the channel name of this channel, (from my POV.)'
}
