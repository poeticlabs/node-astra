// Identity.js
var Identity = {
	attributes: {
		irc: 'STRING',
		xmpp: 'STRING',
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
