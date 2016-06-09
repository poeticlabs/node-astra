// command: back
module.exports = function ( data, args ) {
	var message = sails.config.affirm_array[Math.floor(Math.random()*sails.config.affirm_array.length)];
	data.response = message.replace( '%AUTHOR%', data.author );
	data.response += "Welcome back.";
	return data;
}

module.exports.help = {
	echo: '!back\n    Welcome back!'
}
