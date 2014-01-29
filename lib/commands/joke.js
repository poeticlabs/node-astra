// command: joke

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		if ( args[0] == 'add' ) {

			var joke = args.slice(1).join(' ');

			Joke.create( {
				data: joke
			} ).done( function ( err, joke ) {
				if ( err ) {
					console.log ( JSON.stringify(err) );
					data.response = "There was an error adding your joke, sorry " + data.author;
					data.irc_color = 'red';
					data.xmpp_color = 'red';
					sails.controllers.message.send( data );
				} else if ( joke ) {
					data.response = "Joke was added suck-cessfully, " + data.author;
					data.irc_color = 'green';
					data.xmpp_color = 'green';
					sails.controllers.message.send( data );
				}
			});

			return;
		}

		// Support the wrong way
		var joke = args.join(' ');

		Joke.create( {
			data: joke
		} ).done( function ( err, joke ) {
			if ( err ) {
				console.log ( JSON.stringify(err) );
				data.response = "There was an error adding your joke, sorry " + data.author;
				data.irc_color = 'red';
				data.xmpp_color = 'red';
				sails.controllers.message.send( data );
			} else if ( joke ) {
				data.response = "Joke was added suck-cessfully, " + data.author;
				data.irc_color = 'green';
				data.xmpp_color = 'green';
				sails.controllers.message.send( data );
			}
		});

	} else {
		Joke.find().done( function(err, jokes) {
			data.response = jokes[ Math.floor( Math.random() * jokes.length ) ].data;
			sails.controllers.message.send( data );
		});
	}
}

module.exports.help = {
	joke: '!joke\n\tObtain a semi-random, possibly-lame joke from our hidden-humor cache.',
	add: '!joke\tadd [joke]\n\tAdd a joke to the database: this oughtta be rich...'
}
