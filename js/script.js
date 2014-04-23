/**
 * Created by boslaw on 21.04.14.
 */
window.onload = function(){

document.getElementById("start").onclick = function(){

    document.getElementById("settings").className = "hide";

    stepInterval = 3000;
    drawInterwal = 20;

    canv = document.getElementById("fLife");
    ctx = canv.getContext("2d");

    canvs = document.getElementById("stations");
    ctxs = canvs.getContext("2d");


    eatc = 0;
    workc = 0;
    sleepc = 0;
    reprc = 0;

    bots = new Array();

    armagedon = 80;//Count robots for armagedon(66.666...% must die);

    maxid=-1;
    countRoBots = 0;
    year = 0;

    worldW = canv.width;//Width of the world
    worldH = canv.height;//Height of the world
    bdiam = 10;//Diameter of the base and roBots
    eatMin = 40;//Minimum emount of the eat
    sleepMin = 40;//Minimum emount of the sleep score
    minReplAge = 18;//Minimal age to reproduction
    maxReplAge = 50;//Maximal age to reproduction

    startCount = parseInt(document.getElementById("startCount").value);//Start count of roBots
    reprMoney = parseInt(document.getElementById("replMoney").value);;//Money to reproduction
    maxAge = parseInt(document.getElementById("maxAge").value);//High limit in life time
    minAge = parseInt(document.getElementById("minAge").value);//Low limit in life time
    eatMinus = parseInt(document.getElementById("eatMinus").value);//minus eat scores in 1 step
    sleepMinus = parseInt(document.getElementById("sleepMinus").value);//minus sleep scores in 1 step
    eatPlus = parseInt(document.getElementById("eatPlus").value);//plu eat scores in 1 step at the charging station
    sleepPlus = parseInt(document.getElementById("sleepPlus").value);//plus sleep scores in 1 step at the sleeping station
    moneyPlus = parseInt(document.getElementById("moneyPlus").value);//plus money in 1 step at work

    repr = new Base("repr", bdiam, worldH-bdiam);
    sleep = new Base("sleep", bdiam, bdiam);
    eat = new Base("eat", worldW-bdiam, bdiam);
    work = new Base("work", worldW-bdiam, worldH-bdiam);

    var reprim = new Image();
    var sleepim = new Image();
    var eatim = new Image();
    var workim = new Image();
    reprim.src = "images/repr.png";
    sleepim.src = "images/sleep.png";
    eatim.src = "images/eat.png";
    workim.src = "images/work.png";
    reprim.onload = function() {
        ctxs.drawImage(reprim, repr.x-10, repr.y-30);
    }
    sleepim.onload = function() {
        ctxs.drawImage(sleepim, sleep.x-10, sleep.y-10);
    }
    eatim.onload = function() {
        ctxs.drawImage(eatim, eat.x-28, eat.y-12);
    }
    workim.onload = function() {
        ctxs.drawImage(workim, work.x-30, work.y-30);
    }

    for(i=0; i<startCount; i++) {
        bots.push(new roBot(maxid));

        maxid++;
        countRoBots++;
    }
    reprc=startCount;

    stepAll();

    var mainInt = setInterval(function(){

        stepAll();
        if(countRoBots<=0){
            clearInterval(mainInt);
        }
    }, stepInterval+1500);

    var displayInt = setInterval(function(){
        displayRoBots();
    }, drawInterwal);

}



}



function roBot(prid){

    var rb = {};


        rb.id = prid+1;
        rb.maxAge = myrand(minAge, maxAge);
        rb.color = "rgb("+myrand(180, 214)+", "+myrand(180, 214)+", "+myrand(180, 214)+")";
        rb.age = 0;
        rb.money = 0;
        rb.eat = myrand(40, 70);
        rb.sleep = myrand(40, 70);
        rb.pos = repr;
        rb.sex = myrand(0, 1);//0 - she, 1 - he
        rb.x  = rb.pos.x;
        rb.y = rb.pos.y;


    rb.canSex = function(){
        if(this.age > minReplAge && this.age < maxReplAge)
            if((this.sex == 1 && this.money>reprMoney) || (this.sex==0 && this.money>(reprMoney-0.2*reprMoney)))
            return true;
    return false;
    }

    rb.step = function(){
    this.age++;
    if(this.pos!="eat") this.eat-=eatMinus;
    if(this.pos!="sleep") this.sleep-=sleepMinus;
    return 1;
    }

    rb.getInfo = function(){
        var str = "";
        str+="id:"+this.id;
        if(this.eat<=eatMin) str+= "<span style=\"color:red;\"> eat:"+this.eat+"</span>";
        else str+=" eat:"+this.eat;
        if(this.sleep<=sleepMin) str+= "<span style=\"color:red;\"> sleep:"+this.sleep+"</span>";
        else str+=" sleep:"+this.sleep;
        if(this.money<=reprMoney) str+= "<span style=\"color:red;\"> money:"+this.money+"</span>";
        else str+=" money:"+this.money;
        if(this.age<minReplAge) str+= "<span style=\"color:orangered;\"> age:"+this.age+"</span>";
        else if(this.age>=minReplAge && this.age<=0.8*this.maxAge) str+= "<span style=\"color:green;\"> age:"+this.age+"</span>";
        else str+= "<span style=\"color:darkred;\"> age:"+this.age+"</span>";

        return str;
    }

    rb.die = function(){
    if(this.eat<=0 || this.sleep<=0 || this.age==this.maxAge) return true;
    return false;
    }

    rb.doSome = function(){
        if(this.eat<eatMin){
           if(this.pos.name == "repr"){this.re(1); return;}
           if(this.pos.name == "sleep"){this.se(1); return;}
           if(this.pos.name == "work"){this.ew(-1); return;}
           if(this.pos.name == "eat") {this.eat+=eatPlus; return;}
        }else if(this.sleep<sleepMin){
           if(this.pos.name == "repr"){this.rs(1); return;}
           if(this.pos.name == "eat"){this.se(-1); return;}
           if(this.pos.name == "work"){this.sw(-1); return;}
           if(this.pos.name == "sleep"){this.sleep+=sleepPlus; return;}
        }else if(this.canSex()){
            if(this.pos.name == "sleep"){this.rs(-1); return;}
            if(this.pos.name == "eat"){this.re(-1); return;}
            if(this.pos.name == "work"){this.wr(1); return;}
            if(this.pos.name == "repr"){
                this.money-=reprMoney-0.2*reprMoney;
                bots.push(new roBot(maxid));
                reprc++;
                maxid++;
                countRoBots++;
                return;
            }
        }else{
            if(this.pos.name == "repr"){this.wr(-1); return;}
            if(this.pos.name == "eat"){this.ew(1); return;}
            if(this.pos.name == "sleep"){this.sw(1); return;}
            if(this.pos.name == "work"){this.money+=moneyPlus; return;}
        }
    }

    rb.rs = function(dir){//reproduction <-> sleep
        var dist = repr.y-sleep.y;
        var delta = drawInterwal*dist/stepInterval;
        if(dir==1) reprc--;
        if(dir==-1) sleepc--;
        var rsInt = setInterval(function(){
            rb.y-=delta*dir;
            if(rb.y<=sleep.y && dir==1){
                rb.pos = sleep;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                sleepc++;
                clearInterval(rsInt);
            }else if(dir==-1 && rb.y>=repr.y){
                rb.pos = repr;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                reprc++;
                clearInterval(rsInt);
            }
        },drawInterwal);
    }

    rb.se = function(dir){//reproduction <-> eat
        var dist = eat.x-sleep.x;
        var delta = drawInterwal*dist/stepInterval;
        if(dir==1) sleepc--;
        if(dir==-1) eatc--;
        var rsInt = setInterval(function(){
            rb.x+=delta*dir;
            if(rb.x>=eat.x && dir==1){
                rb.pos = eat;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                eatc++;
                clearInterval(rsInt);
            }else if(dir==-1 && rb.x<=sleep.x){
                rb.pos = sleep;
                rb.x = rb.pos.x;
                rb.y = rb.pos.y;
                sleepc++;
                clearInterval(rsInt);
            }
        },drawInterwal);
    }

    rb.ew = function(dir){//eat <-> work
        var dist = work.y-eat.y;
        var delta = drawInterwal*dist/stepInterval;
        if(dir==1) eatc--;
        if(dir==-1) workc--;
        var rsInt = setInterval(function(){
            rb.y+=delta*dir;
            if(rb.y>=work.y && dir==1){
                rb.pos = work;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                workc++;
                clearInterval(rsInt);
            }else if(dir==-1 && rb.y<=eat.y){
                rb.pos = eat;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                eatc++;
                clearInterval(rsInt);
            }
        },drawInterwal);
    }

    rb.wr = function(dir){//work <-> reproduction
        var dist = work.x-repr.x;
        var delta = drawInterwal*dist/stepInterval;
        if(dir==1) workc--;
        if(dir==-1) reprc--;
        var rsInt = setInterval(function(){
            rb.x-=delta*dir;
            if(rb.x<=repr.x && dir==1){
                rb.pos = repr;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                reprc++;
                clearInterval(rsInt);
            }else if(dir==-1 && rb.x>=work.y){
                rb.pos = work;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                workc++;
                clearInterval(rsInt);
            }
        },drawInterwal);
    }

    rb.re = function(dir){//reproduction <-> eat
        var dist = eat.x-repr.x;
        var delta = drawInterwal*dist/stepInterval;
        if(dir==1) reprc--;
        if(dir==-1) eatc--;
        var rsInt = setInterval(function(){
            rb.x+=delta*dir;
            rb.y-=dir*delta;
            if(rb.x>=eat.x && dir==1){
                rb.pos = eat;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                eatc++;
                clearInterval(rsInt);
            }else if(dir==-1 && rb.x<=repr.y){
                rb.pos = repr;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                reprc++;
                clearInterval(rsInt);
            }
        },drawInterwal);
    }

    rb.sw = function(dir){//sleep <-> work
        var dist = eat.x-sleep.x;
        var delta = drawInterwal*dist/stepInterval;
        if(dir==1) sleepc--;
        if(dir==-1) workc--;
        var rsInt = setInterval(function(){
            rb.x+=delta*dir;
            rb.y+=dir*delta;
            if(rb.x>=work.x && dir==1){
                rb.pos = work;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                workc++;
                clearInterval(rsInt);
            }else if(dir==-1 && rb.x<=sleep.x){
                rb.pos = sleep;
                rb.y = rb.pos.y;
                rb.x = rb.pos.x;
                sleepc++;
                clearInterval(rsInt);
            }
        },drawInterwal);
    }

    return rb;

}


function Base(name, x, y){
    var bs = {};

    bs.name = name;
    bs.x = x;
    bs.y = y;

    return bs;
}

function myrand(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }

function loger(text){
    var obj = document.getElementById("log");
    obj.innerHTML = text+ "<br />" + obj.innerHTML;//Додаємо в початок
}

function clearLog(){
    var obj = document.getElementById("log");
    obj.innerHTML = '';
}

function displayRoBots(){
    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, worldW, worldH);
    ctx.closePath();
    ctx.fill();
    for(i=0; i<bots.length; i++){
        if(bots[i]){
            ctx.beginPath();
            ctx.fillStyle = bots[i].color;
            ctx.arc(bots[i].x, bots[i].y, bdiam, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();
        }
    }


    ctx.fillStyle = "white";
    ctx.font = "15px Arial";

    ctx.beginPath();
    ctx.textAlign = "end";
    ctx.textBaseline = "top";
    ctx.lineWidth = 1;
    ctx.fillText(eatc, eat.x-30, 3);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.textAlign = "end";
    ctx.textBaseline = "bottom";
    ctx.lineWidth = 1;
    ctx.fillText(workc, work.x-30, work.y+bdiam);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.textAlign = "start";
    ctx.textBaseline = "bottom";
    ctx.lineWidth = 1;
    ctx.fillText(reprc, repr.x+30, repr.y+bdiam);
    ctx.fill();
    ctx.closePath();


    ctx.beginPath();
    ctx.textAlign = "start";
    ctx.textBaseline = "top";
    ctx.lineWidth = 1;
    ctx.fillText(sleepc, sleep.x+30, 3);
    ctx.fill();
    ctx.closePath();



}


function stepAll(){
    clearLog();
    if(bots.length>armagedon){
        for(i=0; i<bots.length; i++) {
            if(bots[i] && myrand(1, 15)!=7) {
                    if(bots[i].pos.name =="repr") reprc--;
                    if(bots[i].pos.name =="sleep") sleepc--;
                    if(bots[i].pos.name =="eat") eatc--;
                    if(bots[i].pos.name =="work") workc--;
                    bots.splice(i,1);
                    i--;
                    countRoBots--;
                    continue;
                }
            }

        loger("-------------<br/>ARMAGEDON<br/>------------");
        }



    for(i=0; i<bots.length; i++) {
        if(bots[i]) {

            bots[i].step();
            if(bots[i].die()){
                bots.splice(i,1);
                i--;
                countRoBots--;
                continue;
            }

            bots[i].doSome();
            loger(bots[i].getInfo());
        }
    }
    year++;

    loger("Year:"+year+"; count of roBots: "+countRoBots);
}
