<template>
<div>
    <div class="row">
        <div class="col-12">
            <h3>유사도 분석을 수행할 폴더를 선택하세요</h3>
            <p class="mt-2 help-text">유사도 분석은 해당 폴더에 있는 모든 소스코드를 검사하여 유사도가 70%를 넘는 코드들을 표시해줍니다.</p>
            <div class="input-group my-4">
                <input type="text" class="form-control" placeholder="폴더를 선택하세요" v-model="dataFolder" readonly>
                <div class="input-group-append">
                    <button class="btn btn-outline-primary" type="button" @click="showReadDialog">폴더 선택</button>
                </div>
            </div>
        </div>
    </div>

    <div class="row text-right" v-if="dataFolder != ''">
        <div class="col-9 align-item-center">
            <div class="progress">
                <div class="progress-bar" role="progressbar" v-bind:style="{width: progress + '%'}">{{progress}}%</div>
            </div>
        </div>
        <div class="col-3">
            <button class="btn btn-sm btn-outline-info" @click="startCompare">검사 시작</button>
        </div>
    </div>

    <div class="row" v-show="origin != ''">
        <div class="col-12">
            {{origin}} 과 {{other}} 를 비교중입니다..
        </div>
    </div>

    <div class="row" v-show="similarList.length != 0">
        <div class="col-12">
            <ul class="list-group">
                <li class="list-group-item" v-for="s in similarList" :key="s.idx">
                    <div class="similar-item d-flex justify-content-between align-items-center" @click="showSimilarList(s.idx)">
                        <span>{{s.name}}</span>
                        <div v-if="s.list.length != 0">
                            유사코드 수 : 
                            <span class="badge badge-primary badge-pill">{{ s.list.length }}</span>
                        </div>
                    </div>
                    <div class="similar-info" v-show="s.show">
                        <div class="row mt-3">
                            <div class="col-12">
                                <div class="list-group">
                                    <li class="list-group-item d-flex justify-content-between align-items-center" v-for="item in s.list" :key="item.file">
                                        {{item.file}}
                                        <span class="badge badge-primary badge-pill">{{item.similar}}%</span>
                                    </li>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>

</div>
</template>

<script>
import {remote} from 'electron';
import path from 'path';

export default {
    name: 'app',
    mounted() {
        
    },
    data() {
        return {
            dataFolder:'',
            fileList:[],
            similarList:[],
            progress:0,
            origin:'',
            other:'',
            worker:null,
            comparing:false
        }
    },
    methods: {
        showReadDialog(){
            remote.dialog.showOpenDialog({ 
                title:"과제가 담긴 폴더를 선택하세요.",
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
        startCompare(){
            if(this.comparing){
                this.$root.showToast("검사가 진행중입니다. 추가 검사를 할 수 없습니다.");
                return;
            }
            this.comparing = true;
            this.fileList = this.$root.ipc.sendSync("get-compare-list", {folder:this.dataFolder});
            this.worker = new Worker('./dist/compare.js');

            this.worker.postMessage(this.fileList);
            
            this.worker.addEventListener('message', (data)=>{
                console.log(data.data);
                if(data.data.type === 'progress'){
                    this.origin = data.data.ori;
                    this.other = data.data.other;
                    this.progress = data.data.value;
                }else if (data.data.type === 'complete') {
                    this.origin = '';
                    this.other = '';
                    this.progress = '100';
                    this.similarList = data.data.list;
                    this.$root.showToast("검사 완료");
                    this.comparing = false;
                }
            });
        },
        showSimilarList(idx){
            if(this.similarList[idx].list.length == 0){
                this.$root.showToast("유사한 코드가 없습니다.");
                return;
            }
            this.similarList[idx].show = !this.similarList[idx].show;
        }
    }
}
</script>

<style>
    .help-text {
        padding:1rem;
        border-radius: 6px;
        background-color: #fff;
        box-shadow: 0 2px 3px hsla(0,0%,4%,.1), 0 0 0 1px hsla(0,0%,4%,.1);
        color: #4a4a4a;
    }
</style>

