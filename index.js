'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const express = require('express'); //익스프레스 서버를 위한 
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const request = require('request');

const qs = require('querystring');

const session = require('express-session');
const os = require('os');

const defaultProps = {
    width: 800,
    height: 600,
    resizable: false,
    webPreferences:{
        nodeIntegration: true,
        nativeWindowOpen: true,
		nodeIntegrationInWorker: true,
    }
};

const version = "1.0.1";
/***********************************************
 * 사용자 이름 5글자 이내로 사용하도록 함.        *
 * 소스코드에서 enter키가 제대로 보이도록 함.     *
 * 폴더 공유해제시나 새로 공유시 에러 수정함.     *
 ***********************************************/

let win; //메인 윈도우 창
let shareData = {share:false, folder:''}; //공유 데이터리스트
let defaultCopyPermission = true; //기본적으로 소스코드의 복사를 허용할 것인가.
let connectedCount = 0; //현재 접속중인 인원 체크

let allowFileExtenstion = [];
let io = null; //소켓IO를 저장하기 위한 변수
let server = null; //익스프레스 서버를 저장하기 위한 변수

let ifaces = os.networkInterfaces();
let serverIpAddress = '';

for(let key in ifaces ){
    for(let i = 0; i < ifaces[key].length; i++){
        if(ifaces[key][i].family == 'IPv4' && ifaces[key][i].address != '127.0.0.1') {
            serverIpAddress = ifaces[key][i].address;
        }
    }
}

//일렉트론 실행 메인함수
function createWindow(){
    win = new BrowserWindow(defaultProps);
    win.setMenu(null);
    win.loadFile("index.html");
    //디버깅용 개발툴 자동으로 띄워주는 코드
    //win.webContents.openDevTools();  
    win.on("closed", ()=>{
        win = null;
    });
}

/************************************************
*    ipc 함수 리스너 등록부분                     *
*************************************************/
ipcMain.on("openDevTools", (e ,arg) => {
    win.webContents.openDevTools();
});

//폴더가 실제 존재하는지 확인
ipcMain.on("checkexist", (e, arg) => {
    let isExist = fs.existsSync(arg);
    if(isExist){
        e.returnValue = {result:isExist, msg:"공유 시작"};
    }else{
        e.returnValue = {result:isExist, msg:"존재하지 않는 디렉토리입니다."};
    }
});

ipcMain.on("setshare", (e, arg) => {
    //console.log("공유 데이터 설정 요청됨");
    shareData = arg; //공유 데이터 넣어줌.
});

ipcMain.on("getlist", (e, arg)=>{
    fs.readdir(arg, (err, items) => {
        let list = items.map( x => {
            let filename = path.join(arg, x);
            
            let file = fs.statSync(filename);
            let fileData = {name:x, fullName: filename, dir:file.isDirectory(), allow:defaultCopyPermission};
            //데이터는 파일명, 풀경로, 디렉토리 여부로 나뉘어짐.             

            return fileData;
        });
        e.returnValue = list;
    });
});

ipcMain.on('mount-complete', (e, arg)=>{
    request('http://data.gondr.net/version.php?product=lecshare', {}, (err, res, body) => {
        let data = JSON.parse(body);
        console.log(data.version);
        if(data.version != undefined && data.version > version) {
            win.webContents.send('update-need', {version:data.version, publishedDate:data.publishedDate});
        }else{
            win.webContents.send('send-version', {version:version});
        }
    });
});

ipcMain.on("connected-count", (e, arg)=>{
    e.returnValue = connectedCount; 
});

ipcMain.on("connected-list", (e, arg)=>{
    if(io != null){
        let sockets = io.sockets.clients().sockets;
        
        let clients = [];
        for(let key in sockets) {
            clients.push({id:key, name: sockets[key].userName == undefined ? "" : sockets[key].userName });
        }
        
        e.returnValue =  {result:true, userList:clients};
    }else {
        e.returnValue = {result:false, msg:'소켓서버가 구동되지 않았습니다'};
    }
});

ipcMain.on("send-allow", (e, arg)=>{
    defaultCopyPermission = arg;
    //console.log(arg);
    if(arg){
        e.returnValue = "복사 가능하도록 설정되었습니다.";
    }else{
        e.returnValue = "복사방지 기능이 설정되었습니다.";
    }
});

ipcMain.on('send-msg', (e, arg) => {
    let target = io.sockets.connected[arg.target];
    if(target != undefined){
        target.emit('teacher-msg', arg.msg);
    }
    
    e.returnValue = "메시지를 전송했습니다.";
});

ipcMain.on('get-ip', (e, arg)=>{
    if(serverIpAddress != ''){
        e.returnValue = serverIpAddress;
    }else{
        e.returnValue = '알수없는 IP';
    }
});

ipcMain.on('get-compare-list', (e, arg)=>{
    let folder = arg.folder; // 읽어들일 폴더
    fs.readdir(folder, (err, items) => {
        let list = items.map( x => {
            let filename = path.join(folder, x);
            
            let file = fs.statSync(filename);
            let content = fs.readFileSync(filename, 'utf8');
            return {name:x, fullName: filename, dir:file.isDirectory(), content:content};
        }).filter(x => !x.dir);
        
        e.returnValue = list;
    });
});

ipcMain.on('read-extention', (e, arg) => {
    e.returnValue = allowFileExtenstion;
});

ipcMain.on('set-extention', (e, arg)=>{
    allowFileExtenstion = arg; //가능한 파일리스트 설정하기.
});

/************************************************
*    App ready to go!!                          *
* Express Setting here!!!                       *
*************************************************/

app.on("ready", ()=> {
    let expressApp = express();
    expressApp.set('port', 9090);
    expressApp.set('views', path.join(__dirname, 'views'));
    expressApp.set('view engine', 'ejs');

    expressApp.use(express.json()); //미들웨어로 바디파서 사용
    expressApp.use(express.urlencoded()); // to support URL-encoded bodies
    expressApp.use(express.static( path.join(__dirname, 'dist/public')));
    expressApp.use(session({resave:false, saveUninitialized:false, secret:'gondrsecret'})); //세션 사용을 위한 변수
    //익스프레스 라우팅 리스트
    //메인페이지 보기
    expressApp.get('/', (req, res) => {
        res.render(
            'clientmain', {msg:'Welcome to Express', shareData:shareData}
        );
    });

    //로그인 처리
    expressApp.post('/login-process', (req, res)=>{
        let name = req.body.name;
        req.session.user = {name : name}; //들어온 이름으로 유저 객체 만들어줌.

        sendData(res, name);
    });

    //로그인되어 있는지 확인하는 부분
    expressApp.get('/check-login', (req, res)=>{
        if(req.session.user != undefined) {
            sendData(res, req.session.user);
        }else{
            sendError(res, "로그인을 해야합니다.");
        }
    });

    //로그아웃 처리
    expressApp.get('/logout', (req, res)=>{
        delete req.session.user; // 유저 제거
        sendData(res, '로그아웃 완료');
    });

    //파일 목록 보기
    expressApp.get('/list', (req, res)=> {

        if(!shareData.share){
            sendError(res, "현재 서버에서 데이터를 공유하고 있지 않습니다");
            return;
        }

        let current = req.query.path;

        fs.readdir(path.join(shareData.folder, current), (err, items) => {
            if(items === undefined || items === null){
                sendError(res, "서버 공유데이터가 변경되었습니다. 페이지를 새로고침 하세요.");
                return;
            }
            let list = items.map( x => {
                let filename = path.join(shareData.folder, current, x);
                
                let file = fs.statSync(filename);
                //데이터는 파일명, 풀경로, 디렉토리 여부로 나뉘어짐. 
                return {name:x, fullName: filename, dir:file.isDirectory(), allow:defaultCopyPermission};
            });
            sendData(res, list);
        });
    });

    //파일 내용 읽어서 보내주기
    expressApp.post('/file', (req, res) => {
        let filename = req.body.file;

        filename = path.join(shareData.folder, filename);
        console.log(filename + "요청");

        if(!checkPossible(res, filename)){
            return;
        }

        let dotIndex = filename.lastIndexOf(".");
        let ext = filename.substring(dotIndex + 1, filename.length);
        
        for(let i = 0; i < allowFileExtenstion.length; i++){
            if(ext == allowFileExtenstion[i]) {
                fs.readFile(filename, 'utf8', (err, data)=>{
                    //파일 utf8방식으로 읽어서 전송
                    console.log(defaultCopyPermission) ;
                    sendData(res, {file:data, allow:defaultCopyPermission});
                });
                return;
            }
        }
        
        //여기까지 왔다면 파일 내용을 읽기하지 않고 다운로드하도록 보냄.
        sendRedirect(res, "/download?file="  + qs.escape(filename)); //공백을 보내면 다운로드 함.
        
    });

    expressApp.get('/download', (req, res) => {
        let filename = req.query.file;

        console.log(filename + "다운로드 중");
        if(!checkPossible(res, filename)){
            return;
        }

        res.download(filename);
    });

    function checkPossible(res, filename){
        if(!shareData.share){
            sendError(res, "현재 서버에서 데이터를 공유하고 있지 않습니다");
            return false;
        }

        if(!shareData.share){
            sendError(res, "현재 공유중이지 않습니다."); return false;
        }

        if(filename === undefined) {
            sendError(res, "올바른 파일을 선택하세요."); return false;
        }
        if(!fs.existsSync(filename)) {
            sendError(res, "존재하지 않는 파일입니다."); return false;
        }
        
        if(filename.substring(0, shareData.folder.length) !== shareData.folder){
            sendError(res, "권한이 없는 파일입니다."); return false;
        }

        return true;
    }

    //json 데이터를 보내주는 함수
    function sendData(res, data){
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ result: true, data:data }));
    }

    //에러를 json으로 보내주는 함수
    function sendError(res, msg){
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ result: false, type:'error', msg:msg }));
    }

    function sendRedirect(res, url){
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ result: false, type:'redirect', url:url }));
    }

    server = http.createServer(expressApp);
    io = socketIo(server); //io는 상단에 ipc메인에 선언되어 있음.

    //socket io 관련 프로토콜

    io.on("connection", (socket) => {
        connectedCount++;
        socket.on('login', (data)=>{
            socket.userName = data.name;
            socket.emit('login-ok', {name:data.name});
        });
        //재로그인하는경우 소켓에 이름만 기록
        socket.on('re-login', (data)=>{
            socket.userName = data.name;
        });

        //학생의 코드 전송시 이를 보내줌
        socket.on('user-code', (data) => {
            win.webContents.send('user-code', {id:socket.id, code:data});
        });

        socket.on('disconnect', (data)=>{
            console.log("user-disconnected");
            connectedCount--;
        });
    });

    //socket io 관련 프로토콜 종료
    
    server.listen(expressApp.get('port'), ()=> {
        console.log('Express 엔진이 port ' + expressApp.get('port') + '에서 실행중입니다');
    });

    createWindow();
});


app.on('window-all-closed', ()=>{
    console.log("앱 종료 시작");
    if(server != null ){
        server.close(() => {
            console.log("서버앱 종료 완료");
            app.quit();
        });
        //1초이내로 서버가 안닫히면 그대로 강종
        setTimeout( () => {
            app.quit();
        }, 1000);
    }else{
        app.quit();
    }
});