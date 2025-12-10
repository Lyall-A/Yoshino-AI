// Utils
const { EVENTS, ROUTES } = require('./utils/discord');
const generateMessage = require('./utils/generateMessage');
const generateVoice = require('./utils/generateVoice');
const sendMessage = require('./utils/sendMessage');

// Prompts
const { createSystemPrompt } = require('./prompts');

const { config, client } = require('./globals'); // Globals

const cacheList = [ ];

// Ready
console.log('Logging in give me a second');
client.once(EVENTS.READY, () => {
    console.log(`${client.user.global_name || client.user.username} is awake!`);
});

// Message create
client.on(EVENTS.MESSAGE_CREATE, async message => {
    if (message.author.id === client.user.id) return; // Ignore self
    if (message.author.bot && config.ignoreBots) return; // Ignore bots

    if (config.guilds?.length > 0 && !config.guilds.includes(message.guildId)) return;
    if (config.channels?.length > 0 && !config.channels.includes(message.channelId)) return;
    if (config.users?.length > 0 && !config.users.includes(message.author.id)) return;

    const messageResponseType = ['text', 'attachment', 'both', 'voice'].find(type => type === config.messageResponseType.toLowerCase()) ?? 'text';
    const voiceEnabled = config.elevenLabs.enabled && (messageResponseType === 'attachment' || messageResponseType === 'both' || messageResponseType === 'voice');
    const messageResponseFeatures = {
        text: messageResponseType === 'text' || messageResponseType === 'both',
        attachment: voiceEnabled && (messageResponseType === 'attachment' || messageResponseType === 'both'),
        voice: voiceEnabled && (messageResponseType === 'voice')
    }
    
    const cache = await getCache();
    const { guild, channels, messages, responses } = cache;
    const channel = channels[message.channelId];
    const channelMessages = messages[channel.id];
    const channelResponses = responses[channel.id];

    cache.lastMessage = Date.now();
    channelMessages.push({
        id: message.id,
        content: message.content,
        timestamp: cache.lastMessage,
    });

    const promptOptions = {
        message,
        guild,
        channel
    };

    const beforeGenerateMessage = Date.now();
    const generatedMessage = await generateMessage(createSystemPrompt(promptOptions), channelMessages, channelResponses);
    const afterGenerateMessage = Date.now();

    const beforeGenerateVoice = afterGenerateMessage;
    const generatedVoice = voiceEnabled ? await generateVoice(generatedMessage.content) : null;
    const afterGenerateVoice = Date.now()

    cache.lastResponse = Date.now();
    channelResponses.push({
        timestamp: lastResponse,
        generateMessageTime: afterGenerateMessage - beforeGenerateMessage,
        generateVoiceTime: afterGenerateVoice - beforeGenerateVoice,
        features: messageResponseFeatures,
        content: generatedMessage.content
    });

    await sendMessage(message.channelId, generatedMessage, generatedVoice, messageResponseFeatures);

    async function getCache() {
        let cache = cacheList.find(cache => cache.guild.id === message.guildId);
        if (!cache) {
            cache = {
                guild: await message.getGuild(),
                members: { },
                channels: { },
                messages: { },
                responses: { },
                lastMessage: null,
                lastResponse: null,
            };
            cacheList.push(cache);
        };
        if (!cache.channels[message.channelId]) {
            const channel = await message.getChannel();

            cache.channels[channel.id] = channel;
            cache.messages[channel.id] = [ ];
            cache.responses[channel.id] = [ ];
        }
        return cache;
    }
});

// Connect to Discord gateway
client.connect();