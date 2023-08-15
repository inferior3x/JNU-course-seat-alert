import nest_asyncio
import asyncio
from pyppeteer import launch

import sys
import json



#설정값 불러오기
from modules.config_seat_checker import (URL, GRADE_DD_ATT, COURSE_NAME_INPUT_ATT, COURSE_TABLE_ATT, COURSE_TOTAL_NUMBER_ATT, SEARCH_BTN_ATT)

#함수 불러오기
from modules.function import (
    clickElementWithWait,
    typeToElementWithWait,
    set_dropdown_by_index,
    get_tabledata,
    get_total_course_number,
    get_list_of_digit_in_string,
    delete_whitespace
)


#브라우저 생성
async def create_browser():
    browser = await launch(headless=False, executablePath='C:\Program Files\Google\Chrome\Application\chrome.exe')
    return browser

#새 페이지 생성
async def create_new_page(browser):
    page = await browser.newPage()
    await page.goto(URL)
    return page

#메인
async def main(browser):
    page = []
    page_status = [] # 0 unoccupied / 1 occupied

    
    page.append(await create_new_page(browser))
    page_status.append(0)
    

    for json_data in sys.stdin:
        try:
            dict_data = json.loads(json_data)
            course_name = dict_data['name']
            course_code = dict_data['code']
            course_grade = dict_data['grade']
        except:
            print(json.dumps({'errorType': 1})) # 입력 실패
            sys.stdout.flush()
            continue

        try:
            found = 0
            #드랍다운 선택
            await set_dropdown_by_index(page[0], GRADE_DD_ATT, course_grade)
            #여석 가져올 교과목명 입력
            await typeToElementWithWait(page[0], COURSE_NAME_INPUT_ATT, course_name)#course_name
            #조회 버튼 클릭
            await clickElementWithWait(page[0], SEARCH_BTN_ATT)
            #전체 강의 수 가져옴
            # totalnum = await get_total_course_number(page[0], COURSE_TOTAL_NUMBER_ATT)
            # if totalnum == -1: # 가져오기 실패
            #     continue
            # if totalnum == 0: # 조회 시 없는 강의
            #     continue
            #테이블 데이터 가져오기
            courses = await get_tabledata(page[0], COURSE_TABLE_ATT)
            if len(courses) == 1:
                print(json.dumps({'errorType': 2}))
                sys.stdout.flush()
                continue
            if courses == -1:
                print(json.dumps({'errorType': 3}))
                sys.stdout.flush()
                continue
            #강의 중 내가 원하는 과목인지 확인하기 위해 반복
            for course in courses :
                #빈 행 넘김
                if not len(course) :
                    continue
                #선택한 행이 내가 원하는 과목인지 체크 후 진행
                if delete_whitespace(course[2]) == course_code : #course[2] : 과목코드-분반
                    found = 1
                    print(json.dumps({'errorType': 0, 'name': course[1]}))
                    sys.stdout.flush()
                    break
            if found == 0:
                print(json.dumps({'errorType': 2}))
                sys.stdout.flush()
        except:
            print(json.dumps({'errorType': 3})) 
            sys.stdout.flush()


nest_asyncio.apply()

browser = asyncio.run(create_browser())
asyncio.run(main(browser)) #



