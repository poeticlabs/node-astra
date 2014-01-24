// command: echo
module.exports = function ( data, args ) {
	return args.join(' ');
}

module.exports.help = {
	echo: 'echo\t[message]\n\tEcho Echo!'
}
