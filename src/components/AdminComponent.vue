<template>
<div>
    <div class="row mt-2">
        <div class="col-12">
            <h3>권한관리 도구</h3>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col-12">
            <h4>1. 허용 파일 관리</h4>
            <div class="row">
                <div class="col-12 ext-list my-3">
                    <div class="ext-div d-flex justify-content-between align-items-center" v-for="(ext, idx) in allowFile" :key="idx">
                        <span>{{ext}}</span>
                        <button class="gondr-btn btn-danger" @click="delExt(idx)"><i class="far fa-window-close"></i></button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-8 offset-4">
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" placeholder="추가할 확장자를 입력하세요" v-model="userExt">
                        <div class="input-group-append">
                            <button class="btn btn-outline-success" type="button" id="button-addon2" @click="addExt">추가하기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'app',
    mounted() {
        let allowList = localStorage.getItem("extList");
        if(allowList === null){
            allowList = ['js', 'html', 'java', 'css', 'vue', 'json', 'jsp']; //초기 읽기 가능리스트
            localStorage.setItem("extList", JSON.stringify(allowList));
        }else {
            allowList = JSON.parse(allowList);
        }

        this.allowFile = allowList;
        this.$root.ipc.send('set-extention', this.allowFile);
    },
    data() {
        return {
            allowFile:[],
            userExt:''
        }
    },
    methods:{
        addExt(){
            if(this.userExt.trim() == ''){
                this.$root.showToast("공백은 확장자가 될 수 없습니다.");
                return;
            }else{
                this.allowFile.push(this.userExt);
                this.userExt = '';
                this.$root.showToast("추가되었습니다.");
                this.save();
            }
        },
        delExt(idx){
            //console.log(idx);
            this.allowFile.splice(idx, 1);
            this.save();
            this.$root.showToast("삭제되었습니다.");
        },
        save(){
            localStorage.setItem("extList", JSON.stringify(this.allowFile));
            this.$root.ipc.send('set-extention', this.allowFile);
        }
    }
}
</script>

<style>
    .ext-list {
        display: grid;
        grid-gap: 20px;
        grid-template-columns: repeat(5, 1fr);
        grid-auto-rows: minmax(50px, auto);
        padding: 5px;
    }
    .ext-div {
        border:1px solid #ddd;
        border-radius: 4px;
        padding:8px 12px;
    }
    .gondr-btn {
        display:inline-block;
        font-weight: 400;
        text-align: center;
        user-select: none;
        border:1px solid transparent;
        padding: .25rem .45rem;
        font-size: 0.7rem;
        line-height: 1.5;
        border-radius: .25rem;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    }
</style>
