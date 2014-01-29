// command: exit

module.exports = function ( data, args ) {
	data.response = 'So long and thanks for all the bits!';
	data.irc_color = 'rainbow';
	data.xmpp_color = 'pink';
	sails.controllers.message.send(data);

	console.log( "Exiting...".rainbow );

	return process.exit(0);
}

module.exports.help = {
	exit: '!exit\n\tExit Program!'
}
