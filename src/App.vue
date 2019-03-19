<template>
  <div>
    <div class="logo">
      <h2>Gondr Lecture App. Ver 0.5</h2>
    </div>
    <div class="row">
      <div class="col-3">
        <ul class="nav flex-column nav-pills">
          <a class="nav-link active">공유폴더 설정</a>
          <a class="nav-link">접속자 목록보기</a>
          <a class="nav-link">파일 업로드</a>
          <a class="nav-link">권한 관리</a>
        </ul>
      </div>
      <div class="col-9">        
        <folder-component></folder-component>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  mounted(){
    document.addEventListener("keydown", (e)=>{
      if(e.keyCode == 40 && e.ctrlKey){
        this.openDevTools();
      }
    });
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods:{
    openDevTools(){
      let msg = this.$root.ipc.send("openDevTools", "이것이 메시지");
    }
  }
}
</script>

<style>
  .logo {
    position: fixed;
    left:10px;
    bottom:10px;
  }

  .logo > h2 {
    font-size:14px;
  }
</style>
