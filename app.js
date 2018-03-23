//元素获取
var $ = element =>{
    if(element.substr(0,1) == '#'){
        return document.getElementById(element.substr(1));
    }else if(element.substr(0,1) == '.'){
        return document.getElementsByClassName(element.substr(1));
    }else{
        return document.getElementsByTagName(element);
    }
}
//操作dom
var opt = {
    hasClass : function(element,cls){
        return -1 < (' '+element.className+' ').indexOf(' '+cls+' ');
    },
    addClass : function(element,cls){
        if(!this.hasClass(element,cls)){
            return element.className += ' '+cls;
        }
    }
}
//
const obj = {
    root : $('#root'), //容器
    ctrl : true, //开关
    start : $('#start'),//开始游戏
    scores : 0, //得分
    scoreDom : $('#score').getElementsByTagName('span')[0],
    border : $('#border'),//准星
    audio : $('#Audio'),//枪声
    count : $('#count'),//倒计时s
    time : $('#times').getElementsByTagName('span')[0], 
    times : $('.times')[0],//游戏时间
    summary : $('#summary'),//游戏介绍
    countTime : 3,
    second : 20,
    gameOver : false, //游戏结束
    create : function(n){
        //创建指定数量的鸭子
        var n = Number(n);
        for(let i=0; i<n; i++){
            var createDuck = new CreateDuck();
            createDuck.animates();
        }
    }
}
//指定范围随机
function random(min,max){
    return Math.random()*(max-min) + min;
}
//随机创建
function createRandom(){
    if(Math.random() < 0.5){
        obj.create(2);
    }else{
        obj.create(1);
    }
}
//得分计算
function score(color){
    if(color == 'blue'){
        obj.scores += 200;
    }else if(color == 'red'){
        obj.scores += 100;
    }
    obj.scoreDom.innerText = obj.scores;
}
//游戏时间
function gameTime(){
    setTimeout(function(){
        //时间到，游戏结束
        if(obj.second <= 0){
            var _score = $('.score')[0];
            obj.gameOver = true;
            gameOverUi(_score,obj.times);
        }
        if(obj.second > 0){
            obj.second -= 1;
            setTimeout(arguments.callee,1000);
        }
        obj.time.innerText = obj.second;
    },1000);
}
//游戏结束界面
function gameOverUi(s,n){
    //再来一次按钮插入
    const agin = document.createElement('h4');
    agin.id = "agin";
    agin.className = "agin";
    const text = document.createTextNode('再来一次');
    agin.appendChild(text);
    document.body.appendChild(agin);
    //分数位置
    if(!opt.hasClass(s,'active')){
        opt.addClass(s,'active');
        opt.addClass(n,'active');
    }

}
//鸭子添加
function addDuck(ctrl){
    let ducks = $('.duck');
    for(let j=0; j<ducks.length; j++){
        if(opt.hasClass(ducks[j],'remove')){
            var child = obj.root.getElementsByClassName('remove')[0];
            obj.root.removeChild(child);
        }
    }
    //随机生成鸭子数量
    if(obj.root.children.length < 2){
        //创建间隔
        if(ctrl){
            createRandom();
        }else{
            setTimeout(createRandom,1000);
        }
    }
}
//碰撞检测
function impact(event,opt){
    if(obj.gameOver) return;
    var event = event || window.event;
    //准星数据
    var post = {
        x : event.clientX,
        y : event.clientY
    };
    //鸭子数据
    var arr = [];
    var ducks = $('.duck');
    //获取碰撞区域坐标
    for(let i=0; i<ducks.length; i++){
        arr.push([[ducks[i].offsetLeft,ducks[i].offsetTop],[ducks[i].offsetLeft+ducks[i].offsetWidth,ducks[i].offsetTop+ducks[i].offsetHeight]]);
    }
    //判断是否击中目标
    for(let k=0; k<arr.length; k++){
        if(post.x<arr[k][1][0]&&post.y<arr[k][1][1]&&post.x>arr[k][0][0]&&post.y>arr[k][0][1]){
                //爆炸效果
                ducks[k].style.backgroundPositionY = '-29px';
                //判断分值
                var color = ducks[k].dataset.color;
                //时间增加
                obj.second += 1;
                setTimeout(function(){
                    if(!opt.hasClass(ducks[k],'remove')){
                        opt.addClass(ducks[k],'remove');
                    }
                    if(opt.hasClass(ducks[k],'remove')){
                        addDuck(!obj.ctrl);
                    }
                    score(color);
                },300)
                // alert(ducks[k].className);  
        }
    }
}
//鸭子创建
function CreateDuck(){
    this.div = document.createElement('div');
    this.div.className = 'duck';
    if(Math.random() > 0.8){
        this.div.style.background = `url(blue.png) no-repeat 0 0`;
        this.div.setAttribute('data-color','blue');
    }else{
        this.div.style.background = `url(red.png) no-repeat 0 0`;
        this.div.setAttribute('data-color','red');
    }
    obj.root.appendChild(this.div);
    this._width = Math.floor(random(450,900));
    this.div.style.left = `${this._width}px`;
}
//鸭子飞行
CreateDuck.prototype = {
    //移动
    fly : function(obj,infeed,sportrait){
        obj.style.left = `${infeed}px`;
        obj.style.bottom = `${sportrait}px`;
    },
    infeed : function(){//横向移动
        return random(1,5);
    },
    sportrait : function(){//纵向移动
        return random(1,5);
    },
    //动画
    animates : function(){
        let left = this.div.offsetLeft;
        let bottom = 0;
        var infeed = this.infeed(),
            fly = this.fly,
            Div = this.div,
            sportrait = this.sportrait();
        let dire = true;
        //随机飞行方向
        if(Math.random() > 0.5){
            dire = !dire;
        }else{
            dire = dire;
        }
        var timer = setTimeout(function(){
            //为true游戏结束
            if(obj.gameOver) return;
            //移出屏幕清除动画
            if(left >= window.innerWidth + Div.offsetWidth || bottom >= window.innerHeight + Div.offsetHeight || left <= -Div.offsetWidth){
                // clearInterval(timer);
                //添加删除类名
                opt.addClass(Div,'remove');
                addDuck(obj.ctrl);
                return;
            }else{
                //方向控制
                if(dire){
                    left += infeed;
                }else{
                    left -= infeed;
                }
                bottom += sportrait;
                fly(Div,left,bottom);
                setTimeout(arguments.callee,1000/60);
            }
        },1000/60);
    }
}
//开始按钮绑定事件
function onStart(){
    if(!opt.hasClass(obj.summary,'active')){
        opt.addClass(obj.summary,'active');
    }
    obj.start.style.display = 'none';
    //倒计时功能
    obj.count.style.display = 'block';
    setTimeout(function(){
        if(obj.countTime < 2){
            obj.count.style.display = 'none';
            obj.create(1);
            gameTime();
            return;
        }
        obj.countTime -= 1;
        obj.count.innerText = obj.countTime;
        setTimeout(arguments.callee,1000);
    },1000)
}
//射击事件
document.addEventListener('click',function(event){
    var event = event || window.event,
        target = event.target;
    switch(target.id){
        case "start" :
            onStart();
            break;
        default :
            break;
    }
    impact(event,opt);
    let start = obj.start;
    if(event.clientX >= start.offsetLeft && event.clientX <= start.offsetLeft + start.offsetWidth && event.clientY >= start.offsetTop && event.clientY <= start.offsetTop + start.offsetHeight){
        start.click();
    }
    obj.audio.currentTime = 0;
    obj.audio.play();
    if(agin = $('#agin')){
        if(event.clientX >= agin.offsetLeft && event.clientX <= agin.offsetLeft + agin.offsetWidth && event.clientY >= agin.offsetTop && event.clientY <= agin.offsetTop + agin.offsetHeight){
            window.location.reload();
        }
    }
})
document.addEventListener('mousemove',function(event){
    var event = event || window.event;
    //准星数据
    var post = {
        x : event.clientX,
        y : event.clientY
    };
    if(!opt.hasClass(obj.border,'active')){
        opt.addClass(obj.border,'active');
    }
    obj.border.style.left = post.x - obj.border.offsetWidth/2 + 3 + 'px';
    obj.border.style.top = post.y - obj.border.offsetHeight/2 + 3 + 'px';
})