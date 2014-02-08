// Start sails and pass it command line arguments
//require('strong-agent').profile();
require('sails').lift(require('optimist').argv);
