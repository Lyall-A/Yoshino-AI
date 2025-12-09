const fs = require('fs');
const { Client, Events, GatewayIntentBits, MessageFlags, Routes } = require('discord.js');

const generateMessage = require('./utils/generateMessage');
const generateVoice = require('./utils/generateVoice');

const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ]
});

console.log('Logging in give me a second');

client.once(Events.ClientReady, () => {
    console.log(`${client.user.username} is awake!`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.id === client.user.id) return; // Ignore self
    if (message.author.bot && config.ignoreBots) return; // Ignore bots

    if (config.guilds?.length > 0 && !config.guilds.includes(message.guild.id)) return;
    if (config.channels?.length > 0 && !config.channels.includes(message.channel.id)) return;
    if (config.users?.length > 0 && !config.users.includes(message.author.id)) return;

    const generatedMessage = await generateMessage('you are a kawaii anime girl', message.content);
    const generatedVoice = await generateVoice(generatedMessage.content);
    
    // TODO: message response options: message only, message + attachment, attachment only, voice message
    client.rest.post(Routes.channelMessages(message.channel.id), {
        body: {
            flags: MessageFlags.IsVoiceMessage,
            attachments: [
                {
                    id: 0,
                    duration_secs: (generatedVoice.buffer.length * 8) / (generatedVoice.bitrate * 1000),
                    waveform: ''
                }
            ]
        },
        files: [
            {
                name: `${config.voiceAttachmentName}.${generatedVoice.format}`,
                data: generatedVoice.buffer,
            }
        ]
    });
});

client.login(process.env.DISCORD_TOKEN);