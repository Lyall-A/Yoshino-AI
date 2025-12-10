const EventEmitter = require('events');

const REST = require('./REST');
const Gateway = require('./Gateway');
const Event = require('./Event');
const resources = require('./resources');
const { ROUTES } = require('./constants');

class Client extends EventEmitter {
    constructor(options = { }) {
        super();

        this.token = options.token;
        this.intents = options.intents;
        this.properties = options.properties;
        this.presence = options.presence;
        
        this.rest = new REST({
            authorization: `${!options.userToken ? 'Bot ' : ''}${this.token}`
        });
        this.gateway = new Gateway();
        this.cache = { }; // TODO

        this.gateway.on('message', ({ event: eventName, data }) => {
            if (!eventName) return;

            try {
                const event = new Event(eventName, data, this);
    
                if (event instanceof Event.Ready) {
                    this.user = event.user;
                }
    
                this.emit(eventName.toLowerCase(), event);
            } catch (err) {
                // event likely not implemented
                console.log(err);
            }
        });
    }

    async getChannel(channelId) {
        return this.rest.get(ROUTES.GET_CHANNEL(channelId)).then(({ json }) => new resources.Channel(json, this));
    }

    getGuild = async (guildId) => this.rest.get(ROUTES.GET_GUILD(guildId)).then(({ json }) => new resources.Guild(json, this));
    getChannel = async (channelId) => this.rest.get(ROUTES.GET_CHANNEL(channelId)).then(({ json }) => new resources.Channel(json, this));
    
    connect() {
        this.gateway.connect(this.token, this.intents, {
            properties: this.properties,
            presence: this.presence
        });
    }
}

module.exports = Client;