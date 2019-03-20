import Vue from 'vue'
import App from './App.vue'
import FolderComponent from './components/FolderComponent';
import UserComponent from './components/UserComponent';

import {ipcRenderer} from 'electron';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.component('folder-component', FolderComponent);
Vue.component('user-component', UserComponent);
Vue.component('app', App);

new Vue({
	el: '#app',
	mounted(){
		this.ipc.on("msg", (e, arg) => {
			console.log(arg);
		});
	},
	data:{
		toastMsg:'',
		toast:false,
		shareData:{share:false, folder:''},
		ipc:ipcRenderer
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
			console.log(data);
			this.ipc.send('setshare', data);
		}
	}
})
