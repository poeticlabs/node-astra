// Identity.js
var Identity = {
	attributes: {
		user: 'STRING',
		level: 'INTEGER',
		first: 'STRING',
		last: 'STRING',
		nick: 'STRING',
		control: 'STRING',
		support: 'STRING',
		emailAddress: {
			type: 'email', // Email type will get validated by the ORM
		}
	}
};

module.exports = Identity;
