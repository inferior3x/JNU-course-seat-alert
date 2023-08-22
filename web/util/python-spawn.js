const {spawn} = require('child_process');
const path = require('path');
const os = require('os');
const platform = os.platform();

class PythonSpawn {
    constructor(pythonFileName){
        this.pythonFileName = pythonFileName;
    }

    spawnPython(){
        const pythonDir = path.join(__dirname, '..', '..', 'seat-checker', this.pythonFileName);
        const pythonCommand = (platform === 'win32' ? 'python' : 'python3') //윈도우면 python, 맥이면 python3
        this.pythonProcess = spawn(pythonCommand, [pythonDir], {
            env: {
              ...process.env,  // 현재 환경 변수 유지
              PYTHONIOENCODING: 'utf-8',  // 파이썬의 표준 입출력 인코딩을 통합
            },
          });
    }
    
    passData(data){ //object
        //pass message to python
        this.pythonProcess.stdin.write(JSON.stringify(data) + '\n');
    }
    
    async receiveData(){ //데이터가 들어올 때까지 기다렸다가 받는 이벤트 추가
        return new Promise((resolve) =>{
                const waitForMyData = (data) => {
                        this.pythonProcess.stdout.off('data', waitForMyData);
                        resolve(JSON.parse(data));
                }
                this.pythonProcess.stdout.on('data', waitForMyData);
            }
        )
    }

    addListener(callback){ //데이터를 받는 이벤트 추가
        this.pythonProcess.stdout.on('data', callback); 
    }

}

module.exports = PythonSpawn;