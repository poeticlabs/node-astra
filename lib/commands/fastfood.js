// command: fastfood

module.exports = function ( data, args ) {
    var sys = require('sys')
    var exec = require('child_process').exec;
    var child;
    data.response = ''

    if ( args.length == 0 ) {
            args[0] = 'localhost';
    }

    // executes `cmd`
    child = exec("fast-food", function (error, stdout, stderr) {
            var message = sails.config.affirm_array[Math.floor(Math.random()*sails.config.affirm_array.length)];
            data.response = message.replace( '%AUTHOR%', data.author );

            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error != null) {
                console.log('exec error: ' + error);
            }

            if ( stderr != "" ) {
                //data.response = JSON.stringify(stderr);
                data.response = stderr;
                data.irc_color = 'red';
                data.xmpp_color = 'red';
            } else if (stdout != "" ) {
                //data.response = JSON.stringify(stdout);
                data.response += "How about some " + stdout.replace(/\s+$/, '') + "?";
            }

            sails.controllers.message.send(data);

    });

    //return;
}

module.exports.help = {
    'fastfood': '!fastfood\n    Random fast-food ideas.'
}
