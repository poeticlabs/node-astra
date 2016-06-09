// Membership.js
var Membership = {
	attributes: {
		ident: 'INTEGER',
		team: 'STRING',
		notify: {
			type: 'INTEGER',
			maxLength: 1,
			defaultsTo: 1,
		},
	}
};

module.exports = Membership;
