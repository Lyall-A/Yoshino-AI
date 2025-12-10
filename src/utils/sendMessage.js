const { MESSAGE_FLAGS, ROUTES } = require('./discord');

const { config, client } = require('../globals');

function sendMessage(channelId, message, voice, messageResponseFeatures) {
    const body = { };
    const files = [ ];
    
    if (messageResponseFeatures.text) {
        // If response should include message
        body.content = message.content;
    }
    
    if (voice && (messageResponseFeatures.attachment || messageResponseFeatures.voice)) {
        // If response should include voice
        files.push({
            name: `${config.voiceAttachmentName}.${voice.format}`,
            data: voice.buffer,
        });
        
        if (messageResponseFeatures.voice) {
            // If response is voice message
            body.flags = MESSAGE_FLAGS.IS_VOICE_MESSAGE;
            body.attachments = [
                {
                    id: 0,
                    duration_secs: (voice.buffer.length * 8) / (voice.bitrate * 1000),
                    waveform: ''
                }
            ]
        }
    }
    
    
    return client.rest.post(ROUTES.CREATE_MESSAGE(channelId), {
        body,
        files
    });
}

module.exports = sendMessage;