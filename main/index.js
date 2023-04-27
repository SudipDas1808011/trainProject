// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {getAnalytics} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-analytics.js";
import {getAuth, createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import {
    getDatabase,
    ref,
    set,
    get,
    onValue,
    child,
    push,
    update
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import { firebaseConfig } from './module.js';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const dbRef = ref(getDatabase());

// ----------------- End - Firebase --------------------------
function splitter(myArray){

    if (myArray === null || myArray === undefined || myArray==='') {
        return [];
    } else {
        return myArray.split(',');
    }
}
function isValid(s){
    if(s !== null && s!==undefined && s!=='' ) return true;
    else return false;
}
function todayDateId(){
    let d = new Date();
    return d.getFullYear().toString()+(d.getMonth()+1).toString().padStart(2,0)+d.getDate().toString().padStart(2,0);
}
//------------ displaying journey details---------------
// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const input = urlParams.get('journey');
const daysInWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const stations = ['station1','station2','station3','station4','station5'];
const dateNow = new Date();
const up_down = parseInt(input.split(',')[0].match(/\d+/)[0])<parseInt(input.split(',')[1].match(/\d+/)[0])?'up':'down';
const jouneyDateID = input.split(',')[2].replace(/-/g,'');
const isUp = (up_down=='up')?true:false;
const journeyData = splitter(input);
const fromStationID = parseInt(journeyData[0].match(/\d+/)[0])-1;
const toStationID = parseInt(journeyData[1].match(/\d+/)[0])-1;
let tmp = localStorage.getItem('departTimes');
const departTimesAr = splitter(tmp);


let availableTrains = localStorage.getItem('availableTrains');
availableTrains = splitter(availableTrains);
const trainName = availableTrains[0];

//============== functions=============

function out(key,val){
    document.getElementById('outputid').innerText = key+" : \n"+val;
}
function scrollPosLive() {//when seats can be shown it stores scroll position
    if (localStorage.getItem('selSeatDropDown') === '1') {
        localStorage.setItem('scrollPos', window.pageYOffset);
        //window.scrollTo(0,parseInt(localStorage.getItem('scrollPos')));
    }
}
function curFullDateId(){
    var d = new Date();
    return d.getFullYear().toString()+(d.getMonth()+1).toString().padStart(2,0)+d.getDate().toString().padStart(2,0);
}
function convertTo24Hour(time12h) {
    time12h = splitter(time12h);
    const [time, modifier] = time12h
    let hours, minutes;
    try{
        [hours, minutes] = time.split(':');
    }catch(e){
        //$0('time in undefined please wait');
    }
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
}
function t_12hr(){
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    return hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;
}
function generateUniqueId() {
    var randomNumber = Math.floor(Math.random() * 1000000);
    var timestamp = new Date().getTime();
    var uniqueId = timestamp.toString() + randomNumber.toString();
    return uniqueId;
}

var myUniqueId = generateUniqueId();
console.log(myUniqueId);

function mapObj(map){
    onValue(ref(database,'ticketContainer/'+jouneyDateID+'/'+trainName+'/'+up_down),(snapshot)=>{
        if(snapshot.exists()){
            let tcmp = snapshot.val();
            let booked_seatsMap = tcmp.booked_seats;
            booked_seatsMap = Object.values(booked_seatsMap);
            let disallowSeatsForThisJourneyMap = localStorage.getItem('disallowSeatsForThisJourney');
            if(isValid(disallowSeatsForThisJourneyMap)){
                disallowSeatsForThisJourneyMap = disallowSeatsForThisJourneyMap.split(',');
            }else{
                disallowSeatsForThisJourneyMap = [];
            }
            try{
                for (let st in booked_seatsMap){
                    var stidbooked = parseInt(map[booked_seatsMap[st]].match(/\d+/));//stidbooked--> stationId of booked seat. the seat contain which station
                    var stidNow = parseInt(journeyData[0].match(/\d+/));//stidNow --> from which station passenger goes
                    //console.log('stidbooked: '+stidbooked+'\n'+'stidNow: '+stidNow);
                    if(isUp){
                        //console.log('av: '+map[booked_seatsMap[st]]);
                        if(stidNow>=stidbooked){// for up train, is this seat booked for later station to passengers departure station?
                            //if passengers departure station is present or ahead  of booked seats station
                            let idx;
                            //if(disallowSeatsForThisJourney.includes(booked_seats[st])){//the seats which are not allocated for this station but booked
                            idx = disallowSeatsForThisJourneyMap.indexOf(booked_seatsMap[st]);
                            if (idx > -1) {
                                disallowSeatsForThisJourneyMap.splice(idx, 1); //as the current station is later of booked station, so the seat should be allowed to purchase
                                //that's why it is spliced, means removed from disallowed seats
                            }
                        }else{
                            if(!disallowSeatsForThisJourneyMap.includes(booked_seatsMap[st])){
                                disallowSeatsForThisJourneyMap.push(booked_seatsMap[st]);
                            }
                        }
                    }else{//for down

                        if(stidNow<=stidbooked){// for up train, is this seat booked for later station to passengers departure station?
                            //if passengers departure station is present or ahead  of booked seats station
                            let idx;
                            //if(disallowSeatsForThisJourney.includes(booked_seats[st])){//the seats which are not allocated for this station but booked
                            idx = disallowSeatsForThisJourneyMap.indexOf(booked_seatsMap[st]);
                            if (idx > -1) {
                                disallowSeatsForThisJourneyMap.splice(idx, 1); //as the current station is later of booked station, so the seat should be allowed to purchase
                                //that's why it is spliced, means removed from disallowed seats
                            }
                        }else{
                            if(!disallowSeatsForThisJourneyMap.includes(booked_seatsMap[st])){
                                disallowSeatsForThisJourneyMap.push(booked_seatsMap[st]);
                            }
                        }

                    }
                }
            }catch(e){
                console.log("error in mapping --> "+e);
            }

            localStorage.setItem('disallowSeatsForThisJourney',disallowSeatsForThisJourneyMap);
            //out('disallow',disallowSeatsForThisJourneyMap.sort().toString());
            for (const id of disallowSeatsForThisJourneyMap) {
                const idel = document.getElementById(id);
                if(isValid(idel)){
                    idel.style.setProperty('background-color', 'gray');
                }else{
                    console.log("idel is null");
                }
            }
        }
    });
}
function genSeat(){
    let alctSeatsInfo = localStorage.getItem('alctseats'+fromStationID);
    alctSeatsInfo = splitter(alctSeatsInfo);
    const seatContainers = document.querySelectorAll(".seats");
    var disallowSeatsForThisJourney = [];
    const coachName = ['A', 'B', 'C', 'D', 'E', 'F'];
// Generate 92 seats for each coach
    for (let i = 0; i < seatContainers.length; i++) {
        for (let j = 1; j <= 92; j++) {
            const seat = document.createElement("div");
            var k = j.toString().padStart(2, '0');
            seat.classList.add("seat");
            seat.setAttribute("id", coachName[i] + '-' + k);
            seat.innerHTML = `<span class="seat-number">${coachName[i]}-${k}</span>`;
            seatContainers[i].appendChild(seat);
            let tmpidinloop = coachName[i] + '-' + k;
            if (!(alctSeatsInfo.includes(tmpidinloop))) {//make seats disabled which are not allocated for the current jouney
                disallowSeatsForThisJourney.push(tmpidinloop);
            }
        }
    }
    localStorage.setItem('disallowSeatsForThisJourney',disallowSeatsForThisJourney) ;
   return disallowSeatsForThisJourney;
}
function makeGrayLocal(){
    let bked_sts = localStorage.getItem('booked_seats');
    if(isValid(bked_sts)){
        bked_sts = bked_sts.split(',');
        let set = new Set(bked_sts);
        bked_sts = Array.from(set);
        bked_sts = bked_sts.sort();
    }else{
        bked_sts = [];
    }
    let crp = localStorage.getItem('curPos');
    crp = parseInt(crp);
    if(crp>-1){

        let alct_st_mg = localStorage.getItem('alctseats'+fromStationID);
        if(isValid(alct_st_mg)){alct_st_mg = alct_st_mg.split(',');}
        let xt_st = localStorage.getItem('extaseats');
        xt_st = splitter(xt_st);
        for(let s in bked_sts){
            if(xt_st.includes(bked_sts[s])){
                bked_sts.splice(s,1);
            }else{
                document.getElementById(bked_sts[s]).style.backgroundColor = 'gray';
            }
        }
    }else{

    }

}
function retrieveDataOnce(path,serial){
    if(serial === 1){//available trains
        get(child(dbRef, path)).then((snapshot) => {
            if (snapshot.exists()) {
                localStorage.setItem('availableTrains',snapshot.val());
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }
    else if(serial===2){// train information
        get(child(dbRef, path)).then((snapshot) => {
            if (snapshot.exists()) {
                let trInfoOnce = snapshot.val();
                localStorage.setItem('departTimes',trInfoOnce.departTime);
                localStorage.setItem('offDay',trInfoOnce.offDay);
                localStorage.setItem('fares',trInfoOnce.fare);

                for(let i in availableTrains){
                    let jd = parseInt(journeyData[2].split('-')[2]);
                    let gap = jd - dateNow.getDate();
                    let journeyDateId = parseInt(journeyData[2].replace(/-/g,""));
                    let journey_idx = dateNow.getDay()+journeyDateId-parseInt(todayDateId());

                    if(journey_idx>6){journey_idx -=7;}
                    console.log('ji: '+journey_idx);
                    if (trInfoOnce.offDay.toLowerCase() === daysInWeek[journey_idx].toLowerCase()) {
                        var element = document.querySelector('.content');
                        element.style.display = 'none';//checking if today is off day
                        document.getElementById('containerForAvalaibleTrain').innerText = availableTrains[i] + " Today is OFF";
                        document.getElementById('availableTrainId').innerHTML = "<h2  style='color: red;'>Today is OFF</h2>"
                        let journeyDataIdWet = document.getElementById('journey-data');
                        journeyDataIdWet.innerText += "From: " + journeyData[0] + "\nTo: " + journeyData[1] + "\nDate: " + journeyData[2] + "\n";
                        journeyDataIdWet.innerText += "Day: " + daysInWeek[journey_idx] + "\n";
                        journeyDataIdWet.innerText += "Depart Time: " + departTimesAr[fromStationID] + "\n";
                        journeyDataIdWet.innerText += "Arrival Time: " + departTimesAr[4] + "\n";
                        journeyDataIdWet.innerText += "Allocated seats: " + localStorage.getItem('cnt_alctseats'+fromStationID.toString()) + "\n";
                    } else {
                        let trainNameCap = availableTrains[i].toString().charAt(0).toUpperCase()+availableTrains[i].toString().slice(1);
                        document.getElementById('containerForAvalaibleTrain').innerText = trainNameCap + " is available today";
                        let journeyDataIdWet = document.getElementById('journey-data');
                        journeyDataIdWet.innerHTML = "From: " + journeyData[0] + "<br>To: " + journeyData[1] + "\nDate: " + journeyData[2] + "<br>";
                        journeyDataIdWet.innerHTML += "Day: " + daysInWeek[journey_idx] + "<br>";
                        journeyDataIdWet.innerHTML += "Depart Time: " + departTimesAr[fromStationID] + "<br>";
                        journeyDataIdWet.innerHTML += "Arrival Time: " + departTimesAr[4] + "<br>";
                        let range_alct_st = localStorage.getItem('alctseats'+fromStationID);
                        let len_range_alct_st;
                        if(isValid(range_alct_st)){
                            range_alct_st = splitter(range_alct_st);
                             len_range_alct_st = range_alct_st.length;
                        }
                        journeyDataIdWet.innerHTML += "Allocated seats: " + localStorage.getItem('cnt_alctseats'+fromStationID.toString()) +"<p align='center'>("+range_alct_st[0]+" --> "+range_alct_st[(len_range_alct_st-1)] +")</p>";
                    }
                    break;
                }

            } else {
                console.log("No data available for train information");
            }
        }).catch((error) => {
            console.error(error);
        });
    }
}
function retrieveDataOnvalue(path,serial){
    if(serial === 1){//train position
        onValue(ref(database,path),(snapshot)=>{
            if(snapshot.exists()){
                let trInfoOV = snapshot.val();
                localStorage.setItem('curPos',trInfoOV.currentPos);
                if(todayDateId()===jouneyDateID){
                    if(fromStationID<=parseInt(trInfoOV.currentPos)){
                        var element = document.querySelector('.content');
                        element.style.display = 'none';//checking if today is off day
                        unavailable();
                       
                    }else{
                        if(parseInt(trInfoOV.currentPos)>=0 && parseInt(trInfoOV.currentPos)<trInfoOV.stations.length){
                            document.getElementById('left_station').innerText = "Left from : "+trInfoOV.stations[trInfoOV.currentPos];
                            document.getElementById('left_station').style.setProperty("font-size","27px");
                            document.getElementById('left_station').style.setProperty("background-color","red");
                            document.getElementById('left_station').style.setProperty("color","white");
                            document.getElementById('left_station').style.setProperty("position","fixed");
                            document.getElementById('left_station').style.setProperty("right","0");
                            document.getElementById('left_station').style.setProperty("padding-right","20px");
                            document.getElementById('left_station').style.setProperty("border-radius","0");
                            //document.getElementById('left_station').style.setProperty("animation","blink 5s infinite");

                            
                        }else if(parseInt(trInfoOV.currentPos) === trInfoOV.stations.length){
                            document.getElementById('left_station').innerText = "Train Reached its destination";
                        }else{
                            document.getElementById('left_station').innerText = "Journey hasn\'t started yet";
                        }
                    }
                }
                for(let i in trInfoOV.seatInfo.lists){
                    localStorage.setItem('alctseats'+i,trInfoOV.seatInfo.lists[i].seats);
                    localStorage.setItem('cnt_alctseats'+i,trInfoOV.seatInfo.lists[i].length);
                }
            }else{
                console.log('no data found for train position');
            }
        });
    }else if(serial===2){//booked onValue
        onValue(ref(database,path),(snapshot)=>{
            if(snapshot.exists()){
                let tc = snapshot.val();
                localStorage.setItem('booked_seats',tc.booked_seats);
                let ss_Ov = localStorage.getItem('selected_seats'); //ss_Ov => selected_seats
                ss_Ov = splitter(ss_Ov);
                for(let st_ssOv in ss_Ov){
                    if(tc.booked_seats.includes(ss_Ov[st_ssOv])){
                        let idx_ssOv = ss_Ov.indexOf(ss_Ov[st_ssOv]);
                        if(idx_ssOv>-1){
                            ss_Ov.splice(idx_ssOv,1);
                            if(isValid(ss_Ov[st_ssOv])){
                                document.getElementById(ss_Ov[st_ssOv]).classList.toggle('selected');
                                document.getElementById(ss_Ov[st_ssOv]).style.setProperty('color','black');
                            }
                        }
                    }
                }
                localStorage.setItem('selected_seats',ss_Ov.toString());
                document.getElementById('selected_seats').innerText = "selected seat(s): " + ss_Ov.toString();
            }
        });
    }else if(serial===3){//extraseats
        onValue(ref(database,path),(snapshot)=>{
            if(snapshot.exists()){
                let xtr = snapshot.val();
                localStorage.setItem('extraseatsOV',xtr.extraseats);
                let disallowSeatsForThisJourneyXtr = localStorage.getItem('disallowSeatsForThisJourney');
                if(disallowSeatsForThisJourneyXtr!==null &&disallowSeatsForThisJourneyXtr!==undefined &&disallowSeatsForThisJourneyXtr!=='' )
                    disallowSeatsForThisJourneyXtr = disallowSeatsForThisJourneyXtr.split(',');
                else{
                    disallowSeatsForThisJourneyXtr = [];
                }
                for(let stxtr in xtr.extraseats){
                    if(disallowSeatsForThisJourneyXtr.includes(xtr.extraseats[stxtr])){
                        let idxXtr = disallowSeatsForThisJourneyXtr.indexOf(xtr.extraseats[stxtr]);
                        if(idxXtr>-1){
                            disallowSeatsForThisJourneyXtr.splice(idxXtr,1);
                        }
                    }
                }
                localStorage.setItem('disallowSeatsForThisJourney',disallowSeatsForThisJourneyXtr);
                for (const idxt of xtr.extraseats) {
                    const idelxt = document.getElementById(idxt);
                    if(isValid(idelxt)){
                        idelxt.style.setProperty('background-color', 'green');
                    }else{
                        console.log("idel is null");
                    }
                }
                //out('Disallow',disallowSeatsForThisJourneyXtr.sort().toString());
            }else{
                console.log('extraseats not found');
            }
        });
    }else if(serial===4){//mapping start
        onValue(ref(database,path),(snapshot)=>{
            if(snapshot.exists()){
                let map = snapshot.val();
                mapObj(map);
            }
        });
    }
}

function clickedSeatOp(){
    const allSeats = document.querySelectorAll(".seat");
    for (let i = 0; i < allSeats.length; i++) {
        allSeats[i].addEventListener("click", function () {
console.log('clicked');
            document.getElementById('overlay').style.display = 'block';
                                setTimeout(()=>{
                                    document.getElementById('overlay').style.display = 'none';
                                },500);

            let clickedSeats = localStorage.getItem('selected_seats');
            clickedSeats = splitter(clickedSeats);
            let clickedSeatLength=clickedSeats.length;
            let disallowedIds = localStorage.getItem('disallowSeatsForThisJourney');
            disallowedIds = splitter(disallowedIds);
            if(disallowedIds.includes(this.id)){
                console.log("Not available");
            }else{
                if ((clickedSeatLength < 4 || this.classList.contains("selected")) ) { let isValid_seat;
                    function myFunction(idplz) {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                resolve(idplz);
                            }, 1000);
                        });
                    }
                    verify_Unique(this.id);
                    function verify_Unique(selected_seat_id){
                        let path_vfUq = 'selected_seats/'+jouneyDateID+'/'+trainName+'/'+up_down+'/'+selected_seat_id;
                        if(isValid(selected_seat_id)){
                            get(ref(database,path_vfUq))
                                .then((snapshot) => {
                                    if(snapshot.exists()){
                                        myAsyncFunction(false,selected_seat_id);
                                    }else{
                                        myAsyncFunction(true,selected_seat_id);
                                    }
                                });
                        }
                    }
                    async function myAsyncFunction(bl,sid) {
                        const value = await myFunction(bl);
                        isValid_seat = value; 
                        start_selecting(isValid_seat,sid);
                    }
                    function start_selecting(isValid_seat,bs_ID_val){
                        let bs_ID = document.getElementById(bs_ID_val);
                            let path_ss = 'selected_seats/'+jouneyDateID+'/'+trainName+'/'+up_down;
                            let update_ss = {};
                            //bs_ID.style.setProperty('animation','blink 500ms 3');

                            bs_ID.classList.toggle("selected");
                        const seatNumber = bs_ID.querySelector(".seat-number").innerText;
                            if (bs_ID.classList.contains("selected")) {
                                if(isValid_seat){
                                    bs_ID.style.backgroundColor = 'red';
                                    bs_ID.style.color = 'white';
                                    update_ss[bs_ID.id]=sessionStorage.getItem('uidToken');
                                    update(ref(database,path_ss),update_ss);
                                    clickedSeats.push(seatNumber);
                                }else{
                                    bs_ID.style.backgroundColor = 'yellow';
                                    bs_ID.style.color = 'black';
                                    bs_ID.title = 'this seat is being using by other';
                                }
                            } else {
                                bs_ID.style.backgroundColor = 'green';
                                bs_ID.style.color = 'black';
                                bs_ID.title = '';
                                clickedSeats = clickedSeats.filter(seat => seat !== seatNumber);
                                if(clickedSeats.length===0){
                                    console.log('zero');
                                    setTimeout(() => {
                                        document.getElementById('selected_seats').innerText = "";
                                    }, 1000);
                                    document.getElementById('selected_seats').innerText = "";
                                    
                                }
                                if(!isValid_seat){
                                    let j_katse_tar_token;
                                    let amar_token = sessionStorage.getItem('uidToken');
                                    let rpath = 'selected_seats/'+jouneyDateID+'/'+trainName+'/'+up_down+'/'+bs_ID_val;
                                    get(ref(database,rpath))
                                        .then((snapshot) => {
                                            if(snapshot.exists()){
                                                let val_ssPrv = snapshot.val();
                                                j_katse_tar_token = val_ssPrv;

                                                if(j_katse_tar_token === amar_token){
                                                    set(ref(database,rpath),{

                                                    });
                                                 }
                                            }
                                        })
                                        .catch((error) => {
                                            // Handle any errors here
                                            console.error(error);
                                        });

                                }

                            }
                            
                                //console.log(`Selected seats: ${selectedSeats.join(", ")}`);
                                document.getElementById('selected_seats').style.display = "block";
                            document.getElementById('selected_seats').innerText = "selected seat(s): " + clickedSeats.join(", ");
                            localStorage.setItem('selected_seats', clickedSeats);

                            if (clickedSeatLength === 4) {
                                for (let j = 0; j < allSeats.length; j++) {
                                    if (!allSeats[j].classList.contains("selected")) {
                                        allSeats[j].classList.add("disabled");
                                    }
                                }
                            } else {
                                for (let j = 0; j < allSeats.length; j++) {
                                    allSeats[j].classList.remove("disabled");
                                }
                            }
                            

                    }

                }else{
                    alert('Your Quota for MAX 4 seats is fulfilled');
                }
            }

        });
    }
}
function gotoSearch(){
    const myDiv = document.getElementById('iframe');
    myDiv.scrollIntoView({ behavior: 'smooth' });
    let cn_div_id = document.getElementById('containerdiv');
    
    cn_div_id.style.cssText="display: flex;flex-wrap: wrap;align-items: flex-start;align-content: flex-start;";
    document.getElementById('dropdown-btn').style.display = "none";
    document.getElementById('hide').style.display = "block";
    document.getElementById('content').style.display = "none";
    document.getElementById('journey-data').style.whiteSpace = 'pre-line';
    
    

}
function hide_container(){
    let cn_div_id = document.getElementById('containerdiv');
    cn_div_id.style.display = "none";
    document.getElementById('hide').style.display = "none";
    document.getElementById('dropdown-btn').style.display = "block";
    document.getElementById('content').style.display = "block";
    
    
}
document.getElementById('hide').addEventListener('click',hide_container);
//setInterval(makeGray,1000);
function clickDropDwn(){
    document.getElementById('dropdown-btn').addEventListener('click',gotoSearch);
}
clickDropDwn();
function hop(hp){
    console.log(hp);
}
//hop('outside');

function callRetrieveData(){
    let path1,path2,path3,path4,path5;
    let journey = input.split(',');
     path1 = 'availableTrain/'+journey[0]+'to'+journey[1];
     retrieveDataOnce(path1,1);
     path2 = 'trainInfo/'+trainName+'/'+up_down;
     retrieveDataOnce(path2,2);
     retrieveDataOnvalue(path2,1);//getting trainPosition and allocated seats
     path3 = 'ticketContainer/'+jouneyDateID+'/'+trainName+'/'+up_down;
     retrieveDataOnvalue(path3,2);//getting booked seats
     path4 = 'extraTickets/'+todayDateId()+'/'+trainName+'/'+up_down;
     retrieveDataOnvalue(path4,3);
     path5 = 'mapSeatToStation/'+jouneyDateID+'/'+trainName+'/'+up_down;
     retrieveDataOnvalue(path5,4);//mapping
}
function verifyTime() {
    let currentTimeIn12fmt = t_12hr();
    let departTimeofCrntTrainIn12fmt = departTimesAr[fromStationID];
    var crpos = localStorage.getItem('curPos');
    let isLeft;
    if(isValid(crpos)){
        isLeft = fromStationID>parseInt(crpos)?false:true;
    }

    var departTimeofCrntTrainIn24fmt = convertTo24Hour(departTimeofCrntTrainIn12fmt);
    var currentTimeIn24fmt = convertTo24Hour(currentTimeIn12fmt);

    //console.log("dept time:" + departTimeofCrntTrainIn24fmt);
    //console.log("cur time:" + currentTimeIn24fmt);

    var intValueJourney = parseInt(jouneyDateID);
    var formattedDateNow = parseInt(curFullDateId());

    let isTicketAvail;
    if (intValueJourney > formattedDateNow) {
        isTicketAvail = true;
    } else {
        if (departTimeofCrntTrainIn24fmt > currentTimeIn24fmt) {
            isTicketAvail = true;
        } else {
            var tmphrdp =  departTimeofCrntTrainIn12fmt.split(':');
            var tmphrnw =  currentTimeIn12fmt.split(':');
            tmphrdp = parseInt(tmphrdp[0]);
            tmphrnw = parseInt(tmphrnw[0]);
            isTicketAvail = false;
        }
        //isTicketAvail = isTicketAvail && (!isLeft);
        isTicketAvail =  (!isLeft);
    }
    //console.log('ticket can be purchased?: ' + isTicketAvail);
    return isTicketAvail;
}

function bookOp(){//start booking
    document.getElementById('header').style.display = "block";
    var bookBtnId = document.getElementById('confirm_btn');
    //booking seat
    bookBtnId.addEventListener('click', function () {
        document.getElementById('confirmation_popup').style.display = "none";
        
        var userJourneyDate = jouneyDateID;
        let clickedSeatsBk = localStorage.getItem('selected_seats');
        clickedSeatsBk = splitter(clickedSeatsBk);
        for(let clc_st in clickedSeatsBk){
            let path_clc_st = 'selected_seats/'+jouneyDateID+'/'+trainName+'/'+up_down+'/'+clickedSeatsBk[clc_st];
            set(ref(database,path_clc_st),{

            });
        }
        if (clickedSeatsBk.length>0) {
            if (verifyTime()) {
                document.getElementById('selected_seats').innerText += "\n\nBooked seat " + clickedSeatsBk + " successful";
                let already_booked, tmpalready_booked, new_booked;
                tmpalready_booked = localStorage.getItem('booked_seats');
                tmpalready_booked = splitter(tmpalready_booked);

                let bookable_seats = clickedSeatsBk;
                    new_booked = bookable_seats.concat(tmpalready_booked);
                    const updates = {
                        booked_seats: new_booked
                    }
                    let userBooked;
                    let user_already_Booked = localStorage.getItem('userBooked');
                    user_already_Booked = splitter(user_already_Booked);
                    userBooked = user_already_Booked.concat(bookable_seats);

                    const updatesUser = {
                        userBooked: userBooked,
                        userJourneyDate: userJourneyDate,
                    }
                    for (let ss in clickedSeatsBk) {
                        var updateMappingofSeats = {}; //declare jsondata
                        updateMappingofSeats[clickedSeatsBk[ss]] = journeyData[1]; //seat-key = toStation
                        update(ref(database, '/mapSeatToStation/' + jouneyDateID + '/' + trainName + '/' + up_down), updateMappingofSeats);
                    }
                    update(ref(database, '/ticketContainer/' + jouneyDateID + "/" + trainName + "/" + up_down), updates);
                    update(ref(database, '/users/' + sessionStorage.getItem('uidToken')), updatesUser);
                    alert('update successful');
                    localStorage.setItem('selected_seats', '');
                    location.reload();
            } else {
                alert('Train Already Left');
            }
        } else {
            alert("select seat first!");
        }
    });
}
function unavailable(){
    document.getElementById('bookBtn').style.background = 'gray';
    document.getElementById('dropdown-div').style.display = 'none';
    //document.body.innerHTML += "<h1><p align='center'><font color='red'>Train Already Left </font></h2><br><br><br></p>"
    document.getElementById('availableTrainId').innerHTML = "<h1><p align='center'><font color='red'>Train Already Left </font></h2></p>"
    //document.getElementById('journeydata').style.boxShadow = "box-shadow: 0 0 10px #FF0000";
    localStorage.clear();
    localStorage.setItem('selected_seats','');
    localStorage.setItem('extraseats','');
    //const elements = document.querySelectorAll('.content');

    var element = document.querySelector('.content');
    element.style.display = 'none';
    document.getElementById('hide').disabled = true;
}

function confirmation_popup(){
let conf_popup_id = document.getElementById('confirmation_text');
conf_popup_id.innerHTML = "<h1 id='heading_ct'><u>Confirm Your Booking?</u><table id='table' border=1><tr><th>From</th><td>"+journeyData[0]+"</td></tr><tr><th>To</th><td>"+journeyData[1]+"</td></tr><tr><th>Date of Journey</th><td style='font-weight: bold'>"+journeyData[2]+"</td></tr><tr><th>Seat(s)</th><td>"+localStorage.getItem('selected_seats')+"</td></tr>";
}

document.getElementById('bookBtn').addEventListener('click',()=>{
    let ss_data = localStorage.getItem('selected_seats');
    ss_data = splitter(ss_data);
    if(ss_data.length>0){
        confirmation_popup();
        document.getElementById('confirmation_popup').style.display = "block";
        document.getElementById('content').style.display = "none";
        document.getElementById('header').style.display = "none";
    }else{
        alert('Select at least one seat');
    }

});
document.getElementById('cancel_btn').addEventListener('click',()=>{
    document.getElementById('confirmation_popup').style.display = "none";
    document.getElementById('header').style.display = "block";
    document.getElementById('content').style.display = "block";
        
});

// function makeGray(){
//     let tmpG;
//     tmpG = localStorage.getItem('disallowSeatsForThisJourney');
//     let disallowedIdsG;
//     disallowedIdsG = splitter(tmpG);
//     for (const id of disallowedIdsG) {
//         const idel = document.getElementById(id);
//         if(isValid(idel)){
//             idel.style.setProperty('background-color', 'gray');
//         }else{
//             console.log("idel is null");
//         }
//     }
//     console.log('make gray called');
// }
// window.onload = function(){
//     setTimeout(()=>{
//         makeGray();
        
//     },3000);
// };

function makeGray(){
    let dis_ids = genSeat();//other stations seats consider to be disallowed
    clickedSeatOp();
    let path_map_gray = 'mapSeatToStation/'+jouneyDateID+'/'+trainName+'/'+up_down;
    onValue(ref(database,path_map_gray),(snapshot)=>{

        if(snapshot.exists()){
            let obj_map_gray = snapshot.val();
            let keys_map_gray = Object.keys(obj_map_gray);
            let path_trInfo = 'trainInfo/'+trainName+'/'+up_down;

            get(ref(database,path_trInfo)) //getting allocated seats for current station
            .then((snapshot) => {
                if(snapshot.exists()){

                   let obj_trInfo = snapshot.val();
                   let obj_seatInfo = obj_trInfo.seatInfo.lists[fromStationID].seats;
                   let alct_inGray = Object.values(obj_seatInfo);
                    function keyFromVal(myObj,myValue){
                       return Object.keys(myObj).find(key => myObj[key] === myValue);
                    }
                    for(let i_key in keys_map_gray){
                        let st_val = keys_map_gray[i_key];//keys a index dile station pabo

                        if(obj_map_gray[st_val]){

                            if(alct_inGray.includes(st_val) ){
                                let idx_alct = alct_inGray.indexOf(st_val);
                                if(idx_alct>-1){
                                    alct_inGray.splice(idx_alct,1);
                                }
                            }
                        }else{
                            console.log('nai');
                        }
                    }
                    for(let st_dis in dis_ids) {
                        let st_dis_val = dis_ids[st_dis];
                        let dst_id_mp;

                        if (isValid(st_dis_val)) {
                            if (keys_map_gray.includes(st_dis_val)) {
                                dst_id_mp = parseInt(obj_map_gray[st_dis_val].toString().match(/\d+/)[0]);
                                if (fromStationID > dst_id_mp) {
                                    let idx_dis_id = dis_ids.indexOf(st_dis_val);
                                    if (idx_dis_id > -1) {
                                        dis_ids.splice(idx_dis_id, 1);
                                    }
                                }
                            }
                        }
                    }
                    dis_ids = dis_ids.concat(alct_inGray);
                    for(let i_id in dis_ids){
                        let st_id_gray = document.getElementById(dis_ids[i_id]);
                        st_id_gray.style.setProperty('backgroundColor','gray');
                    }
                }

            })
            .catch((error) => {
                // Handle any errors here
                console.error(error);
                console.error('pailam na re');
            });

        }
    });

}

function makeRed(){
    let ss = localStorage.getItem('selected_seats');
    ss = splitter(ss);
    if(ss.length>0){
        for(const idss of ss){
            if(isValid(idss)){
                document.getElementById(idss).classList.toggle('selected');
            }
        }
        
    }

}

setTimeout(makeRed,1000);

callRetrieveData();


document.getElementById('selected_seats').style.display = "none";
if(verifyTime()){
    bookOp();
}else{
    unavailable();
}
console.log('localLen: '+localStorage.length);
if(localStorage.length<15){
    if(localStorage.length<10){
        setTimeout(() => {
            location.reload();
        }, 5000);
    }
    else{
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}
function update_inputs(){
    var iframe = document.getElementById("iframe");
    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    var input1 = innerDoc.getElementById("from-station");
    input1.value = journeyData[0];
    var input2 = innerDoc.getElementById("to-station");
    input2.value = journeyData[1];
}
update_inputs();
function onLoadFn(){
    //console.log('refreshed');
    gotoSearch();
    makeGray();
    setTimeout(()=>{


        try{
            let s = localStorage.getItem('selSeatDropDown');
            let isNull = checkNull(s);
            if(isNull){
                window.scrollTo(0,0);
            }

        }catch (e){
            return
        }
    },3000);
}

setTimeout(()=>{
  document.getElementById('overlay').style.display = "none";
},8000);



window.addEventListener('load',onLoadFn)
window.addEventListener('scroll', scrollPosLive);