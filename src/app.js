import Vue from 'vue';

import LoginComponent from './LoginComponent.vue';
import ClientApp from './ClientApp.vue';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import axios from 'axios';
import Router from 'vue-router';

Vue.component('login-component', LoginComponent);
Vue.component('client-app', ClientApp);
Vue.prototype.$http = axios;

Vue.use(Router);

const router = new Router({
    routes:[
        {
            path:'/', 
            component: LoginComponent
        },
        {
            path:'/main',
            component: ClientApp
        }
    ]
})

new Vue({
    el: '#app',
    router,
    mounted(){
        this.socket = io(); //소켓 접속 실시

        this.socket.on('login-ok', (data)=>{
            this.$http.post('/login-process', {name:data.name})
            .then( res => {
                this.$router.push('/main');
            });
            
            this.user = {name:data.name};
        });

        this.socket.on('teacher-msg', (data)=>{
            alert(data); 
        });

    },
    data:{
        socket:null,
        mode:0,
        user:null,
        toastMsg:'',
        showToast:false
    },
    methods:{
        showToastMsg(msg){
            this.toastMsg = msg;
            this.showToast = true;
            setTimeout(()=>{
                this.showToast = false;
            }, 1000);
        }
    }
});
