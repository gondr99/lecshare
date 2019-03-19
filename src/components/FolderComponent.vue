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

        <div class="row mt-4" v-if="sharing == true">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">공유상황판</div>
                    <div class="card-body">
                        <div class="control-panel">
                            <label for="copyAllow">파일 복사 허용</label>
                            <label class="switch">
                                <input type="checkbox" v-model="allowCopy" @click="sendAllowData">
                                <span class="slider round"></span>
                            </label>
                        </div>

                        <div class="control-panel mt-2">
                            <label for="copyAllow">현재 접속인원</label>
                            <div class="number">
                                {{connectedNumber}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {remote} from 'electron';
import { setInterval, clearInterval, setTimeout } from 'timers';
    export default {
        name: 'folderComponent',
        mounted(){
            
        },
        data () {
            return {
                dataFolder: '',
                sharing:false,
                connectedNumber:0,
                allowCopy:true,
                refreshTimer:null,
            }
        },
        methods:{
            stopSync(){
                window.clearInterval(this.refreshTimer);
            },
            startSync(){
                this.refreshTimer = window.setInterval(() => {
                    console.log("Asd");
                    this.connectedNumber = this.$root.ipc.sendSync("connected-count");
                }, 2000);
            },
            sendAllowData(){
                //복사허용 기능
                let response = this.$root.ipc.sendSync("send-allow",!this.allowCopy);
                this.$root.showToast(response);
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
                    this.$root.showToast("폴더를 선택하지 않았습니다");
                    return;
                }
                let response = this.$root.ipc.sendSync("checkexist",this.dataFolder);
                if(response.result){
                    this.$root.showToast("공유 시작되었습니다.");
                    this.$root.setShare({share:true, folder:this.dataFolder});
                    this.sharing = true;
                    this.startSync(); //접속인원 파악
                }else {
                    this.$root.showToast(response.msg);
                }
            },
            stopShare(e){ //공유 중지
                this.dataFolder = '';
                this.sharing = false;
                this.$root.setShare({share:false, folder:''});
                console.log("공유중지");
                this.stopSync(); //접속인원 파악 중지
            }
        }
    }
</script>
    
<style>
    .switch {
        position: relative;
        display: inline-block;
        width:50px;
        height:28px;
    }

    .switch input {
        opacity: 0;
        width:0;
        height:0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 22px;
        width: 22px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
    }

    input:checked + .slider {
        background-color: #2196F3;
    }
    input:focus + .slider {
        box-shadow: 0 0 1px #2196F3;
    }

    input:checked + .slider:before {
        transform: translateX(22px);
    }

    .slider.round {
        border-radius: 34px;
    }

    .slider.round:before {
        border-radius: 50%;
    }

    .control-panel {
        display:flex;
        align-items: center;
        padding: 8px 12px;
        border:1px solid #ddd;
        border-radius: 4px;
        box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.25);
    }
    .control-panel label {
        margin:0;
    }
    .control-panel label:first-child {
        flex:4;
    }

    .control-panel .number {
        width:50px;
        height:28px;
        background-color: #2196F3;
        display: flex;
        justify-content: center;
        align-items: center;
        color:#fff;
        border-radius: 4px;
    }
</style>
