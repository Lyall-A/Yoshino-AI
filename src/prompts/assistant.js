module.exports = content => {
    return {
        content,
        message: getValue('message'), // Message response
        responseType: getValue('response-type'), // Response type, message, voice message, etc.
        joinVoice: !!parseInt(getValue('join-voice')), // If the bot should join VC
        ignored: !!parseInt(getValue('ignored'), 10), // If ignored
        reasonIgnored: getValue('reason-ignored'), // Why ignored
    }

    function getValue(key) {
        return content.match(new RegExp(`<${key}>(.*)<\/${key}>`))?.[1];
    }
}
