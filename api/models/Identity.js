// Identity.js
var Identity = {
	attributes: {
		user: 'STRING',
		xo: 'STRING',
		level: 'INTEGER',
		first: 'STRING',
		last: 'STRING',
		nick: 'STRING',
		control: 'STRING',
		support: 'STRING',
		email: {
			type: 'email', // Email type will get validated by the ORM
		}
	}
};

module.exports = Identity;
