<template>
<div>
    <div class="row mb-1">
        <div class="col-12">
            <h2>접속자 목록보기</h2>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12 user-list-div">
            <div class="user-div" v-for="user in userList" :key="user.id">
                <div class="info-row">
                    <span>{{user.name}}</span>
                </div>
                <div class="button-row">
                    <button class="btn btn-sm btn-primary" @click="openMessage(user.id)">보내기</button>
                    <button class="btn btn-sm btn-success" @click="showSendCode(user.id)">
                        보기
                        <span class="badge badge-light">{{user.cnt}}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <transition name="fade">
        <div class="popup" v-if="showPopup">
            <div class="inner">
                <h4>보낼 메시지를 입력하고 전송 버튼을 누르세요</h4>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="보낼 메시지를 입력하세요" v-model="sendMsg" @keydown.enter="sendMessage">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" @click="sendMessage">전송</button>
                    </div>
                </div>
                <div class="row text-right">
                    <button class="btn btn-danger" @click="closeModal">닫기</button>
                </div>
            </div>
        </div>
    </transition>

    <transition name="fade">
        <div class="popup" v-if="showCodeListPopup">
            <div class="inner">
                <div class="row">
                    <div class="col-12">
                        <ul class="list-group">
                            <li class="list-group-item" v-for="code in codeList" :key="code.idx">
                                <div class="code-item">
                                    <label>{{code.code.substring(0, 10)}}...</label>
                                    <div class="btn-row">
                                        <button class="gondr-btn btn-info"  @click="readCode">읽기</button>
                                        <button class="gondr-btn btn-warning" @click="deleteCode(code.idx)">삭제</button>
                                    </div>
                                </div>
                                <div class="code-info" v-show="code.show">
                                    {{code.code}}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12 text-right">
                        <button class="btn btn-sm btn-primary" @click="showCodeListPopup = false">모두 삭제</button>
                        <button class="btn btn-sm btn-danger" @click="closeSendCode">닫기</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</div>
</template>

<script>
export default {
    name: 'folderComponent',
    mounted() {
        setInterval(() => {
            let res = this.$root.ipc.sendSync("connected-list");
            if (res.result) {
                //결과가 참일경우에만
                this.userList = res.userList.map( x => {
                    //id, name 
                    if(this.$root.userCodeList[x.id] != undefined ){
                        x.cnt = this.$root.userCodeList[x.id].length;
                    }else{
                        x.cnt = 0;
                    }
                    return x;
                });
            } else {
                console.log(res.msg); //디버그 콘솔로 잘못되었을 경우 출력
            }
        }, 2000);
    },
    data() {
        return {
            userList: [],
            showPopup: false,
            sendTarget:'',
            sendMsg:'',
            showCodeListPopup:false,
            codeList:[],
            codeOpenSocket:'',
        }
    },
    methods: {
        openMessage(socketId) {
            this.showPopup = true;
            this.sendTarget = socketId; //소켓아이디 넣어주고
        },
        sendMessage(){
            let res = this.$root.ipc.sendSync('send-msg', {target:this.sendTarget, msg:this.sendMsg});
            this.$root.showToast(res); //응답 출력하기.
            this.closeModal();
        },
        closeModal(){
            this.showPopup = false;
            this.sendTarget = '';
            this.sendMsg = '';
        },
        showSendCode(socketId){
            this.codeList = this.$root.userCodeList[socketId].map( (x, idx) => {
                return {code:x, idx:idx, show:false};
            });

            if(this.codeList == undefined) {
                this.$root.showToast("해당 유저가 전송한 코드가 없습니다.");
                return;
            }

            this.showCodeListPopup = true;
            this.codeOpenSocket = socketId;
        },
        closeSendCode(){
            this.showCodeListPopup = false;
            this.codeOpenSocket = '';
        },
        //유저가 전송한 코드를 읽기
        readCode(idx){
            let infoDiv = event.target.parentElement.parentElement.nextElementSibling;
            if(infoDiv.style.display === "block"){
                infoDiv.style.display = "none";
            }else {
                infoDiv.style.display = "block";
            }
        },
        //유저가 전송한 코드를 삭제하기
        deleteCode(){

        }
    }
}
</script>

<style>
.user-list-div {
    display: grid;
    grid-gap: 20px;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(100px, auto)
}

/* 한줄에 5개씩 배치 */
.user-div {
    border: 1px solid transparent;
    border-radius: 4px;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.user-div>.button-row {
    text-align: right;
}

.popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
}

.popup > .inner {
    width: 70%;
    min-height: 30%;
    background-color: #fff;
    border-radius: 10px;
    padding:20px;
    display:flex;
    flex-direction: column;
    justify-content: space-around;
}

.code-item {
    width:100%;
    display: flex;
}

.code-item > label {
    flex:3;
}

.code-item > .button-row {
    flex:1;
}

.code-info {
    width:100%;
    padding:4px 12px;
    display:none;
    background-color: #fff;
}

.gondr-btn {
    display:inline-block;
    font-weight: 400;
    text-align: center;
    user-select: none;
    border:1px solid transparent;
    padding: .25rem .55rem;
    font-size: 0.7rem;
    line-height: 1.5;
    border-radius: .25rem;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}


</style>
