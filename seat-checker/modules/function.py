import re

#function - 버튼 보일 때까지 스크롤
async def scroll_element_into_viewport(page, attribute):
    await page.waitForSelector(attribute, visible= True)
    await page.evaluate(f'''document.querySelector("{attribute}").scrollIntoView();''')
    await page.waitFor(1000)
    return

#async function - 요소가 나타날 때까지 기다림
async def waitElementByAttributes(page, attribute) :
    handle = await page.waitForSelector(attribute, visible= True)
    return handle

#async function - 버튼 요소 클릭
async def clickElementWithWait(page, attribute) :
    handle = await waitElementByAttributes(page, attribute)
    #await page.evaluate("window.alert = function(){}")
    await handle.click()

#async function - 인풋 요소에 값 넣기
async def typeToElementWithWait(page, attribute, value) :
    await waitElementByAttributes(page, attribute)
    #존재하던 value 초기화 - await handle.type(value)에서 교체
    syntax = f'''() => {{
        const inputElement = document.querySelector("{attribute}");
        inputElement.value = "{value}";
    }}'''
    await page.evaluate(syntax)

#async function - 드롭다운의 옵션을 인덱스로 선택
async def set_dropdown_by_index(page, attribute, index):
    await page.waitForSelector(attribute)
    await page.evaluate(f'''
        ( ) => {{
        const dropDown = document.querySelector("{attribute}");
        dropDown.selectedIndex = {index};
        }}
        ''')

#async function - 테이블의 데이터 가져오기
async def get_tabledata(page, attribute, totalnum = 1):
    try:
        await page.waitForNavigation()
        await page.waitForFunction(f'''document.querySelectorAll("{attribute} tr").length >= {str(totalnum)}''')
        return await page.evaluate(f'''
                            const table = document.querySelector("{attribute}");
                            const rows = table.querySelectorAll('tr');
                            const rowData = [];
                            for (const row of rows) {{
                                const cells = row.querySelectorAll('td');
                                const cellData = [];
                                for (const cell of cells) {{
                                    cellData.push(cell.innerText.trim());
                                }}
                                rowData.push(cellData);
                            }}
                            rowData
                        ''')
    except:
        return -1

#async function - 전체 강의 수 불러오기
async def get_total_course_number(page, attribute):
    await page.waitForSelector(attribute)
    try:
        return str(await page.evaluate('document.querySelector("'+attribute+'").textContent'))
    except:
        return -1
    
#async function - 요소 찾고 반환
async def find_element(page, attribute):
    return await page.querySelector(attribute)

#function - 문자열에서 숫자들 골라서 리스트에 넣기
def get_list_of_digit_in_string(string):
    numbers = re.findall(r'\d+', string) # r : 이스케이프를 특문으로 인식, \d : digit, + : 앞의 패턴이 여러 번 나타날 것을 고려, findall() : 찾은 모든 것을 리스트로 반환
    return list(map(int, numbers))

#function - 문자열에 들어간 공백, 개행, 탭 없애기
def delete_whitespace(string):
    return re.sub(r'\s+', '', string) # \s : whitespace, sub() : 찾은걸 두 번째 인자로 대체하고 반환