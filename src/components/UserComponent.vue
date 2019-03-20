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
                    <button class="btn btn-sm btn-primary" @click="sendMessage(user.id)">메시지</button>
                    <button class="btn btn-sm btn-danger">퇴장</button>
                </div>
            </div>
        </div>
    </div>

    <transition name="fade">
        <div class="popup" v-if="showPopup">
            <div class="inner">
                <h4>보낼 메시지를 입력하고 전송 버튼을 누르세요</h4>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="보낼 메시지를 입력하세요">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button">전송</button>
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
                this.userList = res.userList.filter(x => x.name != "");

            } else {
                console.log(res.msg); //디버그 콘솔로 잘못되었을 경우 출력
            }
        }, 2000);
    },
    data() {
        return {
            userList: [],
            showPopup: false,
        }
    },
    methods: {
        sendMessage(socketId) {
            this.showPopup = true;
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

.popup>.inner {
    width: 70%;
    height: 30%;
    background-color: #fff;
    border-radius: 10px;
    padding:20px;
}
</style>
