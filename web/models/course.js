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
            alertedSelf: false,
            alertedOther: false,
            applicants: []
        });
    }

    async find(projection) {
        const course = await db.getDb().collection('courses').findOne({code: this.code}, {projection: projection});
        if (course)
            Object.assign(this, course);
    }

    async isExistingApplicant(user_id) {
        const user = await db.getDb().collection('courses').findOne({code: this.code, 'applicants.user': new ObjectId(user_id)});
        return user ? true : false ;
    }

    async modify(field){
        await db.getDb().collection('courses').updateOne({code: this.code}, field);
    }

    async delete() {

    }
    
    async deleteApplicant(user_id) {
        return await db.getDb().collection('courses').updateOne({code: this.code}, {$pull: {applicants: {user: new ObjectId(user_id)}}});
    }

    static async findCoursesByApplicant(user_id) {
        const courses = await db.getDb().collection('courses').find({'applicants.user': new ObjectId(user_id)}, {projection: {_id: 0, code: 1, name: 1, alertedSelf: 1, alertedOther: 1, 'applicants.$': 1}}).toArray();
        if (courses) {
            for (const course of courses){
                course.type = course.applicants[0].type;
                course.alerted = (course.type === '1' ? course.alertedOther : course.alertedSelf); //1 타과 0 자과
                delete course.alertedSelf;
                delete course.alertedOther;
                delete course.applicants;
            }
        }
        return courses;
    }
}

module.exports = Course;