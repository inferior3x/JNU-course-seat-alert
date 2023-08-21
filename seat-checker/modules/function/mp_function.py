import multiprocessing as mp
import nest_asyncio
import asyncio
nest_asyncio.apply()

# 프로세스 개수만큼 부모와 자식의 파이프를 만들고 반환
def create_pipes(process_number):
    parent_pipes = []
    child_pipes = []
    for _ in range(process_number):
        parent_pipe, child_pipe = mp.Pipe()
        parent_pipes.append(parent_pipe)
        child_pipes.append(child_pipe)
    return (parent_pipes, child_pipes) #([], [])

#프로세스 생성하고 생성한 프로세스의 객체 반환
def create_process(func, args = (), i=-1):
    proc = mp.Process(target=func, args= args + (i,))
    proc.start()
    print(f"process{i} : started")
    return proc

#크롤러에게 브라우저 닫으라고 하고 프로세스 닫기
def close_process(proc, pipe, i=-1):
    data = ['close']
    pipe.send(data)
    proc.join(timeout=10)
    if proc.is_alive():
        proc.terminate()
    print(f"process{i} : closed")