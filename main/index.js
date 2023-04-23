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
                    if (trInfoOnce.offDay.toLowerCase() === daysInWeek[dateNow.getDay()+gap].toLowerCase()) {
                        var element = document.querySelector('.content');
                        element.style.display = 'none';//checking if today is off day
                        document.getElementById('containerForAvalaibleTrain').innerText = availableTrains[i] + " Today is OFF";
                        document.getElementById('availableTrainId').innerHTML = "<h2  style='color: red;'>Today is OFF</h2>"
                        let journeyDataIdWet = document.getElementById('journey-data');
                        journeyDataIdWet.innerText += "From: " + journeyData[0] + "\nTo: " + journeyData[1] + "\nDate: " + journeyData[2] + "\n";
                        journeyDataIdWet.innerText += "Today: " + daysInWeek[dateNow.getDay()] + "\n";
                        journeyDataIdWet.innerText += "Depart Time: " + departTimesAr[fromStationID] + "\n";
                        journeyDataIdWet.innerText += "Arrival Time: " + departTimesAr[4] + "\n";
                        journeyDataIdWet.innerText += "Allocated seats: " + localStorage.getItem('cnt_alctseats'+fromStationID.toString()) + "\n";
                    } else {
                        let trainNameCap = availableTrains[i].toString().charAt(0).toUpperCase()+availableTrains[i].toString().slice(1);
                        document.getElementById('containerForAvalaibleTrain').innerText = trainNameCap + " is available today";
                        let journeyDataIdWet = document.getElementById('journey-data');
                        journeyDataIdWet.innerText = "From: " + journeyData[0] + "\nTo: " + journeyData[1] + "\nDate: " + journeyData[2] + "\n";
                        journeyDataIdWet.innerText += "Today: " + daysInWeek[dateNow.getDay()] + "\n";
                        journeyDataIdWet.innerText += "Depart Time: " + departTimesAr[fromStationID] + "\n";
                        journeyDataIdWet.innerText += "Arrival Time: " + departTimesAr[4] + "\n";
                        journeyDataIdWet.innerText += "Allocated seats: " + localStorage.getItem('cnt_alctseats'+fromStationID.toString()) + "\n";
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
    }else if(serial===2){//booked
        onValue(ref(database,path),(snapshot)=>{
            if(snapshot.exists()){
                let tc = snapshot.val();
                localStorage.setItem('booked_seats',tc.booked_seats);
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
            let clickedSeats = localStorage.getItem('selected_seats');
            clickedSeats = splitter(clickedSeats);
            let clickedSeatLength=clickedSeats.length;
            let disallowedIds = localStorage.getItem('disallowSeatsForThisJourney');
            disallowedIds = splitter(disallowedIds);
            if(disallowedIds.includes(this.id)){
                console.log("Not available");
            }else{
                if (clickedSeatLength < 4 || this.classList.contains("selected") ) {
                    //---------------
                    // console.log("Clicked on " + this.id);
                    //-------------
                    this.classList.toggle("selected");
                    const seatNumber = this.querySelector(".seat-number").innerText;
                    
                    if (this.classList.contains("selected")) {
                        clickedSeats.push(seatNumber);
                        this.style.backgroundColor = 'red';
                    } else {
                        clickedSeats = clickedSeats.filter(seat => seat !== seatNumber);
                        this.style.backgroundColor = 'green';
                    }
                    //console.log(`Selected seats: ${selectedSeats.join(", ")}`);
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
                }else{
                    alert('Your Quota for MAX 4 seats is fulfilled');
                }
            }

        });
    }
}
function drop_down_operation(){
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownDiv = document.getElementById('dropdown-div');
    if (localStorage.getItem('selSeatDropDown') === '1') {
        dropdownDiv.style.display = 'block';
    } else {
        dropdownDiv.style.display = 'none';
    }
    dropdownBtn.addEventListener('click', () => {
        if (dropdownDiv.style.display === 'none') {
            var scrollPos = localStorage.getItem('scrollPos');
            localStorage.setItem('selSeatDropDown', '1');
            dropdownDiv.style.display = 'block';
            console.log(scrollPos);
            if (parseInt(scrollPos) > 20) {
                if(parseInt(scrollPos) > 1850){
                    window.scrollTo(0, 0);
                }else{
                    window.scrollTo(0, parseInt(scrollPos));
                }

            }else{
                window.scrollTo(0, 0);
            }
        } else {
            dropdownDiv.style.display = 'none';
            localStorage.setItem('selSeatDropDown', '');
            window.scrollTo(0, 18);
        }
    });
}
function gotoSearch(){
    const myDiv = document.getElementById('iframe');
    myDiv.scrollIntoView({ behavior: 'smooth' });
}
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
function wrtieTrainData(){
    for(let i in availableTrains){
        
            if (localStorage.getItem('offDay') === daysInWeek[dateNow.getDay()].toLowerCase()) {
                var element = document.querySelector('.content');
                element.style.display = 'none';//checking if today is off day
                document.getElementById('containerForAvalaibleTrain').innerText = availableTrains[i] + " Today is OFF";
                document.getElementById('availableTrainId').innerHTML = "<h1 style='color: red'>Today is OFF</h1>"

            } else {
                let trainNameCap = availableTrains[i].toString().charAt(0).toUpperCase()+availableTrains[i].toString().slice(1);
                document.getElementById('containerForAvalaibleTrain').innerText = trainNameCap + " is available today";
            }


        break;
    }


}
function verify() {
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
function bookOp(){
    var bookBtnId = document.getElementById('bookBtn');
    var userJourneyDate = jouneyDateID;
    //booking seat
    bookBtnId.addEventListener('click', function () {
        let clickedSeatsBk = localStorage.getItem('selected_seats');
        clickedSeatsBk = splitter(clickedSeatsBk);

        if (clickedSeatsBk.length>0) {
            if (verify()) {
                document.getElementById('selected_seats').innerText += "\n\nBooked seat " + clickedSeatsBk + " successful";
                let already_booked, tmpalready_booked, new_booked;
                tmpalready_booked = localStorage.getItem('booked_seats');
                tmpalready_booked = splitter(tmpalready_booked);
                //let unavSeat = [];
                // for(let stc in clickedSeatsBk){
                //     if(tmpalready_booked.includes(clickedSeatsBk[stc])){
                //         let idxClc = clickedSeatsBk.indexOf(clickedSeatsBk[stc]);
                //         clickedSeatsBk.splice(idxClc);
                //         unavSeat.push(clickedSeatsBk[stc]);
                //     }
                // }

                //new_booked = already_booked.concat(clickedSeatsBk);
                new_booked = clickedSeatsBk.concat(tmpalready_booked);
                //let isNull = checkNull(tmpalready_booked);
                   // if(!unavSeat.length>0) {}

                        const updates = {
                            booked_seats: new_booked
                        }
                        let userBooked;
                        let user_already_Booked = localStorage.getItem('userBooked');
                        user_already_Booked = splitter(user_already_Booked);
                        userBooked = user_already_Booked.concat(clickedSeatsBk);

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
                        update(ref(database, '/users/' + localStorage.getItem('uidToken')), updatesUser);
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
}
function makeGray(){
    let tmpG;
    tmpG = localStorage.getItem('disallowSeatsForThisJourney');
    let disallowedIdsG;
    disallowedIdsG = splitter(tmpG);
    for (const id of disallowedIdsG) {
        const idel = document.getElementById(id);
        if(isValid(idel)){
            idel.style.setProperty('background-color', 'gray');
        }else{
            console.log("idel is null");
        }
    }
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
        document.getElementById('selected_seats').innerText = "selected seat(s): " + ss.join(", ");
    }

}

setTimeout(makeRed,1000);

if(localStorage.length<15){
    for(let i=1;i<3;i++){
        setTimeout(()=>{
            location.reload();
        },2000);
    }
}
callRetrieveData();
genSeat();
//wrtieTrainData();
clickedSeatOp();
if(verify()){
    bookOp();
}else{
    unavailable();
}
setTimeout(makeGray,2500);

function onLoadFn(){
    //console.log('refreshed');
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



window.onstorage = function(event) {
    if (event.key === 'booked_seats') {
        console.log('localStorage changed');
        setTimeout(makeGray, 1000);
    }
};



window.addEventListener('load',onLoadFn)
window.addEventListener('scroll', scrollPosLive);
