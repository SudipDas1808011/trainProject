import {initializeApp} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {getAnalytics} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-analytics.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import {getDatabase,push,child, onValue, ref, set,update,get,query,orderByKey, limitToLast} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import { firebaseConfig } from '../module.js';


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const dbRef = ref(getDatabase());
const dateNow = new Date();
const dateNow_val = dateNow.getFullYear().toString()+(dateNow.getMonth()+1).toString().padStart(2,0)+dateNow.getDate().toString().padStart(2,0);
const stations = ['station1','station2','station3','station4','station5'];
//======let here
let dirName_serv,id_serv,up_down,date_id;

//======var here

function deletePrevious(){
    dirName_serv = 'ticketContainer';
    var dateNow = new Date();
    var dateNow_var = dateNow.getFullYear().toString()+(dateNow.getMonth()+1).toString().padStart(2,0)+(dateNow.getDate()-1).toString().padStart(2,0);
    id_serv = 'train1';
    up_down = 'up';
    set(ref(database,dirName_serv+'/'+dateNow_var+'/'+id_serv),{
    });
    set(ref(database,'mapSeatToStation/'+dateNow_var+'/'+id_serv+'/'+up_down),{
    })
    update(ref(database,'extraTickets/'+dateNow_var+'/'+id_serv+'/'+up_down),{
        'extraseats':[]
    })
}
function t_12hrSrv(){
    var d = new Date();
    var hours = d.getHours() % 12 || 12;
    var minutes = d.getMinutes().toString().padStart(2, '0');
    var ampm = d.getHours() >= 12 ? 'PM' : 'AM';

    return hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;
}
function todayDateIdServ(){
    let d = new Date();
    return d.getFullYear().toString()+(d.getMonth()+1).toString().padStart(2,0)+d.getDate().toString().padStart(2,0);
}
function isValid_serv(variable){
    if(variable !==null && variable!==undefined && variable!==''){
        return true;
    }else{
        return false;
    }
}
function leftStation(){
    onValue(ref(database,'trainInfo/train1/up/departTime'),(snapshot)=>{
        if(snapshot.exists()){
            localStorage.setItem('departTimesServ',snapshot.val());
        }
    });
    var departTimesServ = localStorage.getItem('departTimesServ');
    try{
        departTimesServ = departTimesServ.split(',');
    }catch (e){
        departTimesServ = '';
    }
     var nowTime12fmt = t_12hrSrv();
    var td = new Date();
    var ap = td.getHours()>12?'PM':'AM';
    //document.getElementById('time').innerText = (td.getHours()%12||12).toString().padStart(2,0)+":"+td.getMinutes().toString().padStart(2,0)+':'+td.getSeconds().toString().padStart(2,0)+" "+ap+'\n\n'+localStorage.getItem('departTimesServ');

     var stationLeft = 0;
    if(departTimesServ.includes(nowTime12fmt)){
         stationLeft = departTimesServ.indexOf(nowTime12fmt);
        var trainid = 'train1';
        var up_down = 'up';
        var path = 'trainInfo/'+trainid+'/'+up_down;
        var updates = {
            'currentPos':stationLeft
        }
        update(ref(database, path), updates);
        console.log(nowTime12fmt);
     }
}
function extraTicket(){

    //read booked seats from seat container
    dirName_serv = 'ticketContainer';
    id_serv = 'train1';
    up_down = 'up';

    // //============

    var starCountRef = ref(database, dirName_serv+'/' + dateNow_val +'/'+id_serv+'/'+up_down);
    onValue(starCountRef, (snapshot) => {
        if(snapshot.exists()) { //update any seat booked
            var x = snapshot.val().booked_seats;
            localStorage.setItem('booked', x);
        }else{
            console.log('user not found');
        }
        dirName_serv = 'trainInfo';
        let alctSeats_Serv;
        starCountRef = ref(database, dirName_serv+'/'+id_serv+'/'+up_down);
        onValue(starCountRef, (snapshot) => {//getting allocated seat info. onValue bcz the allocated seat will be changed with ML algorithm
            if(snapshot.exists()) {
                var x = snapshot.val();
                var departTimesServ = x.departTime;
                var curPosSrv = x.currentPos;
                curPosSrv = parseInt(curPosSrv);
                if(curPosSrv>=0){
                    document.getElementById('pos').innerText = "Left from: "+stations[curPosSrv];
                }
                departTimesServ = Object.values(departTimesServ);
                localStorage.setItem('departTimesServ',departTimesServ);
                let numberOfStations = 5;
                if(curPosSrv<(numberOfStations-1) && curPosSrv>=0){
                    document.getElementById('pos').style.display = 'block';
                    var alctSeatsId = x.seatInfo.lists;
                    alctSeats_Serv = alctSeatsId[curPosSrv].seats;
                    let tmprServ;
                    if(curPosSrv===0){
                        localStorage.setItem('tmpalctseats',alctSeats_Serv);
                    }else{
                        try{
                            tmprServ = localStorage.getItem('tmpalctseats').split(',');
                            tmprServ = tmprServ.concat(alctSeats_Serv);
                            localStorage.setItem('tmpalctseats',tmprServ);
                        }catch (e){
                            tmprServ = '';
                        }
                        alctSeats_Serv = tmprServ;
                    }

                    var booked_seatsServ = localStorage.getItem('booked');
                    try {
                        booked_seatsServ = booked_seatsServ.split(',');
                    }catch (e){
                        booked_seatsServ = '';
                    }
                    //removing booked seats from allocated seats
                    for(let elm in booked_seatsServ){
                        let index = alctSeats_Serv.indexOf(booked_seatsServ[elm]);
                        if (index > -1) {
                            alctSeats_Serv.splice(index, 1);
                        }
                    }
                    localStorage.setItem('extraseats',alctSeats_Serv);
                    document.getElementById('extraSeats').innerText = alctSeats_Serv;

                    //document.title = 'Updated'
                    dirName_serv = 'extraTickets';
                    id_serv = 'train1';
                    up_down_serv='up';
                    set(ref(database,dirName_serv+'/'+dateNow_val+'/'+id_serv+'/'+up_down_serv),{
                        'extraseats':alctSeats_Serv
                    });
                }else{
                    var extraseats = [];
                    dirName_serv = 'extraTickets';
                    id_serv = 'train1';
                    up_down_serv='up';
                    set(ref(database,dirName_serv+'/'+dateNow_val+'/'+id_serv+'/'+up_down_serv),{
                        'extraseats':extraseats
                    });
                    var updates = {
                        'currentPos':-1
                    }
                    var up_down_serv ='up';
                    update(ref(database,'trainInfo/'+id_serv+'/'+up_down_serv),updates);

                    localStorage.removeItem('tmpalctseats');
                    localStorage.removeItem('extraseats');
                    //document.getElementById('pos').style.display = 'none';
                    // if(curPosSrv==(numberOfStations-1)){
                    //     //document.getElementById('extraSeats').innerHTML = "<h1 style='color: blue'>Train has been Reached its destination</h1>"
                    // }else{
                    //     //document.getElementById('extraSeats').innerHTML = "<h1 style='color: red'>The Journey hasn't started yet. </h1>"
                    // }

                }

            }else{
                console.log('user2 not found');
            }
        });
    });

    // //============

}

function testFn(){
    console.log(t_12hrSrv());
}
//extraTicket();

function startExtraTicket(){
    let dirName = 'trainInfo';
    let trainName = 'train1';
    let up_down = 'up';
    let pathTrainInfo = dirName+'/'+trainName+'/'+up_down;
    function xtraOp(){
        onValue(ref(database,pathTrainInfo),(snapshot)=>{
            if(snapshot.exists()){
                let curPosSrv = snapshot.child('currentPos').val();
                localStorage.setItem('curPosSrv',curPosSrv);
                curPosSrv = parseInt(curPosSrv);
                if(curPosSrv>=0 && curPosSrv<4){

                    let totalExtraSeats,curExtraSeats,alctSeats;
                    let booked_seats = localStorage.getItem('booked');
                    console.log('booked_seats: '+booked_seats);
                    if(booked_seats !== null && booked_seats !== undefined && booked_seats!==''){
                        booked_seats = booked_seats.split(',');
                    }else{
                        booked_seats=[];
                    }
                    let numberOfStations = 5;
                    let idxofAlctSeat = curPosSrv.toString();
                    alctSeats = snapshot.child('seatInfo').child('lists').child(idxofAlctSeat).child('seats').val();
                    dirName = 'extraTickets';
                    let todayDateId_xtr = todayDateIdServ();
                    let path_extraSeats = dirName+'/'+todayDateId_xtr+'/'+trainName+'/'+up_down+'/extraseats';

                    // for(let st in alctSeats){
                    //     if(booked_seats.includes(alctSeats[st])){
                    //         console.log('booked_seats includes: '+alctSeats[st])
                    //         let idx_alctSt = alctSeats.indexOf(alctSeats[st]);
                    //         if(idx_alctSt>-1){
                    //             alctSeats.splice(idx_alctSt,1);
                    //         }else{
                    //             console.log('index not found');
                    //         }
                    //     }
                    // }
                    //document.getElementById('al').innerText = alctSeats;

                        let curArl = localStorage.getItem('curAr');
                        if(curArl!==null && curArl!==undefined){
                            if(curArl!==''){curArl = curArl.split(',');}
                            else curArl = [];
                        }else{
                            curArl = [];
                        }
                        for(let st in curArl){
                            if(booked_seats.includes(curArl[st])){
                                curArl.splice(st,1);
                            }
                        }
                        for(let s in booked_seats){
                            if(booked_seats.includes(curArl)){
                                console.log(booked_seats[st]);
                            }
                            if(booked_seats.includes(alctSeats)){
                                console.log(booked_seats[st]);
                            }
                        }


                        let newAr = curArl.concat(alctSeats);
                        let st = new Set(newAr);
                         newAr = Array.from(st);
                        //document.getElementById('al').innerText = newAr;
                        set(ref(database,'extraTickets/'+todayDateIdServ()+'/'+trainName+'/'+up_down),{
                            'extraseats':newAr
                        });


                    // console.log(totalExtraSeats);
                    // console.log(path_extraSeats);

                    // set(ref(database,dirName_serv+'/'+todayDateId()+'/'+trainName+'/'+up_down),{
                    //     'extraseats': {}
                    // });

                }else{
                    if(curPosSrv==4){
                        localStorage.clear();
                    }
                }

            }else{
                console.log('not found');
            }
        });
    }
    xtraOp();

    let path_extraSeats = 'extraTickets'+'/'+todayDateIdServ()+'/'+trainName+'/'+up_down+'/extraseats';
    onValue(ref(database,path_extraSeats),(snapshot)=>{
        if(snapshot.exists()){
            let curAr = snapshot.val();
            let booked_seats = localStorage.getItem('booked');
            if(booked_seats !== null && booked_seats!== undefined && booked_seats!==''){
                booked_seats = booked_seats.split(',');
            }else{
                booked_seats=[];
            }
            for(let st in curAr){
                if(booked_seats.includes(curAr[st])){
                    let idxca = curAr.indexOf(curAr[st]);
                    if(idxca>-1){
                        curAr.splice(idxca,1);
                    }
                }
            }
            //alert(curAr);
            localStorage.setItem('curAr',curAr);

        }else{
            console.log('xtr not found again');
        }
    })

    dirName = 'ticketContainer';
    let todayId = todayDateIdServ();
    console.log(todayId)
     let pathTicketContainer = dirName+'/'+todayId+'/'+trainName+'/'+up_down+'/booked_seats/';
     onValue(ref(database,pathTicketContainer),(snapshot)=>{
         if(snapshot.exists()){
             let x = snapshot.val();
             localStorage.setItem('booked',x);
             xtraOp();
         }else{
             console.log('ticketcontainer Not found');
             localStorage.setItem('booked','');
         }
     });
     dirName = "trainInfo"
}
startExtraTicket();
// ================-----------==============----------------=================-========
// ================-----------==============----------------=================-========
// ================-----------==============----------------=================-========
// ================-----------==============----------------=================-========
// ================-----------==============----------------=================-========
// ================-----------==============----------------=================-========
// ================-----------==============----------------=================-========
// ================-----------==============----------------=================-========
// ================-----------==============----------------=================-========
function finalOperation(){
    console.log('finalOperation begin');
    let dirName = 'extraTickets';
    let trainName = 'train1';
    let updown = 'up';
    let pathFinal = dirName+'/'+todayDateIdServ()+'/'+trainName+'/'+updown;
    let extraSeatsFinal = localStorage.getItem('finalXtrSt');
    if(isValid_serv(extraSeatsFinal)){
        extraSeatsFinal = extraSeatsFinal.split(',');
    }else{
        extraSeatsFinal = [];
    }
    set(ref(database,pathFinal),{
        'extraseats':extraSeatsFinal
    });
    console.log('finalOperation end');
}
export function extraTicketOp(){
    console.log('extraTicketOp start');
    let dirName_serv="ticketContainer";
    let trainName = 'train1';
    let up_down = 'up';
   function pos_Alct(){
       console.log('pos_Alct start');
       //getting current position and allocated seats of train
       dirName_serv = 'trainInfo';
       onValue(ref(database,dirName_serv+'/'+trainName+'/'+up_down),(snapshot)=>{
           if(snapshot.exists){
               let y = snapshot.val();
               let curPosSrv = parseInt(y.currentPos);
               //document.getElementById('pos').innerText = "Left station: "+(curPosSrv+1);
               localStorage.setItem('curPosSrv',curPosSrv);
               for(let i=0;i<4;i++){
                   let j = i.toString();
                   //document.getElementById('al').innerText += y.seatInfo.lists[j].seats+"\n....\n";
                   localStorage.setItem('alctseats'+i,y.seatInfo.lists[j].seats);
               }
               finalOperation();
           }
           
       });
       console.log('pos_Alct end');
   }
    pos_Alct();
    //getting extraseats if available
    console.log('extratickets no func start');
    dirName_serv = 'extraTickets';
    onValue(ref(database,dirName_serv+'/'+todayDateIdServ()+'/'+trainName+'/'+up_down),(snapshot)=>{
        if(snapshot.exists()){
            let z = snapshot.val();
            //document.getElementById('al').innerText = z.extraseats;
            localStorage.setItem('extraseats',z.extraseats);
        }else{
            localStorage.setItem('extraseats','');
        }
    });
    console.log('extratickets no func end');
    //getting booked seats live
    dirName_serv='ticketContainer';
    onValue(ref(database,dirName_serv+'/'+todayDateIdServ()+'/'+trainName+'/'+up_down+'/booked_seats'),(snapshot)=>{
        if(snapshot.exists()){
            let x = snapshot.val();
            // console.log(x);
            localStorage.setItem('booked',x);
            pos_Alct();
            let xtrsts = localStorage.getItem('finalXtrSt');
            if(isValid_serv(xtrsts)){
                xtrsts = xtrsts.split(',');
                for(let sts in x){
                   if(xtrsts.includes(x[sts])){
                       let idxXtrsts = xtrsts.indexOf(x[sts]);
                       if(idxXtrsts>-1){
                           xtrsts.splice(idxXtrsts,1);
                       }
                   }
                }
                localStorage.setItem('finalXtrSt',xtrsts);
            }
        }else{
            console.log('ticketContainer not found');
        }
    });
    //main operation start
    function mainOperation(){
        console.log('mainOperation start');
        let trPos_serv = localStorage.getItem('curPosSrv');
        if(isValid_serv(trPos_serv)){
            trPos_serv = parseInt(trPos_serv);
        }else{
            console.log('no trpos value found -at line 382');
            return; 
        }
        //extraseats
        let extraseatsM = localStorage.getItem('extraseats');
        if(isValid_serv(extraseatsM)){
            extraseatsM = extraseatsM.split(',');
        }else{
            extraseatsM = [];
        }
        //booked seats
        let booked_seats = localStorage.getItem('booked');
        if(isValid_serv(booked_seats)){
            booked_seats = booked_seats.split(','); 
        }else{
            booked_seats = [];
        }
        if(trPos_serv>=0 && trPos_serv<4){
            //allocated seats
            let alctseats = localStorage.getItem('alctseats'+trPos_serv);
            if(isValid_serv(alctseats)){
                alctseats = alctseats.split(',');
            }else{
                alctseats = [];
            }

            extraseatsM = extraseatsM.concat(alctseats);
            //remove booked from extraseats
            for(let st in booked_seats){
                if(extraseatsM.includes(booked_seats[st])){
                    //console.log(booked_seats[st]);
                    let idx_bs = extraseatsM.indexOf(booked_seats[st]);
                    if(idx_bs > -1){
                        extraseatsM.splice(idx_bs,1);
                    }
                }
            }
            let prvXtrst = localStorage.getItem('finalXtrSt');
            if(isValid_serv(prvXtrst)){
                prvXtrst = prvXtrst.split(',');
                prvXtrst = prvXtrst.concat(extraseatsM);
            }else{
                prvXtrst = extraseatsM;
            }
            let setNow = new Set(prvXtrst);
            prvXtrst = Array.from(setNow);
            localStorage.setItem('finalXtrSt',prvXtrst);
            finalOperation();
            //document.getElementById('al').innerText = prvXtrst+"\n..\nbooked:\n"+booked_seats;
        }else{
            if(trPos_serv==4){
                setTimeout(()=>{
                    localStorage.clear();
                    set(ref(database,'extraTickets/'),{
                        
                    });
                    set(ref(database,'trainInfo/'+todayDateIdServ()+'/'+trainName),{
                        'currentPos':'-1'
                    });
                },5000);
            }
        }
        //document.getElementById('al').innerText = extraseatsM+"\n..\nbooked:\n"+booked_seats;
        //console.log(booked_seats);
        console.log('mainOperation end');
    }

    mainOperation();
    console.log('extraTicketOp end');
}

export function exportServer(){
    console.log('this is from server: '+todayDateIdServ());
}

//extraTicketOp();

onValue(ref(database,'/'),(snapshot)=>{
    if(snapshot.exists()){
        extraTicketOp();
    }
})

//setInterval(finalOperation,2500);
setTimeout(()=>{
   deletePrevious();
},5000);

// set(ref(database,'extraTickets/20230420/train1/up'),{
//     'extraseats':['A-01','A-02','A-03'],
// })
//extraTicketOp();
//setInterval(extraTicketOp,3000);
//setInterval(finalOperation,3000);
//extraTicketOp();
//finalOperation();
setInterval(leftStation,1000);
//setInterval(testFn,1000);
//localStorage.clear();
 
