const { EventEmitter } = require('events');

class DiscordGateway extends EventEmitter {
    constructor(options = { }) {
        super();

        this.gatewayBaseUrl = options.gatewayBaseUrl || 'wss://gateway.discord.gg';
        this.gatewayVersion = options.gatewayVersion || 10;
        this.messageTimeout = options.messageTimeout || 5000;
    }

    connect(token, intents, options = { }) {
        this.token = token;

        this.webSocket = new WebSocket(`${this.gatewayBaseUrl}?v=${this.gatewayVersion}`);

        this.webSocket.addEventListener('open', () => {
            this.once('op:10', async message => {
                // Setup heartbeat
                this.heartbeatInterval = message.data.heartbeat_interval;
                await this.heartbeatLoop();

                // Identify
                this.sendOp('IDENTIFY', {
                    token,
                    intents: intents.reduce((acc, curr) => acc + curr, 0),
                    properties: {
                        os: options?.properties?.os,
                        browser: options?.properties?.browser,
                        device: options?.properties?.device,
                    }
                });

                await this.getEvent(DiscordGateway.EVENTS.READY);
            });
        });

        this.webSocket.addEventListener('message', ev => {
            const { op, d: data, s: sequence, t: event } = JSON.parse(ev.data);
            const message = { op, data, sequence, event };

            if (sequence) this.sequence = sequence;

            if (event === 'READY') {
                this.user = data.user;
            }

            this.emit(`op:${op}`, message);
            if (event) this.emit(`event:${event.toLowerCase()}`, message);
        });
    }

    sendOp(op, data, sequence, event) {
        this.webSocket.send(JSON.stringify({
            op: DiscordGateway.OPCODES[op],
            d: data ?? null,
            s: sequence,
            t: event
        }));
    }

    getEvent(event) {
        return new Promise((resolve, reject) => {
            this.once(event, messageReceived);
            const eventTimeout = setTimeout(() => reject(), this.messageTimeout);
    
            function messageReceived(message) {
                clearTimeout(eventTimeout);
                resolve(message);
            }
        });
    }

    async sendHeartbeat() {
        this.sendOp('HEARTBEAT', this.sequence);
        await this.getEvent('op:11');
    }

    heartbeatLoop = async () => {
        if ((!this.heartbeatTimeout && Math.floor(Math.random() * (1 + 1)) > 0) || this.heartbeatTimeout) await this.sendHeartbeat(); // 50% chance of sending heartbeat immediately
        this.heartbeatTimeout = setTimeout(this.heartbeatLoop, this.heartbeatInterval);
    }

    static OPCODES = {
        DISPATCH: 0,
        HEARTBEAT: 1,
        IDENTIFY: 2,
        PRESENCE_UPDATE: 3,
        VOICE_STATE_UPDATE: 4,
        RESUME: 6,
        RECONNECT: 7,
        REQUEST_GUILD_MEMBERS: 8,
        INVALID_SESSION: 9,
        HELLO: 10,
        HEARTBEAT_ACK: 11,
        REQUEST_SOUNDBOARD_SOUNDS: 31
    }

    static INTENTS = {
        GUILDS: 1 << 0,
        GUILD_MEMBERS: 1 << 1,
        GUILD_MODERATION: 1 << 2,
        GUILD_EXPRESSIONS: 1 << 3,
        GUILD_INTEGRATIONS: 1 << 4,
        GUILD_WEBHOOKS: 1 << 5,
        GUILD_INVITES: 1 << 6,
        GUILD_VOICE_STATES: 1 << 7,
        GUILD_PRESENCES: 1 << 8,
        GUILD_MESSAGES: 1 << 9,
        GUILD_MESSAGE_REACTIONS: 1 << 10,
        GUILD_MESSAGE_TYPING: 1 << 11,
        DIRECT_MESSAGES: 1 << 12,
        DIRECT_MESSAGE_REACTIONS: 1 << 13,
        DIRECT_MESSAGE_TYPING: 1 << 14,
        MESSAGE_CONTENT: 1 << 15,
        GUILD_SCHEDULED_EVENTS: 1 << 16,
        AUTO_MODERATION_CONFIGURATION: 1 << 20,
        AUTO_MODERATION_EXECUTION: 1 << 21,
        GUILD_MESSAGE_POLLS: 1 << 24,
        DIRECT_MESSAGE_POLLS : 1 << 25
    }

    static EVENTS = {
        // TODO: implement rest
        READY: 'event:ready',
        MESSAGE_CREATE: 'event:message_create'
    }

    static MESSAGE_FLAGS = {
        // todo: implement rest
        IS_VOICE_MESSAGE: 1 << 13
    }
}

module.exports = DiscordGateway;