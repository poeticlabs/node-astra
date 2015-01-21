// data_object_config

module.exports = (function() {

	return {
		proto: null,
		type: null,
		from: null,
		to: null,
		message: null,
		response: null,
		color: null,
		target: '',
		author: '',
		command: '',
		identified: false,
		identity: {},
		rank: 0,
		allowed_cmds: [ 'help', 'ident', 'version' ],
		version: sails.config.version,
	}
} )();
