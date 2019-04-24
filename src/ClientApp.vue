<template>
    <div class="row p-2">
        <div class="col-md-3 col-xs-12">
            <h3 class="mb-2">파일탐색</h3>
            <div class="row my-2">
                <div class="col-12">
                    <button class="gondr-btn btn-info btn-sm btn-tooltip" @click="reloadData">
                        <i class="fas fa-sync-alt"></i>
                        <span class="tooltip-text">현재 디렉토리 코드목록 새로고침</span>
                    </button>
                    <button class="gondr-btn btn-sm btn-primary btn-tooltip" @click="openSendModal">
                        <i class="fas fa-share-square"></i>
                        <span class="tooltip-text">자신의 코드를 교사에게 전송</span>
                    </button>
                </div>
            </div>
            <ul class="file-list dir">
                <li @dblclick.prevent="loadingBefore()" v-if="current != ''">
                    <i class="far fa-folder-open"></i>
                    이전
                </li>
                <li v-for="item in folderList" :key="item.name" @dblclick.prevent="loadingData(current + '/' + item.name)">
                    <i class="far fa-folder-open"></i>
                    {{ item.name}}
                </li>
            </ul>
            <ul class="file-list">
                <li v-for="item in fileList" :key="item.name" @click="showFile(current + '/' + item.name)">
                    <i class="far fa-file"></i>
                    {{ item.name}}
                </li>
            </ul>
        </div>
        
        <div class="col-md-9 col-xs-12">
            <transition name="fade">
                <div class="row mb-2" v-if="compareResult != ''">
                    <div class="col-12">
                        <h3>비교 결과</h3>
                        <div class="row my-2">
                            <div class="col-12">
                                <button type="button" class="btn btn-danger btn-sm mr-2" @click="compareResult = ''">닫기</button>
                            </div>
                        </div>
                        <div class="row mb-4">
                            <div class="col-12 compare-result">
                                <pre v-html="compareResult">
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>

            <h3 class="mb-2">코드보기</h3>
            <div class="row mb-2" v-if="codeData != ''">
                <div class="col-12">
                    <button type="button" class="btn btn-outline-primary btn-sm mr-2" @click="copyCode" :disabled="!allowCopy">코드 카피</button>
                    <button type="button" class="btn btn-outline-info btn-sm" @click="showCompareWindow">내코드와 비교</button>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div id="codeview" v-bind:style="{userSelect: allowCopy ? '' : 'none'}">
                        <pre><code></code></pre>
                    </div>
                </div>
            </div>
        </div>

        <div class="userinfo">
            <label>{{name}}</label>
            <button @click="logout">로그아웃</button>
        </div>
        <transition name="fade">
            <div class="popup" v-show="codePopup">
                <div class="inner">
                    <h3>비교하고자 하는 코드를 넣어주세요.</h3>
                    <div class="row">
                        <div class="col-12">
                            <textarea v-model="userCode"></textarea>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 text-right">
                            <button class="btn btn-outline-primary btn-sm" @click="codeCompareWithOption(0)" >비교</button>
                            <button class="btn btn-outline-danger btn-sm" @click="codePopup = false">취소</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="fade">
            <div class="popup" v-show="sendCodePopup">
                <div class="inner">
                    <h3>선생님에게 전송할 코드를 입력하세요</h3>
                    <div class="row">
                        <div class="col-12">
                            <textarea v-model="userCode"></textarea>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 text-right">
                            <button class="btn btn-outline-primary btn-sm" @click="sendCodeToTeacher" >전송하기</button>
                            <button class="btn btn-outline-danger btn-sm" @click="sendCodePopup = false">취소</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import domtoimage from 'dom-to-image';

export default {
    name: 'clientApp',
    mounted(){
        document.addEventListener("keydown", (e)=>{
            if(e.ctrlKey && e.key == "c") {
                this.$root.showToastMsg("복사키는 사용할 수 없습니다.");
                e.preventDefault();
                return;
            }
        });
        if(this.$root.user == null){
            this.$http.get('/check-login')
            .then( res => {
                if(res.data.result){
                    this.$root.user = res.data.data; //사용자 정보 넣어주고
                    this.$root.socket.emit('re-login', {name:this.$root.user.name}); //소켓에도 기록
                    this.name = this.$root.user.name;
                    
                    this.loadingData("");
                }else {
                    this.$router.push('/'); //로그인되어 있지 않으면 로그인처리
                }
            });
        }else {
            this.name = this.$root.user.name;
            this.loadingData("");
        }
    },
    props:{
        acceptName:String
    },
    data () {
        return {
            name:'',
            current:'',
            folderList:[],
            fileList:[],
            codeData:'',
            userCode:'',
            codePopup:false,
            comparedList:[],
            comparedLineList:[],
            compareResult:'',
            allowCopy:true,
            fileExt:['js', 'html', 'css', 'java', 'cpp', 'php', 'py', 'cs', 'jsp'],
            sendCodePopup:false,
            sendTimer:false,
        }
    },
    methods:{
        openSendModal() {
            this.userCode = '';
            this.sendCodePopup = true;
        },
        sendCodeToTeacher(){
            if(this.sendTimer){
                this.$root.showToastMsg("코드는 한번 전송후 30초가 지나야 전송 가능합니다.");
                return;
            }
            this.$root.socket.emit('user-code', this.userCode);
            this.sendCodePopup = false;
            this.$root.showToastMsg('교사에게 코드가 전송되었습니다.');
            this.sendTimer = true;
            setTimeout(()=>{
                this.sendTimer = false;
            }, 30000);
        },
        logout() {
            this.name = '';
            this.$http.get('/logout')
            .then( res => {
                this.$root.showToastMsg('로그아웃되었습니다.');
                this.$router.push('/');
            });
        },
        copyCode(){
            if(this.allowCopy){
                let el = document.createElement("textarea");
                el.value = this.codeData;
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
                this.$root.showToastMsg("코드 복사가 완료되었습니다.");
            }else {
                this.$root.showToastMsg("코드 복사가 방지되었습니다.");
            }
        },
        showCompareWindow(){
            //코드 비교용 입력창을 띄워주는 기능
            this.userCode = ''; 
            this.codePopup = true;
        },
        codeCompareWithOption(option){
            //2개 코드를 비교하는 함수.
            let ori = this.codeData;  //원본코드
            let my = this.userCode;  //사용자 코드

            if(option == 1){
                ori = this.code.code.split(/\r?\n/); //줄단위로 잘라서 배열로 만듦
                my = this.userCode.split(/\r?\n/);
            }
            let maxLen = ori.length + my.length; //최대길이 저장

            let route = []; //라우팅 경로 저장하는 배열
            let V = []; //비교되는 X값을 저장하는 배열
            V[1] = 0; //최초 0을 넣고 시작.
            let findRoute = false; //경로를 찾았는지 확인하기 위한 변수

            let x = 0, y = 0; //시작점은 (0,0) 부터 시작해서 비교
            //탐색거리 d를 지속적으로 증가시켜 나가면서 목표점에 도달할 때까지 진행
            //x축이 원본코드, y축이 변경코드 따라서 x로 이동하면 원본코드의 삭제
            //y로 이동하면 변경코드의 삽입이다.
            for(let d = 0; d <= maxLen; d++){
                if(findRoute) break;
                for(let k = -d; k<= d; k += 2){
                    if(findRoute) break;
                    let key; //이전에 있던 곳을 저장해두는 배열
                    //y의 값은 x-k로 추론이 가능하기 때문에 v에 저장하지 않는다.
                    if(k == -d || (k != d && V[k-1] < V[k+1]) ){
                        //맨왼쪽이거나 왼쪽이 오른쪽보다 작을 때는 내려간다.(삽입)
                        x = V[k+1]; //위쪽의 x값을 그대로 가져오고
                        y = x - k;
                        key = V[k+1] + ":" + (V[k+1] - k - 1);
                    }else {
                        //k가 d하고 동일하거나 왼쪽이 오른쪽보다 더 많이 증가했을 경우는 삭제한다
                        x = V[k-1] + 1;
                        y = x - k;
                        key = V[k-1] + ":" + (V[k-1] - k + 1);
                    }

                    route[x + ":" + y] = key; //지나온 경로를 저장하고
                    key = x + ":" + y; //키를 새로 배정한다.

                    let inc = false;
                    while(x < ori.length && y < my.length && ori[x] == my[y]){
                        //끝에 도달하지 않았고 값이 같으면 x,y값을 지속 증가시킨다.
                        x++; y++;
                        inc = true;
                    }
                    //여기까지왔다면 한단계 내려간 새로운 경로의 값이 나왔다.
                    if(inc)
                        route[x + ":" + y] = key; //지나온 경로를 저장하고

                    V[k] = x;

                    if(x >= ori.length && y >= my.length){
                        findRoute = true;
                    }
                }
            }

            //여기까지 도달했다면 비교경로 설정 완료
            let reverseArr = [];
            let now = x + ":" + y;

            while(now != "0:0"){ //시작지점에 도달할때까지 역으로 백트래킹
                reverseArr.push(now);
                now = route[now];
            }
            reverseArr.push("0:0");

            if(option == 0){
                this.comparedList =  reverseArr.reverse();
                this.recordCompareCode(0);
            } else {
                this.comparedLineList = reverseArr.reverse();
                this.recordCompareCode(1);
            }
        },
        recordCompareCode:function(option){
            //비교완료된 리스트를 가지고
            let list = this.comparedList;
            if(option == 1){
                list = this.comparedLineList;
            }
            let oriCode = this.codeData;
            let myCode = this.userCode;

            if(option == 1){
                oriCode = this.code.code.split(/\r?\n/);
                myCode = this.userCode.split(/\r?\n/);
            }


            let preX = 0, preY = 0;
            let resultString = "";
            for(let i = 0; i < list.length; i++){
                let pos = list[i].split(":");
                let x = pos[0] * 1;
                let y = pos[1] * 1; //x,y좌표 뽑고
                let dx = x - preX; //양 좌표의 격차를 구하고
                let dy = y - preY;

                if(option == 0){
                    if(dx == dy) {
                        resultString += this.encodeHTML(oriCode.substr(preX, dx));
                    }else if(dx > dy){ //삭제
                        let changeCode = this.encodeHTML(oriCode.substr(preX, dx));
                        if(changeCode.length != 1 || (changeCode.charCodeAt(0) != 10 && changeCode.charCodeAt(0) != 13)){
                            resultString += `<span class="red">${changeCode}</span>`;
                        }else if( changeCode.charCodeAt(0) == 13) { //엔터키일 경우 span으로 둘러싸지 않고 처리
                            resultString += changeCode;
                        }
                    }else if(dx < dy){ //삽입
                        let changeCode = this.encodeHTML(myCode.substr(preY, dy));
                        if(changeCode.length != 1 || (changeCode.charCodeAt(0) != 10 && changeCode.charCodeAt(0) != 13)){
                            resultString += `<span class="yellow">${changeCode}</span>`;
                        }else if( changeCode.charCodeAt(0) == 13) {
                            resultString += changeCode;
                        }
                    }
                }else {
                    if(dx == dy) {
                        for(var j = preX; j < x; j++){
                            resultString += this.encodeHTML(oriCode[j]) + "\n";
                        }
                    }else if(dx > dy){ //삭제
                        resultString += "<span class='red'>";
                        for(var j = preX; j < x; j++){
                            resultString += this.encodeHTML(oriCode[j]) + "\n";
                        }
                        resultString += "</span>";
                    }else if(dx < dy){ //삽입
                        resultString += "<span class='yellow'>";
                        for(var j = preY; j < y; j++){
                            resultString += this.encodeHTML(myCode[j]) + "\n";
                        }
                        resultString += "</span>";
                    }
                }

                preX = x;
                preY = y;
            }
            this.compareResult = resultString;
            this.codePopup = false; //팝업창 닫기
        },
        encodeHTML:function(html){
            return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        },
        reloadData() {
            this.loadingData(this.current);
        },
        loadingBefore(){
            let slashIndex = this.current.lastIndexOf('/');
            console.log(this.current.substring(0, slashIndex));
            this.loadingData(this.current.substring(0, slashIndex));
        },
        loadingData(path){
            this.$http.get('/list', {params: {
               path: path
            }})
            .then( result => {
                if(!result.data.result) {
                    alert("현재 서버에서 데이터를 공유중이지 않습니다.");
                    return;
                }
                let list = result.data.data;
                //받아서 folder리스트와 파일리스트에 갱신
                this.folderList = list.filter(x => x.dir);
                this.fileList = list.filter(x => !x.dir );

                this.current = path;

                this.$root.showToastMsg("데이터 로딩 완료");
            });
        },
        showFile(target){
            this.$http.post('/file', {
                file: target
            }).then( res => {
                if(res.data.result){
                    let content = res.data.data.file; //넘어온 파일
                    this.codeData = content; //코드데이터에 저장해두고
                    let ext = target.substring(target.lastIndexOf(".") + 1);
                    let codeDom = document.querySelector("#codeview code");
                    codeDom.innerText = content;
                    if(this.fileExt.find( x => x == ext) != undefined) {
                        codeDom.classList.add(ext);
                    }
                    this.highlightingCode();

                    //여기서부터 복사 방지시의 코드
                    if(!res.data.data.allow) { //복사방지가 걸려있다면 이미지로 전환
                        this.allowCopy = false; //복사 기능 비활성화

                        domtoimage.toPng(codeDom).then((dataUrl) => {
                            codeDom.className = '';
                            let img = new Image();
                            img.src = dataUrl;
                            codeDom.innerHTML = "";
                            codeDom.appendChild(img);
                        }).catch( (err) => {
                            console.log('이미지 변환중 오류 발생', err);
                        });
                    }else{
                        this.allowCopy = true;
                    }

                }else if(res.data.type == "redirect"){
                    location.href = res.data.url;
                }else if(res.data.type == "error" && res.data.msg !== undefined ){
                    alert(res.data.msg);
                }else {
                    alert("오류 발생. F5 키를 눌러 새로고침하세요");
                }
            });
        },
        highlightingCode(){
            let block = document.querySelector("pre code");
            hljs.highlightBlock(block);
        }
    }
}
</script>

<style>
    .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    }
    .file-list {
        margin:0;
        padding:0;
        list-style: none;
    }

    .file-list > li {
        padding: 8px 12px;
        margin-bottom:2px;
        border:1px solid #ddd;
        border-radius: 4px;
        cursor:pointer;
        font-size:0.8rem;
        user-select: none;
    }

    .file-list.dir {
        margin-bottom: 20px;
    }
    .file-list.dir > li {
        background-image: linear-gradient(#f7d675, #fada78);
    }

    .file-list > li > i {
        margin-right: 5px;
    }

    .userinfo {
        min-width:200px;
        display: flex;
        padding:0;
        border-radius: 4px;
        position: fixed;
        top:5px;
        right:5px;
        min-height:40px;
    }
    .userinfo > label {
        display: flex;
        justify-content: center;
        align-items: center;
        margin:0;
        min-width: 100px;
        padding: 8px 12px;
        border-radius: 4px 0 0 4px;
        border:1px solid #ddd;
    }
    .userinfo > button {
        background-color:#dc3545;
        border:1px solid #b21f2d;
        color:#fff;
        font-size:0.8rem;
        border-radius: 0 4px 4px 0;
    }

    .popup {
        position:fixed;
        margin:0;
        padding:0;
        width:100%;
        height:100%;
        background-color: rgba(0,0,0, 0.9);
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .popup > .inner {
        width:600px;
        min-height:400px;
        background-color: #fff;
        border-radius: 8px;
        padding:15px;
    }

    .inner textarea {
        width:100%;
        height: 300px;
        overflow-y: scroll;
    }

    .red {
        background-color:rgba(255, 0, 0, 0.7);
    }

    .yellow {
        background-color: rgba(230, 255, 3, 0.7);
    }

    .compare-result {
        border:2px solid #555;
        border-radius: 15px;
        padding:10px;
        box-shadow: 4px 4px 2px #aaa;
    }

    .gondr-btn {
        display:inline-block;
        font-weight: 400;
        text-align: center;
        user-select: none;
        border:1px solid transparent;
        padding: .3rem .65rem;
        font-size: 0.7rem;
        line-height: 1.5;
        border-radius: .25rem;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    }

    .btn-tooltip {
        position: relative;
    }
    .btn-tooltip .tooltip-text{
        visibility: hidden;
        background-color: rgba(0,0,0,0.8);
        color:#fff;
        text-align: center;
        position:absolute;
        padding:8px 12px;
        z-index: 5;
        top:100%;
        left:50%;
        transition:all 0.5s;
        opacity: 0;
        border-radius: 0.5rem;
        min-width:200px;
        font-size:0.9em;
    }

    .btn-tooltip:focus {
        outline:none !important;
    }

    .btn-tooltip:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
    }
    
</style>
