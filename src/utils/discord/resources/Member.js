class Member {
    constructor(member, client) {
        this.nickname = member.nick;
        this.joined = new Date(member.joined_at).getTime();
        this.deafened = member.deaf;
        this.muted = member.mute;
    }
}

module.exports = Member;