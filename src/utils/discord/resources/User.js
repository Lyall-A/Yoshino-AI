class User {
    constructor(user, client) {
        this.id = user.id;
        this.username = user.username;
        this.globalName = user.global_name;
    }
}

module.exports = User;