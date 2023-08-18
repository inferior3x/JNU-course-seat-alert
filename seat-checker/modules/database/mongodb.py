from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017/")
db = client["auto-course-seat-alert"]

collection = db["courses"]

def fetch_course_to_search():
    return list(collection.find({"applicants": {"$not": {"$size": 0}}}, {"_id":0, "code":1, "name":1, "grade":1}))