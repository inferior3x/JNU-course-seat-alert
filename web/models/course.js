const db = require('../database/database');
const {ObjectId} = require('mongodb');

class Course {
    constructor(code, name){
        this.code = code;
        this.name = name;
    }

    async create() {
        await db.getDb().collection('courses').insertOne({
            code: this.code,
            name: this.name,
            alertSelf: false,
            alertOther: false,
            applicant: []
        });
    }

    async find(projection) {
        const course = await db.getDb().collection('courses').findOne({code: this.code}, {projection: projection});
        if (course)
            Object.assign(this, course);
    }

    async isExistingApplicant(user_id) {
        const user = await db.getDb().collection('courses').findOne({code: this.code, 'applicant.user': new ObjectId(user_id)});
        return user ? true : false ;
    }

    async modify(field){
        await db.getDb().collection('courses').updateOne({code: this.code}, field);
    }

    async delete() {

    }

}

module.exports = Course;