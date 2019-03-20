<template>
<div>
    <div class="logo">
        <h2>Gondr Lecture App. Ver 0.5</h2>
		<button class="btn btn-sm btn-danger" @click="openDevTools">개발도구</button>
    </div>
    <div class="row">
        <div class="col-3">
            <ul class="nav flex-column nav-pills">
                <a class="nav-link" v-bind:class="{active:mode == 0}" @click="changeMenu(0)">공유폴더 설정</a>
                <a class="nav-link" v-bind:class="{active:mode == 1}" @click="changeMenu(1)">접속자 목록보기</a>
                <a class="nav-link" v-bind:class="{active:mode == 2}" @click="changeMenu(2)">유사도 분석기</a>
                <a class="nav-link" v-bind:class="{active:mode == 3}" @click="changeMenu(3)">권한 관리</a>
            </ul>
        </div>
        <div class="col-9">
            <folder-component v-show="mode == 0"></folder-component>
			<user-component v-show="mode == 1"></user-component>
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
            msg: 'Welcome to Your Vue.js App',
			mode:0,
        }
    },
    methods: {
        openDevTools() {
            this.$root.ipc.send("openDevTools");
		},
		changeMenu(mode){
			this.mode = mode;
		}
    }
}
</script>

<style>
.logo {
    position: fixed;
    left: 10px;
    bottom: 10px;
}

.logo>h2 {
    font-size: 14px;
}

.nav-link {
	cursor: pointer; 
}
</style>
