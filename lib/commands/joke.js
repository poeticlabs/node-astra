// command: joke

module.exports = function ( data, args ) {

	if ( args.length > 0 ) {

		/*if ( args[0] == 'add' ) {

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
		}*/

		//data.response = "Sorry, " + data.author + ", that did not register high enough on the funnometer to be included: better luck next time.";
		data.response = "Sorry, " + data.author + ", joke add has been disabled due to the use of un-PC jokes.\nPlease refer any questions to: /dev/null.";
		//sails.controllers.message.send( data );
		return data;

	} else {
		Joke.find().done( function(err, jokes) {
			data.response = jokes[ Math.floor( Math.random() * jokes.length ) ].data;
			sails.controllers.message.send( data );
		});
	}
}

module.exports.help = {
	joke: '!joke\n    Obtain a semi-random, possibly-lame joke from our hidden-humor cache.\n',
	add: '!joke add [joke]\n    Add a joke to the database: this oughtta be rich...'
}
