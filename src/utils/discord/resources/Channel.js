class Channel {
    constructor(channel, client) {
        this.id = channel.id;
        this.name = channel.name;
        this.topic = channel.topic;
    }
}

module.exports = Channel;