class Message {
    constructor(message, client) {
        this.id = message.id;
        this.content = message.content;
        this.author = message.author;
        this.timestamp = new Date(message.timestamp).getTime();
        this.channelId = message.channel_id;
        this.getChannel = async () => client.getChannel(message.channel_id);
    }
}

module.exports = Message;