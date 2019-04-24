# lec-electron은?

> lec-electron (lecshare)는 일렉트론과 Vue.js, Express를 활용한 수업용 코드 공유기입니다. 

코드를 공유할 폴더를 선택하고 공유를 시작하면 교사의 PC에서 해당 폴더의 파일들을 열람 복사, 차이점 분석 등을 수행할 수 있습니다. 

## 이 프로젝트를 실행하기 위한 방법.

``` bash
# 의존 파일을 모두 설치합니다.
npm install

# 최초에는 js 파일들은 모두 빌드되어 있으므로 일렉트론만 빌드하면 됩니다. 
npm run x64build

# 만약 컴퓨터가 32비트라면 다음 명령어를 사용하세요.
npm run x32build
```

좀 더 자세한 설명을 원하시면 개발자 홈페이지 [gmsgondr](http://www.gmsgondr.net/product) 를 참조하면 됩니다.
