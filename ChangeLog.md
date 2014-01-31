# ChangeLog: node-astra

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
