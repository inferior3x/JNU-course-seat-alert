import nest_asyncio
import asyncio
from pyppeteer import launch
import sys
import time
import os
import multiprocessing as mp
#import psutil

from modules.mongodb import collection

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

PAGE_NUMBER = 7
PROCESS_NUMBER = 7
page = []
page_status = []
nest_asyncio.apply()





def print_current_process():
    proc = mp.current_process()
    print(f'name: {proc.name} / pid: {proc.pid}\n')
    print()

#브라우저 생성
async def create_browser():
    browser = await launch(headless=True, executablePath=CHROME_PATH)
    return browser

#새 페이지 생성
async def create_new_page(browser, number):
    global page, page_status
    for _ in range(number):
        page.append(await browser.newPage())
        page_status.append(0)
        await page[-1].goto(URL)
    
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
                    pass
                    #print(f'{course[2]} 여석 생김 {datetime.now().strftime("%H:%M:%S")}')

                    #서버한테 무슨 강의가 여석 발생했는지 넘기기
        #print(f'크롤링 완료{num}')


def worker(pipe, pid):
    print_current_process()

    browser = asyncio.run(create_browser())
    asyncio.run(create_new_page(browser, PAGE_NUMBER))

    print(f'done creating page {pid}')

    while True:
        if pipe.poll():
            # received_data = pipe.recv()
            # #print("Received:", received_data)
            while True:
                start_time = time.time() ###
            
                loop = asyncio.get_event_loop()
                tasks = [checker(i) for i in range(PAGE_NUMBER)]
                loop.run_until_complete(asyncio.gather(*tasks))

                pipe.send({'exec_time': time.time() - start_time}) ###
    


if __name__ == "__main__":
    print_current_process()
    
    procs = []
    pipes = []

    for i in range(PROCESS_NUMBER):
        parent_pipe, child_pipe = mp.Pipe()
        pipes.append(parent_pipe)

        proc = mp.Process(target=worker, args=(child_pipe, i))
        proc.start()
        procs.append(proc)
        print(f"process {i+1} started")

    exec_time = 0
    exec_num = 0

    while True:
        #####
        continue
    
        for pid, pipe in enumerate(pipes):
            data_to_send = f"Data for process {pid}"
            pipe.send(data_to_send)

        for pid, pipe in enumerate(pipes):
            if pipe.poll():  # 파이프에 데이터가 있는지 확인
                data = pipe.recv()  # 데이터 수신
                exec_num += 1
                exec_time += data['exec_time']
                print(f"{exec_time / exec_num:.4f} seconds\n")

    # while True:
    #     exec_time = 0
    #     exec_num = PROCESS_NUMBER
    #     for pid, pipe in enumerate(pipes):
    #         if pipe.poll():  # 파이프에 데이터가 있는지 확인
    #             data = pipe.recv()  # 데이터 수신
    #             exec_time = data['exec_time']
    #     exec_time /= exec_num

    #     print(f"{exec_time:.4f} seconds\n")
    #     print(exec_num)
    #     exec_num += PROCESS_NUMBER

    for proc in procs:
        proc.join()
    
    