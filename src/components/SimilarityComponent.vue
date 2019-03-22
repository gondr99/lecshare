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

</div>
</template>

<script>
export default {
    name: 'app',
    mounted() {
    },
    data() {
        return {
            dataFolder:''
        }
    },
    methods: {
        showReadDialog(){

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

