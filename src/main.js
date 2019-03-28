import Vue from 'vue'
import App from './App.vue'
import FolderComponent from './components/FolderComponent';
import UserComponent from './components/UserComponent';
import SimilariryComponent from './components/SimilarityComponent';
import AdminComponent from './components/AdminComponent';

import {ipcRenderer, shell} from 'electron';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.component('folder-component', FolderComponent);
Vue.component('user-component', UserComponent);
Vue.component('similar-component', SimilariryComponent);
Vue.component('admin-component', AdminComponent);
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
	
		this.ipc.on('update-need', (e, arg) => {
			alert('서버에 신버전이 등록되었습니다. 업그레이드 해주세요.');
			shell.openExternal("http://www.gmsgondr.net/product");
		});

		this.ipc.send('mount-complete');

		this.ipc.on('send-version', (e, arg)=>{
			this.version = arg.version;
		});

		this.shell = shell;
	},
	data:{
		toastMsg:'',
		toast:false,
		shareData:{share:false, folder:''},
		ipc:ipcRenderer,
		userCodeList:[],
		version:'',
		shell:null
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
