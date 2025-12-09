const DiscordGateway = require('./DiscordGateway');

const { config } = require('../globals');

function sendMessage(channelId, message, voice) {
    const messageResponseType = [
        'message',
        'attachment',
        'both',
        'voice'
    ].includes(config.messageResponseType.toLowerCase()) ? config.messageResponseType.toLowerCase() : 'both';

    const messageResponseFeatures = {
        message: message && (messageResponseType === 'message' || messageResponseType === 'both' || !voice),
        attachment: voice && (messageResponseType === 'attachment' || messageResponseType === 'both'),
        voice: voice && (messageResponseType === 'voice')
    };

    const body = { };
    const files = [ ];
    
    if (messageResponseFeatures.message) {
        // If response should include message
        body.content = message.content;
    }
    
    if (messageResponseFeatures.attachment || messageResponseFeatures.voice) {
        // If response should include voice
        files.push({
            name: `${config.voiceAttachmentName}.${voice.format}`,
            data: voice.buffer,
        });
        
        if (messageResponseFeatures.voice) {
            // If response is voice message
            body.flags = DiscordGateway.MESSAGE_FLAGS.IS_VOICE_MESSAGE;
            body.attachments = [
                {
                    id: 0,
                    duration_secs: (voice.buffer.length * 8) / (voice.bitrate * 1000),
                    waveform: ''
                }
            ]
        }
    }
    
    const formData = new FormData();
    formData.set('payload_json', JSON.stringify(body));
    files.forEach((file, fileIndex) => formData.set(`files[${fileIndex}]`, new Blob([file.data]), file.name));

    return fetch(`${config.discord.apiBaseUrl}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `${!config.userToken ? 'Bot ' : ''}${process.env.DISCORD_TOKEN}`
        },
        body: formData
    });
}

module.exports = sendMessage;