const db = require('../database/database');
const {ObjectId} = require('mongodb');

class Course {
    constructor(code, name){
        this.code = code;
        this.name = name;
    }

    async create() {
        try{
            await db.getDb().collection('courses').insertOne({
                code: this.code,
                name: this.name,
                grade: this.grade,
                alertedSelf: 0,
                alertedOther: 0,
                applicants: []
            });
        }catch(error){
            console.log(`could not insert this course : ${this.code}
            ${error.message}`);
        }
    }

    async fetchCourse(projection) {
        const course = await db.getDb().collection('courses').findOne({code: this.code}, {projection: projection});
        if (course)
            Object.assign(this, course);
    }

    async isExistingCourse() {
        const course = await db.getDb().collection('courses').findOne({code: this.code});
        return course ? true : false ;
    }

    async isExistingApplicant(userId) {
        const user = await db.getDb().collection('courses').findOne({code: this.code, 'applicants.userId': userId});
        return user ? true : false ;
    }

    async modify(field){
        await db.getDb().collection('courses').updateOne({code: this.code}, field);
    }

    async delete() {
        
    }
    
    async deleteApplicantFromOne(userId) {
        return await db.getDb().collection('courses').updateMany({code: this.code}, {$pull: {applicants: {userId: userId}}});
    }

    static async deleteApplicantFromAll(userId) {
        return await db.getDb().collection('courses').updateMany({}, {$pull: {applicants: {userId: userId}}});
    }

    static async findCoursesByApplicantId(userId) {
        const courses = await db.getDb().collection('courses').find({'applicants.userId': userId}, {projection: {_id: 0, code: 1, name: 1, alertedSelf: 1, alertedOther: 1, 'applicants.$': 1}}).toArray();
        if (courses) {
            for (const course of courses){
                course.type = course.applicants[0].type;
                course.alerted = (course.type === '1' ? course.alertedOther : course.alertedSelf);
                delete course.alertedSelf;
                delete course.alertedOther;
                delete course.applicants;
            }
        }
        return courses;
    }
}

module.exports = Course;