// command: version

module.exports = function ( data, args ) {
	var pkg = require( sails.config.libpath + '/../package.json');
	data.response = pkg.name + '\n'
	+ '"' + pkg.description + '"\n'
	+ "Version: " + pkg.version + '\n'
	+ "Author: " + pkg.author + '\n'
	+ "Dependencies: "
	+ "node(" + pkg.engines.node + "), ";

	for ( var i in pkg.dependencies ) {
		data.response += i + '(' + pkg.dependencies[i] + '), ';
	}

	data.irc_color = 'royal';
	data.xmpp_color = 'blue';
	return data;
}

module.exports.help = {
	version: '!version\n\tReturn the app version as defined in package.json.'
}
