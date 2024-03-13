# How To Use this

## Channels

A channel is composed by 
an id (uuid),
a name (string),
a users (deprecated),
a key (wip)
an avatar (string)
an owner (User foreign key from user id)

### To work with channels
Work with channels is basically simple, to have a user in a channel you will have to use the channelsrelation table.

to show messages use table message and where channelID is this channel

## Users

An user is composed by
an id (uuid)
a username (string)
a password (string hashed)
an avatar (string)
and a boolean (operator)

## Channels Relations

A channel relation is composed by
an id (uuid)
a userID (user id foreign key)
a channelID (channel id foreign key)
a channOP (boolean)

## Messages

A message is composed by
an id (uuid)
a text (string)
a userID (user id foreign key)
a channelID (channel id foreign key)

