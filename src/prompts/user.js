module.exports = ({ message, user, member }) => Object.entries({
    username: user.username,
    name: user.globalName,
    nickname: member.nickname,
    time: new Date(message.timestamp).toLocaleString('en-GB'),
    'join-date': new Date(member.joined).toLocaleDateString('en-GB'),
    message: message.content
})
    .filter(([key, value]) => value)
    .map(([key, value]) => `<${key}>${value}</${key}>`)
    .join('\n');