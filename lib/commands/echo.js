// command: echo
module.exports = function ( data, args ) {
	data.response = args.join(' ');
	return data;
}

module.exports.help = {
	echo: '!echo [message]\n    Echo Echo!'
}
