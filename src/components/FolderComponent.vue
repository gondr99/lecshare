<template>
    <div>
        <div class="row">
            <div class="col-12">
                <h3>공유를 원하는 프로젝트 폴더를 선택하세요</h3>
                <div class="input-group my-4">
                    <input type="text" class="form-control" placeholder="파일을 선택하세요" v-model="dataFolder" readonly>
                    <div class="input-group-append">
                        <button class="btn btn-outline-primary" type="button" @click="showReadDialog">파일 선택</button>
                    </div>
                </div>
            </div>
        </div>    

        <div class="row text-right">
            <div class="col-12">
                <button class="btn btn-sm btn-outline-info" @click="startShare" :disabled="sharing == true">공유 시작</button>
                <button class="btn btn-sm btn-outline-danger" @click="stopShare" :disabled="sharing == false">공유 중지</button>
            </div>
        </div>
    </div>
</template>

<script>
    import {remote} from 'electron';
    export default {
        name: 'folderComponent',
        mounted(){
            
        },
        data () {
            return {
                dataFolder: '',
                sharing:false
            }
        },
        methods:{
            onChangeDir(e){
                //console.log(e.target.value);
            },
            showReadDialog(e){
                remote.dialog.showOpenDialog({ 
                    title:"공유할 폴더를 선택하세요",
                    properties: ["openDirectory"]
                }, (folderPaths) => {
                    if(folderPaths === undefined){
                        console.log("목적 폴더가 선택되지 않음.");
                        return;
                    }else{
                        this.dataFolder = folderPaths[0];
                    }
                });
            },
            startShare(e){
                //공유 시작
                if(this.dataFolder == ""){
                    this.$root.showToast("에러", "폴더를 선택하지 않았습니다");
                    return;
                }
                let response = this.$root.ipc.sendSync("checkexist",this.dataFolder);
                if(response.result){
                    this.$root.showToast("공유 시작", "공유 시작되었습니다.");
                    this.$root.setShare({share:true, folder:this.dataFolder});
                    this.sharing = true;
                }else {
                    this.$root.showToast("에러 발생", response.msg);
                }
            },
            stopShare(e){ //공유 중지
                this.dataFolder = '';
                this.sharing = false;
                this.$root.setShare({share:false, folder:''});
            }
        }
    }
</script>
    
<style>
</style>
