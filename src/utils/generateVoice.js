const config = require('../config.json');

function generateVoice(text) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (process.env.ELEVENLABS_API_KEY) headers['xi-api-key'] = process.env.ELEVENLABS_API_KEY;

    const format = config.elevenLabs.format || 'mp3';
    const sampleRate = config.elevenLabs.sampleRate || 44100;
    const bitrate = config.elevenLabs.bitrate || 128;

    return fetch(`${process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1'}/text-to-speech/${config.elevenLabs.voice}?output_format=${format}_${sampleRate}_${bitrate}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            text,
            model_id: config.elevenLabs.model,
            language_code: config.elevenLabs.language,
            voice_settings: {
                stability: config.elevenLabs.stability,
                use_speaker_boost: config.elevenLabs.speakerBoost,
                similarity_boost: config.elevenLabs.similarityBoost,
                style: config.elevenLabs.style,
                speed: config.elevenLabs.speed
            },
            apply_text_normalization: config.elevenLabs.normalizeText
        })
    })
    .then(async res => {
        const buffer = Buffer.from(await res.arrayBuffer());
        
        return {
            format,
            sampleRate,
            bitrate,
            contentType: res.headers.get('Content-Type'),
            buffer
        };
    });
}

module.exports = generateVoice;