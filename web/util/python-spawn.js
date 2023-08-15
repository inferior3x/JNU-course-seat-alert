const {spawn} = require('child_process');
const path = require('path');

class PythonSpawn {
    constructor(pythonFileName){
        this.pythonFileName = pythonFileName;
    }

    spawnPython(){
        const pythonDir = path.join(__dirname, '..', '..', 'seat-checker', this.pythonFileName);
        this.pythonProcess = spawn('python', [pythonDir], {//stdio: 'pipe',  // 표준 입출력 스트림 설정
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
    
    async receiveData(){ //string
        return new Promise((resolve) =>{
                const waitForMyData = (data) => {
                    //if (data.includes(checkValue)){
                        this.pythonProcess.stdout.off('data', waitForMyData);
                        resolve(JSON.parse(data));
                    //}
                }
                this.pythonProcess.stdout.on('data', waitForMyData);
            }
        )
    }

}

module.exports = PythonSpawn;