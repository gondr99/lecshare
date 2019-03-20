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
                    <span>{{user.name}}</span>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
export default {
    name: 'folderComponent',
    mounted(){
        setInterval( ()=>{
            let res = this.$root.ipc.sendSync("connected-list");
            if(res.result){
                //결과가 참일경우에만
                this.userList = res.userList.filter(x => x.name != "");
                
            }else {
                console.log(res.msg); //디버그 콘솔로 잘못되었을 경우 출력
            }
        }, 2000);
    },
    data () {
        return {
            userList:[]
        }
    },
    methods:{
    }
}
</script>

<style>
    .user-list-div {
        display: flex;
        flex-wrap:wrap;
        justify-content: flex-start;
    }
    
    /* 한줄에 5개씩 배치 */
    .user-div {
        width: 18%;
        height: 80px;
        border: 1px solid transparent;
        border-radius: 4px;
        box-shadow: 2px 2px 2px rgba(0,0,0,0.5);
    }
</style>

