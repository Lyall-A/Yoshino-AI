const Message = require('../resources/Message');
const Member = require('../resources/Member');

class MessageCreate extends Message {
    constructor(event, client) {
        super(event, client);

        this.member = new Member(event.member, client);
        this.guildId = event.guild_id;
        this.getGuild = async () => client.getGuild(event.guild_id);
    }
}

module.exports = MessageCreate;