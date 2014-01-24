// command: version

module.exports = function ( data, args ) {
	return sails.config.version;
}

module.exports.help = {
	version: 'version\n\tReturn the app version as defined in package.json.'
}
