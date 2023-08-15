import nest_asyncio
import asyncio
from pyppeteer import launch
import subprocess
import os

#텔레그램 설정값 불러오기
from modules.config_personal import TELEGRAM_USER_ID, bot

#설정값 불러오기
from modules.config_seat_checker import *

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

#임시 임포트
from datetime import datetime

# main function
async def main():
    browser = await launch(headless=True, executablePath='C:\Program Files\Google\Chrome\Application\chrome.exe')
    
    page = await browser.newPage()
    await page.goto(URL)

    child_process_started = False
    #조회 반복
    while True:
        #입력한 강의들로 번갈아가며 작업 수행
        for COURSE_NAME, COURSE_PROP in COURSES_TO_FIND.items() :

            #드랍다운 선택
            await set_dropdown_by_index(page, GRADE_DD_ATT, COURSE_PROP[1])
            
            #여석 가져올 교과목명 입력
            await typeToElementWithWait(page, COURSE_NAME_INPUT_ATT, COURSE_NAME)

            #조회 버튼 클릭
            await clickElementWithWait(page, SEARCH_BTN_ATT)

            #전체 강의 수 가져옴
            totalnum = await get_total_course_number(page, COURSE_TOTAL_NUMBER_ATT)
            if totalnum == -1: # 가져오기 실패
                print("전체 강의 수 불러오기 실패")
                continue
            if totalnum == 0: # 조회 시 없는 강의
                print(f"{COURSE_NAME} : 존재하지 않는 강의")
                continue
            
            #테이블 데이터 가져오기
            courses = await get_tabledata(page, COURSE_TABLE_ATT, totalnum)
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
                        print(f'{COURSE_NAME} 여석 생김 {datetime.now().strftime("%H:%M:%S")}')

                        #수강 신청 창 띄우고 텔레그램으로 알림 보내기 / 나중에 서버만들고 서버한테 무슨 강의가 여석 발생했는지 넘기기

                        #수강 신청 창 띄우기
                        if not child_process_started:
                            script_path = os.path.dirname(__file__)+r'\registration.py'
                            arguments = [COURSE_NAME, COURSE_PROP[0]]
                            process = subprocess.Popen(['python', script_path] + arguments, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                            child_process_started = True

                        #알림
                        bot.sendMessage(TELEGRAM_USER_ID, f'{COURSE_NAME} 여석 생김')


if __name__ == '__main__':
    nest_asyncio.apply()
    asyncio.run(main())