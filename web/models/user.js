const db = require('../database/database');
const {ObjectId} = require('mongodb');

//User 인스턴스의 메서드는 this.id가 있어야 사용 가능
class User {
    constructor(id, password) {
        this.id = id;
        this.password = password;
    }

    async create() {
        try{
            await db.getDb().collection('users').insertOne({
                id: this.id, 
                password: this.password, 
                isAdmin: false,
                applied_course_num: 0,
            });
        }catch(error){
            console.log(`could not insert this user's info : ${this.id}
            ${error.message}`);
        }
    }

    async deleteUserById() {
        await db.getDb().collection('users').deleteOne({id: this.id});
    }

    async modify(field) {
        await db.getDb().collection('users').updateOne({id: this.id}, field);
    }

    async fetchUserData(projection) {
        const user = await db.getDb().collection('users').findOne({id: this.id}, {projection: projection});
        if (user){
            Object.assign(this, user);
        }
    }

    async checkExistence() {
        const user = await db.getDb().collection('users').findOne({id: this.id});
        return (user ? true : false);
    }
}

module.exports = User;