# ChangeLog: node-astra

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
