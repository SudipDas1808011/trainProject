import {initializeApp} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {getAnalytics} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-analytics.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import {getDatabase,push,child, onValue, ref, set,update,get,query,orderByKey, limitToLast} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import { firebaseConfig } from './module.js';

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
function t_12hr(){
    var d = new Date();
    var hours = d.getHours() % 12 || 12;
    var minutes = d.getMinutes().toString().padStart(2, '0');
    var ampm = d.getHours() >= 12 ? 'PM' : 'AM';

    return hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;
}
function todayDateId(){
    let d = new Date();
    return d.getFullYear().toString()+(d.getMonth()+1).toString().padStart(2,0)+d.getDate().toString().padStart(2,0);
}
function isValid(variable){
    if(variable !==null && variable!==undefined && variable!==''){
        return true;
    }else{
        return false;
    }
}
var count = 0;
function resetFn(isReached_val){
    count++;
    console.log(count);
    localStorage.clear();
    setTimeout(()=>{
        update(ref(database,'trainInfo/train1/up'),{
            currentPos:-1
        });
    },3000);

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
     var nowTime12fmt = t_12hr();
    var td = new Date();
    var ap = td.getHours()>12?'PM':'AM';
    document.getElementById('time').innerText = (td.getHours()%12||12).toString().padStart(2,0)+":"+td.getMinutes().toString().padStart(2,0)+':'+td.getSeconds().toString().padStart(2,0)+" "+ap+'\n\n'+localStorage.getItem('departTimesServ');
    
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


function testFn(){
    console.log(t_12hr());
}
//extraTicket();
//======-----------==============----------------=================-========
function finalOperation(){
    let dirName = 'extraTickets';
    let trainName = 'train1';
    let updown = 'up';
    let pathFinal = dirName+'/'+todayDateId()+'/'+trainName+'/'+updown;
    let extraSeatsFinal = localStorage.getItem('finalXtrSt');
    if(isValid(extraSeatsFinal)){
        extraSeatsFinal = extraSeatsFinal.split(',');
    }else{
        extraSeatsFinal = [];
    }
    set(ref(database,pathFinal),{
        'extraseats':extraSeatsFinal
    });
    
}
function output(){
    try {
        document.getElementById('al').innerText = localStorage.getItem('finalXtrSt').split(',').sort() + "\n\n...\nbooked\n....\n" + localStorage.getItem('booked').split(',').sort();
    }catch(e){
        document.getElementById('al').innerText = e;
    }
}
function extraTicketOp(){
    let dirName_serv="ticketContainer";
    let trainName = 'train1';
    let up_down = 'up';
   function pos_Alct(){
       //getting current position and allocated seats of train
       dirName_serv = 'trainInfo';
       onValue(ref(database,dirName_serv+'/'+trainName+'/'+up_down),(snapshot)=>{
           if(snapshot.exists){
               let y = snapshot.val();
               let curPosSrv = parseInt(y.currentPos);
               document.getElementById('pos').innerText = "Left station: "+(curPosSrv+1);
               localStorage.setItem('curPosSrv',curPosSrv);
               for(let i=0;i<4;i++){
                   let j = i.toString();
                   //document.getElementById('al').innerText += y.seatInfo.lists[j].seats+"\n....\n";
                   localStorage.setItem('alctseats'+i,y.seatInfo.lists[j].seats);
               }
               finalOperation();
           }
           
       });
   }
    pos_Alct();
    //getting extraseats if available
    dirName_serv = 'extraTickets';
    onValue(ref(database,dirName_serv+'/'+todayDateId()+'/'+trainName+'/'+up_down),(snapshot)=>{
        if(snapshot.exists()){
            let z = snapshot.val();
            //document.getElementById('al').innerText = z.extraseats;
            localStorage.setItem('extraseats',z.extraseats);
        }else{
            localStorage.setItem('extraseats','');
        }
    });
    //getting booked seats live
    dirName_serv='ticketContainer';
    onValue(ref(database,dirName_serv+'/'+todayDateId()+'/'+trainName+'/'+up_down+'/booked_seats'),(snapshot)=>{
        if(snapshot.exists()){
            let x = snapshot.val();
            // console.log(x);
            localStorage.setItem('booked',x);
            pos_Alct();
            let xtrsts = localStorage.getItem('finalXtrSt');
            if(isValid(xtrsts)){
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
        let trPos = localStorage.getItem('curPosSrv');
        if(isValid(trPos)){
            trPos = parseInt(trPos);
        }else{
            console.log('no trpos value found -at line 382');
        }
        //extraseats
        let extraseatsM = localStorage.getItem('extraseats');
        if(isValid(extraseatsM)){
            extraseatsM = extraseatsM.split(',');
        }else{
            extraseatsM = [];
        }
        //booked seats
        let booked_seats = localStorage.getItem('booked');
        if(isValid(booked_seats)){
            booked_seats = booked_seats.split(','); 
        }else{
            booked_seats = [];
        }
        if(trPos>=0 && trPos<4){
            //allocated seats
            localStorage.setItem('isReached','0');
            let alctseats = localStorage.getItem('alctseats'+trPos);
            if(isValid(alctseats)){
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
            if(isValid(prvXtrst)){
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
            if(trPos===4){
                localStorage.setItem('isReached','1');
                console.log('reached');
                resetFn(1);
                
            }
        }
        //document.getElementById('al').innerText = extraseatsM+"\n..\nbooked:\n"+booked_seats;
        //console.log(booked_seats);
    }
    mainOperation();
}

export function exportServer(){
    console.log('this is from server');
}

extraTicketOp();


onValue(ref(database,'/'),(snapshot)=>{
    if(snapshot.exists()){
        extraTicketOp();
        output();
    }
});


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
 
