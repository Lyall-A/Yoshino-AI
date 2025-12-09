// Utils
const DiscordGateway = require('./utils/DiscordGateway');
const generateMessage = require('./utils/generateMessage');
const generateVoice = require('./utils/generateVoice');
const sendMessage = require('./utils/sendMessage');

const { config } = require('./globals');

const discord = new DiscordGateway();

console.log('Logging in give me a second');
discord.once(DiscordGateway.EVENTS.READY, () => {
    console.log(`${discord.user.global_name || discord.user.username} is awake!`);
});

discord.on(DiscordGateway.EVENTS.MESSAGE_CREATE, async ({ data: message }) => {
    if (message.author.id === discord.user.id) return; // Ignore self
    if (message.author.bot && config.ignoreBots) return; // Ignore bots

    if (config.guilds?.length > 0 && !config.guilds.includes(message.guild_id)) return;
    if (config.channels?.length > 0 && !config.channels.includes(message.channel_id)) return;
    if (config.users?.length > 0 && !config.users.includes(message.author.id)) return;

    const generatedMessage = await generateMessage('you are a kawaii anime girl', message.content);
    const generatedVoice = config.elevenLabs.enabled ? await generateVoice(generatedMessage.content) : null;
    
    await sendMessage(message.channel_id, generatedMessage, generatedVoice);
});

discord.connect(process.env.DISCORD_TOKEN, [
    DiscordGateway.INTENTS.GUILDS,
    DiscordGateway.INTENTS.GUILD_MESSAGES,
    DiscordGateway.INTENTS.MESSAGE_CONTENT
], {
    properties: config.properties
});