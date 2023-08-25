const db = require('../database/database');
const {ObjectId} = require('mongodb');

class Session {
    constructor(id, pushToken){
        this.id = id;
        this.pushToken = pushToken;
    }

    async deleteSessionsById() {
        await db.getDb().collection('sessions').deleteMany({'session.user.id': this.id});
    }
    async deleteSessionsByPushToken() {
        await db.getDb().collection('sessions').deleteMany({'session.user.pushToken': this.pushToken});
    }

}

module.exports = Session;