<template>
    <div class="login-box">
        <div class="center-box">
            <h2 class="text-center">{{msg}}</h2>
            <div class="row my-5">
                <div class="col-12">
                    <div class="input-group">
                        <input type="text" placeholder="사용할 이름을 5자 이내로 입력하세요" class="form-control" v-model="name"> 
                        <div class="input-group-append">
                            <button class="btn btn-success" @click="loginProcess">입장</button>
                        </div>
                    </div>
                </div>
            </div>                    
        </div>
    </div>
</template>

<script>
export default {
    name: 'clientApp',
    mounted(){
        //this.loadingData("");
    },
    data(){
        return {
            msg:'Welcome to Gondr'
        }
    },
    methods:{
        loginProcess(){ //로그인처리 프로세스
            if(!this.$root.socket){
                alert("연결이 설정되지 않았습니다. 서버를 확인하세요.");
                return;
            }
            
            this.$root.socket.emit('login', {name:this.name});
        }
    }
}
</script>

<style>
    .login-box {
        position: fixed;
        width:100%;
        height: 100%;
        background-image:linear-gradient(rgba(88,201, 185, 0.5), rgba(81, 157, 158, 0.5));
        display: flex;
        justify-content: center;
        align-items: center;
        left:0;
        top:0;
    }
    .center-box {
        border-radius: 20px;
        padding:50px 20px;
        width:500px;
        height:280px;
        background:#9DC8C8;
        border:3px solid #ddd;
    }

    .center-box > h2 {
        color:#fff;
    }
</style>
