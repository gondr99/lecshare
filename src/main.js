import Vue from 'vue'
import App from './App.vue'
import FolderComponent from './components/FolderComponent';
import UserComponent from './components/UserComponent';
import SimilariryComponent from './components/SimilarityComponent';

import {ipcRenderer} from 'electron';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.component('folder-component', FolderComponent);
Vue.component('user-component', UserComponent);
Vue.component('similar-component', SimilariryComponent);
Vue.component('app', App);

new Vue({
	el: '#app',
	mounted(){
		this.ipc.on("user-code", (e, arg) => {
			if(this.userCodeList[arg.id] == undefined){
				this.userCodeList[arg.id] = [arg.code];
			}else{
				this.userCodeList[arg.id].push(arg.code);
			}
		});
	},
	data:{
		toastMsg:'',
		toast:false,
		shareData:{share:false, folder:''},
		ipc:ipcRenderer,
		userCodeList:[]
	},
	methods:{
		showToast(msg){
			this.toastMsg = msg;
			this.toast = true;
			setTimeout(()=>{
				this.toast = false;
			}, 1000);
		},
		setShare(data){
			this.ipc.send('setshare', data);
		}
	}
})
