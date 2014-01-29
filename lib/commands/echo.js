// command: echo
module.exports = function ( data, args ) {
	data.response = args.join(' ');
	return data;
}

module.exports.help = {
	echo: '!echo\t[message]\n\tEcho Echo!'
}
