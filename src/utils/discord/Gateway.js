const { EventEmitter } = require('events');

const { GATEWAY_OPCODES } = require('./constants');

class Gateway extends EventEmitter {
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
                    },
                    presence: options?.presence
                });

                await this.getEvent('event:ready'); // Wait for ready event
            });
        });

        this.webSocket.addEventListener('message', ev => {
            const { op, d: data, s: sequence, t: event } = JSON.parse(ev.data);
            const message = { op, data, sequence, event };

            if (sequence) this.sequence = sequence;

            this.emit('message', message);
            this.emit(`op:${op}`, message);
            if (event) this.emit(`event:${event.toLowerCase()}`, message);
        });

        this.webSocket.addEventListener('close', ev => {
            console.log(ev);
        });
    }

    sendOp(op, data, sequence, event) {
        this.webSocket.send(JSON.stringify({
            op: GATEWAY_OPCODES[op],
            d: data ?? null,
            s: sequence,
            t: event
        }));
    }

    getEvent(event) {
        return new Promise((resolve, reject) => {
            this.once(event, messageReceived);
            const eventTimeout = setTimeout(() => reject(`Timed out after ${this.messageTimeout}ms waiting for ${event}`), this.messageTimeout);
    
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
}

module.exports = Gateway;