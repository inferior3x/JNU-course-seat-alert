const db = require('../database/database');
const {ObjectId} = require('mongodb');

//Session 인스턴스의 대부분 메서드는 id가 필요함
class Session {
    constructor(id, pushToken){
        this.id = id;
        this.pushToken = pushToken;
    }

    async fetchSession(projection) {
        const session = await db.getDb().collection('sessions').findOne({'session.user.id': this.id}, {projection: projection});
        if (session)
            Object.assign(this, session);
    }

    async deleteSessionsById() {
        await db.getDb().collection('sessions').deleteMany({'session.user.id': this.id});
    }

    async deleteSessionsByPushToken() {
        await db.getDb().collection('sessions').deleteMany({'session.user.pushToken': this.pushToken});
    }

}

module.exports = Session;