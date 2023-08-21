import nest_asyncio
import asyncio
import time
nest_asyncio.apply()

#부모에서는 쓰지 않을거라 선언만 해둠
def worker():
    pass

#parent process
if __name__ == "__main__":
    import sys
    from math import ceil
    from modules.database.mongodb import (fetch_course_to_search)
    from modules.function.mp_function import *
    from modules.config.mp_config import *
    from modules.function.util_function import (
        divide_range_by_number,
        divide_range_by_size)
    
    #프로세스 초기화
    alive_proc_num = 0 #실행 중인 프로세스 개수
    unused_count = [0] * PROCESS_NUMBER # 프로세스가 사용되지 않은 횟수
    parent_pipes, child_pipes = create_pipes(PROCESS_NUMBER)
    procs = [] #프로세스 리스트
    for i in range(PROCESS_NUMBER):
        proc = create_process(worker, (child_pipes[i],), i)
        procs.append(proc)

    #실행시간 측정
    exec_time = 0
    exec_num = 0
    
    while True:
        
        print() #

        #과목 가져오기
        courses = fetch_course_to_search()
        courses_num = len(courses)
        print(f'신청 과목 : {courses}') #
        print(f'신청 과목 수 : {courses_num}') #

        #살아있는 프로세스 개수
        alive_proc_num = sum(1 for i in range(PROCESS_NUMBER) if procs[i].is_alive())
        print(f'살아있는 프로세스 개수 : {alive_proc_num}') #

        #자식들에게 각각 전달할 범위 설정
        if courses_num < PROCESS_NUMBER * PAGE_NUMBER: 
            courses_ranges = divide_range_by_size(courses_num, PAGE_NUMBER) #생일 빠른 프로세스에 검색할거 몰아넣기
        else: #실행 중인 프로세스 개수만큼 범위 설정
            courses_ranges = divide_range_by_number(courses_num, alive_proc_num)
        print(f'자식에게 전달할 범위 : {courses_ranges}') #
        
        #파이프 - 발신
        needed_proc_num = min(ceil(courses_num/PAGE_NUMBER), PROCESS_NUMBER) #필요한 프로세스 수
        print(f'필요한 프로세스 개수 : {needed_proc_num}') #
        for i, pipe in enumerate(parent_pipes):
            if needed_proc_num <= i: #필요 없는 프로세스일 경우
                if unused_count[i] == COUNT_TO_CLOSE_PROC: #일정 횟수 이상 사용되지 않았을 때
                    if alive_proc_num > i: #프로세스 살아있을 때
                        close_process(procs[i], pipe, i)
                else:
                    unused_count[i] += 1
                    print(f'{i} : unused_count increased : {unused_count[i]}') #
                continue #필요 없는 프로세스이므로
            else: #필요한 프로세스일 경우
                if alive_proc_num <= i: #실행 중이지 않을 때 - 실행 중이지 않을 때 기준으로 범위를 만들었는데, 여기서 확인해보니 실행 중이어도 범위의 개수는 더 작아서 괜찮음.
                    if unused_count[i] == 0: #일정 횟수 이상 필요로 할 때
                        procs[i] = create_process(worker, (child_pipes[i],), i) #생성됨이 먼저 뜨고 페이지가 켜지는지 확인
                    else: 
                        unused_count[i] -= 1
                        print(f'{i} : unused_count decreased : {unused_count[i]}') #
                    continue #실행이 완료될 다음을 기약하며...
            
            #보낼 과목 준비
            start, end = courses_ranges[i]
            data = ['crawl', courses[start:end+1]]
            
            #보내기
            try:
                pipe.send(data)
                print(f'parent to child{i} : data sended') #
            except Exception as error:
                print(f'parent pipe - sending error : {error}') # 경우1 : 프로세스 퍼져서 파이프 닫혔을 때


        #파이프 - 수신
        for pid, pipe in enumerate(parent_pipes):
            if pipe.poll():
                data = pipe.recv()
                exec_num += 1
                exec_time += data['exec_time']
                print(f"{exec_time / exec_num:.4f} seconds\n") #

        time.sleep(50) #

#child process
else:
    from modules.config.mp_config import PAGE_NUMBER
    from modules.config.crawler_config import (
        URL, 
        COURSE_NAME_INPUT_ATT, 
        GRADE_DD_ATT,
        SEARCH_BTN_ATT,
        COURSE_TABLE_ATT)
    from modules.function.crawling_function import (
        create_browser,
        create_new_pages,
        close_browser,
        clickElementWithWait,
        typeToElementWithWait,
        set_dropdown_by_index,
        get_tabledata)
    from modules.function.util_function import (
        get_list_of_digit_in_string,
        delete_whitespace,
        divide_range_by_size,
        divide_range_by_number)
    import datetime ############################################



    #여석 체크
    async def check_seat(page, courses_to_find):
        available_courses = []
        for course_to_find in courses_to_find:
            # print(course_to_find)
            #드랍다운 선택
            await set_dropdown_by_index(page, GRADE_DD_ATT, course_to_find['grade'])
            
            #여석 가져올 교과목명 입력
            await typeToElementWithWait(page, COURSE_NAME_INPUT_ATT, course_to_find['name'])
            
            #조회 버튼 클릭
            await clickElementWithWait(page, SEARCH_BTN_ATT)
            
            #테이블 데이터 가져오기
            courses = await get_tabledata(page, COURSE_TABLE_ATT)
            if courses == -1:
                print('테이블 데이터 가져오기 실패')
                continue
            if len(courses) == 1:
                print('존재하지 않는 과목')
                continue
            #강의 중 내가 원하는 과목인지 확인하기 위해 반복
            for course in courses :
                #빈 행 넘김
                if not len(course) :
                    continue
                
                #선택한 행이 내가 원하는 과목인지 체크 후 진행
                if delete_whitespace(course[2]) == course_to_find['code'] : #course[2] : 과목코드-분반
                    print(f"과목 찾음 : {course_to_find['code']}")
                    #여석 수 가져오기
                    digits = get_list_of_digit_in_string(course[8]) # course[8] : 여석 수
                    
                    remainder = -1
                    #여석 수 체크
                    if digits[0]+digits[3] and digits[1]+digits[4]:
                        remainder = 2
                    elif not digits[0]+digits[3] and digits[1]+digits[4]:
                        remainder = 1
                    elif digits[0]+digits[3] and not digits[1]+digits[4]:
                        remainder = 0

                    #여석 수 확인 후 있으면 진행
                    if remainder != -1:
                        available_courses.append([course_to_find['code'], remainder])
                        #과목 코드와 여석 현황(0-자과 1-타과 2-둘다) 반환
        return available_courses


    #자식 프로세스의 원동력
    def worker(pipe, pid):
        browser = asyncio.run(create_browser(True))
        pages = asyncio.run(create_new_pages(browser, URL, PAGE_NUMBER))

        while True:
            if pipe.poll():
                data = pipe.recv()
                command = data[0]
                #print(f'{pid} : {data}')

                if command == 'crawl':
                    courses = data[1]
                    courses_num = len(courses)
                    print(f'자식{pid}: 부모에게 전달받은 과목의 개수 : {courses_num}')
                    
                    #각 페이지들에게 전달할 범위 설정
                    if courses_num < PAGE_NUMBER: 
                        courses_ranges = divide_range_by_size(courses_num, 1) #앞의 페이지부터 과목 1개씩 할당
                    else:
                        courses_ranges = divide_range_by_number(courses_num, PAGE_NUMBER) #페이지 개수만큼 범위 나누기
                    
                    print(f'자식{pid}: 나눠진 과목 범위 : {courses_ranges}')
                    
                    #구간을 이용해서 task를 설정 - for문
                    loop = asyncio.get_event_loop()
                    
                    print("Start:", datetime.datetime.now())
                    
                    for _ in range(5):
                        # start_time = time.time() #
                        tasks = [loop.create_task(check_seat(pages[i], courses[courses_ranges[i][0]:courses_ranges[i][1]+1])) for i in range(PAGE_NUMBER)]
                        available_courses= loop.run_until_complete(asyncio.gather(*tasks))
                        #print(available_courses)
                    
                    print("End:", datetime.datetime.now())
                    
                    
                    # try:
                    #     pipe.send(data)
                    #     print(f'child{pid} to parent pipe : data sended') #
                    # except Exception as error:
                    #     print(f'child pipe - sending error : {error}')
                    #print(f'exec_time: {time.time()} - {start_time}')
                elif command == 'close':
                    asyncio.run(close_browser(browser))
                    return
                
    # loop = asyncio.new_event_loop()
    # asyncio.set_event_loop(loop)
    # tasks = [loop.create_task(check_seat(1)) for i in range(5)]
    # print(tasks)