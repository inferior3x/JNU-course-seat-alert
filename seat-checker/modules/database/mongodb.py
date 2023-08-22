from pymongo import MongoClient
from ..function.mp_function import push_and_flush_stdout

push_and_flush_stdout('log', 'py - trying to connect mongodb...')
client = MongoClient("mongodb://localhost:27017/")
db = client["auto-course-seat-alert"]
collection_names = db.list_collection_names() #서버 안켜지면 무한 대기
collection = db["courses"]

push_and_flush_stdout('log', 'py - db connected!')

def fetch_course_to_search():
    return list(collection.find({"applicants": {"$not": {"$size": 0}}}, {"_id":0, "code":1, "name":1, "grade":1}))