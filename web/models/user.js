const db = require('../database/database');
const {ObjectId} = require('mongodb');

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
            });
        }catch(error){
            console.log(`could not insert this user : ${this.id}
            ${error.message}`);
        }

    }

    async delete() {
        await db.getDb().collection('users').deleteOne({id: this.id});
    }

    async modify(field) {
        await db.getDb().collection('users').updateOne({id: this.id}, field);
    }

    async find(projection) {
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