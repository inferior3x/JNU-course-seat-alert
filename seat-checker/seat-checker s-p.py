import nest_asyncio
import asyncio
from pyppeteer import launch
import sys
from datetime import datetime
import time
import os



#설정값 불러오기
from modules.config_seat_checker import *

#함수 불러오기
from modules.function import (
    clickElementWithWait,
    typeToElementWithWait,
    set_dropdown_by_index,
    get_tabledata,
    get_list_of_digit_in_string,
    delete_whitespace
)

PAGE_NUMBER = 30

page = []
page_status = []



nest_asyncio.apply()
#브라우저 생성
async def create_browser():
    browser = await launch(headless=True, executablePath=CHROME_PATH)
    return browser

#새 페이지 생성
async def create_new_page(browser, number):
    global page, page_status
    for i in range(number):
        page.append(await browser.newPage())
        page_status.append(0)
        await page[-1].goto(URL)
        print(f'page{i}')
    

# 크롤러
async def checker(num):
    #입력한 강의들로 번갈아가며 작업 수행
    for COURSE_NAME, COURSE_PROP in COURSES_TO_FIND.items() :

        #드랍다운 선택
        await set_dropdown_by_index(page[num], GRADE_DD_ATT, COURSE_PROP[1])
        
        #여석 가져올 교과목명 입력
        await typeToElementWithWait(page[num], COURSE_NAME_INPUT_ATT, COURSE_NAME)

        #조회 버튼 클릭
        await clickElementWithWait(page[num], SEARCH_BTN_ATT)
        
        #테이블 데이터 가져오기
        courses = await get_tabledata(page[num], COURSE_TABLE_ATT)
        if courses == -1:
            print('테이블 데이터 가져오기 실패')
            continue
        
        #강의 중 내가 원하는 과목인지 확인하기 위해 반복
        for course in courses :
            #빈 행 넘김
            if not len(course) :
                continue

            #선택한 행이 내가 원하는 과목인지 체크 후 진행
            if delete_whitespace(course[2]) == COURSE_PROP[0] : #course[2] : 과목코드-분반
                
                #여석 수 가져오기
                digits = get_list_of_digit_in_string(course[8]) # course[8] : 여석 수
                if COURSE_PROP[2] == 1 :
                    remainder = digits[0]+digits[3] #자과 여석수
                else:
                    remainder = digits[1]+digits[4] #타과 여석수
                
                #여석 수 확인 후 있으면 진행
                if remainder != 0:
                    print(f'{course[2]} 여석 생김 {datetime.now().strftime("%H:%M:%S")}')

                    #서버한테 무슨 강의가 여석 발생했는지 넘기기
        print(f'크롤링 완료{num}')

async def main():
    tasks = [asyncio.create_task(checker(i)) for i in range(PAGE_NUMBER)]  # 여러 개의 비동기 작업 생성
    await asyncio.gather(*tasks)  # 병렬로 비동기 작업 실행 및 결과 모으기         

browser = asyncio.run(create_browser())
asyncio.run(create_new_page(browser, PAGE_NUMBER))

while True:
    start_time = time.time()

    asyncio.run(main())

    end_time = time.time()  # 코드 실행 종료 시간
    execution_time = end_time - start_time  # 실행 시간 계산 (초 단위)
    print(f"Execution time: {execution_time:.4f} seconds")