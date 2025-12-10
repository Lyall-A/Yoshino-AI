const Ready = require('./events/Ready');
const MessageCreate = require('./events/MessageCreate');
const GuildCreate = require('./events/GuildCreate');

class Event {
    constructor(eventName, data, client) {
        if (eventName === 'READY') return new Event.Ready(data, client);
        if (eventName === 'MESSAGE_CREATE') return new Event.MessageCreate(data, client);
        if (eventName === 'GUILD_CREATE') return new Event.GuildCreate(data, client);

        throw new Error(`Unknown event: ${eventName}`);
    }

    static Ready = Ready;
    static MessageCreate = MessageCreate;
    static GuildCreate = GuildCreate;
}

module.exports = Event;