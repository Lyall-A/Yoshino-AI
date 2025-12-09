const config = require('../config.json');

function generateMessage(systemMessage, message, messageHistory = []) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (process.env.OPENAI_API_KEY) headers['Authorization'] = `Bearer ${process.env.OPENAI_API_KEY}`;

    return fetch(`${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: config.openAi.model,
            messages: [
                {
                    role: config.openAi.systemRole || 'system', // Changed to 'developer' in newer OpenAI models
                    content: systemMessage
                },
                ...messageHistory,
                {
                    role: 'user',
                    content: message
                }
            ]
        })
    })
    .then(res => res.json())
    .then(json => json.choices[0].message);
}

module.exports = generateMessage;