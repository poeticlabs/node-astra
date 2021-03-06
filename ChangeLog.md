# ChangeLog: node-astra

## 2.2.0 (06/09/2016)
* Many fixes, commands, hipchat support, etc

## 2.1.1 (01/22/2015)
* Added !lunch
* Added random affirmation response array
* Updated local.js.example

## 2.1.0 Release
* Converted XMPP to Hipchat
* Added auto-out to !whosin
* Added super-secret !friday
* Various other tweaks and fixes

## 2.0.0-beta.RC3
* Added !in, !out, !report, !whosin, !whosout
* Fix issue with XMMP data.target preventing chats

## 2.0.0-beta.RC2
* Added !leave, !mode, !return, !team, !ticket
* Reworked !add_chan and !which_chan into !channel
* Replaced callback-hell with async.waterfall
* General code/repo cleanup

## 2.0.0-beta.RC1
* Added !aop, !cq, !eq, !exit, !joke, !mq, !reload
* Base API v1 to v2 passthrough
* Added XO channel-exits and entries
* Added StrongOps profiling
* Added manual http session garbage collection
* Reworked color object instantiation per response
* Modify Joke model data VARCHAR to TEXT

## 2.0.0-alpha Release
* Bot now identifies with NickServ/OperServ
* !add_chan now sets access levels / conference affiliation of message author
* Reworked !add_chan to accept a list of additional users to be Op/Admin
* Reworked Identity model for better XO awareness when adding channels
* Wrapped bootstrap in a function for async callback
* Various other fixes for production readiness

## 2.0.0-pre-alpha.RC2
* Added colors to chat protocol output
* Added !set for dynamic configging
* Split responses into separate lines, so we never hit the character limit
* Adjusted !help output for better looking XMPP messages
* Removed separate verify require module, due to async issues

## 2.0.0-pre-alpha.RC1
* Added !ident and Ranks(ACL)
* Added XMPP Subscription handling based on user ident/rank
* Added !levelup and !promote
* Added !help and help handling for all commands
* Added a ChangeLog, haha

## 2.0.0-pre-alpha
* Base dual-client (IRC/XMPP) functionality
* Base XO functionality
* Base API functionality
* Base Message processing functionality
* Base CommandController interface functionality
