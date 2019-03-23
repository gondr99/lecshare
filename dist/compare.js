self.onmessage = (msg) =>{
    startCompare(msg.data);
}

function startCompare(list){
    let totalCnt = list.length * list.length - list.length; //수행횟수
    let currentCnt = 0;
    let similarList = [];
    for(let i = 0; i < list.length; i++){
        similarList[i] = [];
        for(let j = 0; j < list.length; j++){
            if(i == j ) continue;

            currentCnt++;
            let progress = Math.floor(currentCnt / totalCnt * 100);
            //진행율 전파
            self.postMessage({type:'progress', value:progress, ori:list[i].name, other:list[j].name});
            //win.webContents.send('progress', {ori:list[i], other:list[j], progress:progress});

            let similar = compareCode(list[i].content, list[j].content);
            if(similar > 70){
                similarList[i].push({file:list[j].name, similar:similar});
            }
        }
    }

    self.postMessage({type:'complete', list: similarList}); // 다시 원래 프로세스로 결과를 전송
}


//코드의 유사도 분석을 위한 함수
function compareCode(ori, other){
    let maxLen = ori.length + other.length; //최대길이 저장

    let route = []; //라우팅 경로 저장하는 배열
    let V = []; //비교되는 X값을 저장하는 배열
    V[1] = 0; //최초 0을 넣고 시작.
    let findRoute = false; //경로를 찾았는지 확인하기 위한 변수

    let x = 0, y = 0; //시작점은 (0,0) 부터 시작해서 비교
    //탐색거리 d를 지속적으로 증가시켜 나가면서 목표점에 도달할 때까지 진행
    //x축이 원본코드, y축이 변경코드 따라서 x로 이동하면 원본코드의 삭제
    //y로 이동하면 변경코드의 삽입이다.
    for(let d = 0; d <= maxLen; d++){
        if(findRoute) break;
        for(let k = -d; k<= d; k += 2){
            if(findRoute) break;
            let key; //이전에 있던 곳을 저장해두는 배열
            //y의 값은 x-k로 추론이 가능하기 때문에 v에 저장하지 않는다.
            if(k == -d || (k != d && V[k-1] < V[k+1]) ){
                //맨왼쪽이거나 왼쪽이 오른쪽보다 작을 때는 내려간다.(삽입)
                x = V[k+1]; //위쪽의 x값을 그대로 가져오고
                y = x - k;
                key = V[k+1] + ":" + (V[k+1] - k - 1);
            }else {
                //k가 d하고 동일하거나 왼쪽이 오른쪽보다 더 많이 증가했을 경우는 삭제한다
                x = V[k-1] + 1;
                y = x - k;
                key = V[k-1] + ":" + (V[k-1] - k + 1);
            }

            route[x + ":" + y] = key; //지나온 경로를 저장하고
            key = x + ":" + y; //키를 새로 배정한다.

            let inc = false;
            while(x < ori.length && y < other.length && ori[x] == other[y]){
                //끝에 도달하지 않았고 값이 같으면 x,y값을 지속 증가시킨다.
                x++; y++;
                inc = true;
            }
            //여기까지왔다면 한단계 내려간 새로운 경로의 값이 나왔다.
            if(inc)
                route[x + ":" + y] = key; //지나온 경로를 저장하고

            V[k] = x;

            if(x >= ori.length && y >= other.length){
                findRoute = true;
            }
        }
    }

    //여기까지 도달했다면 비교경로 설정 완료
    let reverseArr = [];
    let now = x + ":" + y;

    while(now != "0:0"){ //시작지점에 도달할때까지 역으로 백트래킹
        reverseArr.push(now);
        now = route[now];
    }
    reverseArr.push("0:0");
    let list = reverseArr.reverse();
    
    let preX = 0, preY = 0;
    let cnt = 0;
    for(let i = 0; i < list.length; i++){
        let pos = list[i].split(":");
        let x = pos[0] * 1;
        let y = pos[1] * 1; //x,y좌표 뽑고
        let dx = x - preX; //양 좌표의 격차를 구하고
        let dy = y - preY;
        
        if(dx != dy){ //삭제되거나 삽입되었다면 
            cnt += Math.abs(dx - dy); //격차를 더한다.
        }

        preX = x;
        preY = y;
    }
    let sim = Math.round(((ori.length - cnt) / ori.length) * 100) ;
    
    return sim; //유사도 반환
}