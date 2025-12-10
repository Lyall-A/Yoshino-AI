const createSystemPrompt = require('./system');
const createUserPrompt = require('./user');
const parseAssistantResponse = require('./assistant');

module.exports = {
    createSystemPrompt,
    createUserPrompt,
    parseAssistantResponse
};