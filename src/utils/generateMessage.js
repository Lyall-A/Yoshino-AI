const { config } = require('../globals');

function generateMessage(systemMessage, messages = [ ], responses = [ ]) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (process.env.OPENAI_API_KEY) headers['Authorization'] = `Bearer ${process.env.OPENAI_API_KEY}`;
    
    return fetch(`${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: config.openAi.model,
            reasoning_effort: 'none',
            messages: [
                {
                    role: config.openAi.systemRole || 'system', // Changed to 'developer' in newer OpenAI models
                    content: systemMessage
                },

                // Messages
                ...[
                    ...messages.map(message => ({
                        role: 'user',
                        content: message.prompt,
                        timestamp: message.timestamp
                    })),
                    ...responses.map(response => ({
                        role: 'assistant',
                        content: response.content,
                        timestamp: response.timestamp
                    }))
                ]
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(({ role, content }) => ({ role, content }))
            ]
        })
    })
    .then(res => res.json())
    .then(json => json.choices[0].message.content);
}

module.exports = generateMessage;