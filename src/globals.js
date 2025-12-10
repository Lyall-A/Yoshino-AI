const { Client, INTENTS } = require('./utils/discord');

const config = require('./config.json');

const globals = {
    config,
    client: new Client({
        token: process.env.DISCORD_TOKEN,
        selfToken: config.userToken,
        intents: [
            INTENTS.GUILDS,
            INTENTS.GUILD_MESSAGES,
            INTENTS.MESSAGE_CONTENT
        ],
        properties: config.discord.properties,
        presence: config.discord.presence
    })
};

module.exports = globals;