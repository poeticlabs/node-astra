// command: return

module.exports = function ( data, args ) {

	Mode.findOne( {
		ident: data.identity.id
	}, function ( err, mode ) {

		if ( mode ) {
			data.message = mode.data;
			mode.destroy( function(err) {
				sails.controllers.message.process( data );
				return;
			});
		} else if ( err ) {
			console.log( JSON.stringify(err).error );
			data.irc_color = 'red';
			data.xmpp_color = 'red';
			data.response = JSON.stringify(err);
			sails.controllers.message.send( data );
			return;
		} else {
			data.response = "You are already in chat mode, " + data.author;
			data.irc_color = 'red';
			data.xmpp_color = 'red';
			sails.controllers.message.send( data );
			return;
		}

	});

}

module.exports.help = {
	'return': '!return\n    Concat your !mode command and send it to the message controller for processing.\n'
	+ '    Then return to chat mode.'
}
