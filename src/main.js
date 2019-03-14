import Vue from 'vue'
import App from './App.vue'
import FolderComponent from './components/FolderComponent';

import {ipcRenderer} from 'electron';
import $ from 'jquery'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

Vue.component('folder-component', FolderComponent);
Vue.component('app', App);

new Vue({
  el: '#app',
  mounted(){
    this.ipc.on("msg", (e, arg) => {
      console.log(arg);
    });
  },
  data:{
    toast:{show:false, msg:'', title:''},
    shareData:{share:false, folder:''},
    ipc:ipcRenderer
  },
  methods:{
    showToast(header, msg){
      this.toast.show = true;
      this.toast.title = header;
      this.toast.msg = msg;

      setTimeout(()=>{
        this.toast.show = false;
      }, 3000);
    },
    setShare(data){
      console.log(data);
      this.ipc.send('setshare', data);
    }
  }
})
