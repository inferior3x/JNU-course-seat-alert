from modules.database.mongodb import collection
import time

num = 5

start_time = time.time() ###
for i in range(num):
    collection.insert_one({"code": f"과목{i}", "name": f"과목{i}", "grade": "1", "alertOther": False, "alertSelf": False, "applicants": [{"user": "partyminhi"}]})
print(time.time() - start_time) ###


exit()

for i in range(num):
    applied_courses = list(collection.find({"applicants": {"$not": {"$size": 0}}}, {"_id":0, "code":1, "name":1, "grade":1}))
applied_courses_num = len(applied_courses)


def divide_range_by_size(length, range_size):
    result = []
    current = 0
    while current <= length - 1:
        result.append((current, min(current + range_size - 1, length)))
        current += range_size
    return result


def divide_range_by_number(length, range_number):
    result = []
    current = 0
    for i in range(range_number):
        end = current + (length // range_number) - 1 + (1 if (length % range_number) > i else 0)
        result.append((current, end))
        current = end + 1
    return result

length = 12
core_number = 7
page_number = 3

ranges = []
if length < core_number * page_number:
    print(1)
    ranges = divide_range_by_size(length, page_number)
else:
    print(2)
    ranges = divide_range_by_number(length, core_number)

for r in ranges:
    print(f"Range: {r[0]} - {r[1]}")


# print(applied_courses)
print(applied_courses_num)