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
const trainName = "train1";


let availableTrains = ['Train1','Train2'];

//============= variables=============
const seatTimeLimit = 120; //seconds
var curPos = "";
var selectedSeatLocal = []; //variable
var bookedSeatsVar = []; //variable
var allocatedSeatsVar = []; //variable
var allocatedSeatsLeftStationVar = [];
var userBookedVar=[]; //variable
var destSeatVar = [];
var extraSeatsVar = [];
var selectedSeatServerVar = {};
let amountOfSeatsVar;
let curPosVar;
let offDayVar;
let fareVar;
let departTimeVar;
let userJourneyDateVar;
let journeyDateId = parseInt(journeyData[2].replace(/-/g,""));
let userMail;
function setUserMail(data){
    userMail = data;
}
function getUsermail(){
    if(isValid(userMail)){
        return userMail;
    }else{
        return "";
    }
}
function setUserBookedFn(data){
    userBookedVar = data;
}
function setCurPosFn(data){
    curPos = data;
}
function setDestSeatFn(data){
    destSeatVar.push(data);
}
function setUserJourneyDateFn(data){
    userJourneyDateVar = data;
}
//============== functions=============

function out(key,val){
    document.getElementById('outputid').innerText = key+" : \n"+val;
}
let scrollValue = 0;
function scrollPosLive() {//when seats can be shown it stores scroll position
    if(isShowClicked){
        scrollValue = window.pageYOffset;
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
function getRandomNumber(min, max) {
    // Generate a random decimal between 0 and 1
    const randomDecimal = Math.random();

    // Scale the random decimal to the desired range (min to max)
    const randomNumber = Math.floor(randomDecimal * (max - min + 1)) + min;

    // Return the random number
    return randomNumber;
}

// // Generate a random number between 1 and 3000
// const randomNumber = getRandomNumber(1, 3000);
// ////////////////console.log("random:"+randomNumber); // Output the random number

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

    //////////////////console.log("dept time:" + departTimeofCrntTrainIn24fmt);
    //////////////////console.log("cur time:" + currentTimeIn24fmt);

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
    //////////////////console.log('ticket can be purchased?: ' + isTicketAvail);
    return isTicketAvail;
}
var myUniqueId = generateUniqueId();
////////////////console.log(myUniqueId);
// Function to download HTML table as PDF




function genSeat(){
    // let alctSeatsInfo = localStorage.getItem('alctseats'+fromStationID);
    // alctSeatsInfo = splitter(alctSeatsInfo);
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
            const idOfThisSeat = document.getElementById(tmpidinloop);
            idOfThisSeat.value = tmpidinloop;
            idOfThisSeat.style.backgroundColor = "gray";
            // if (!(alctSeatsInfo.includes(tmpidinloop))) {//make seats disabled which are not allocated for the current jouney
            //     disallowSeatsForThisJourney.push(tmpidinloop);
            // }
        }
    }
//     localStorage.setItem('disallowSeatsForThisJourney',disallowSeatsForThisJourney) ;
//    return disallowSeatsForThisJourney;
}
var isShowClicked = false;
function hide_container(){
    //here to get email from server 
    // fetchdataonce
    isShowClicked = true;
    setTimeout(() => {
        window.scrollTo(0,scrollValue);
    }, 10);
    let cn_div_id = document.getElementById('containerdiv');
    cn_div_id.style.display = "none";
    document.getElementById('hide').style.display = "none";
    document.getElementById('dropdown-btn').style.display = "block";
    document.getElementById('content').style.display = "block";   
}
function gotoSearch(){
    isShowClicked = false;
    const myDiv = document.getElementById('iframe');
    myDiv.scrollIntoView({ behavior: 'smooth' });
    let cn_div_id = document.getElementById('containerdiv');
    cn_div_id.style.cssText="display: flex;flex-wrap: wrap;align-items: flex-start;align-content: flex-start;";
    document.getElementById('dropdown-btn').style.display = "none";
    document.getElementById('hide').style.display = "block";
    document.getElementById('content').style.display = "none";
    document.getElementById('journey-data').style.whiteSpace = 'pre-line';
    
}
function unavailable(){
    document.getElementById("header").style.display = "none";
    document.getElementById('bookBtn').style.background = 'gray';
    document.getElementById('dropdown-div').style.display = 'none';
    //document.body.innerHTML += "<h1><p align='center'><font color='red'>Train Already Left </font></h2><br><br><br></p>"
    document.getElementById('availableTrainId').innerHTML = "<h1><font color='red'>Train Already Left </font></h2>"
    //document.getElementById('journeydata').style.boxShadow = "box-shadow: 0 0 10px #FF0000";
    localStorage.clear();
    localStorage.setItem('selected_seats','');
    localStorage.setItem('extraseats','');
    //const elements = document.querySelectorAll('.content');

    var element = document.querySelector('.content');
    element.style.display = 'none';
    document.getElementById('hide').disabled = true;
    
}
function unavailableOFFDayFn(){
    document.getElementById("header").style.display = "none";
    document.getElementById('bookBtn').style.background = 'gray';
    document.getElementById('dropdown-div').style.display = 'none';

    var element = document.querySelector('.content');
    element.style.display = 'none';
    document.getElementById('hide').disabled = true;
}
let pathTicketContainer = "ticketContainer/";

function deletePreviousFn(path){
    get(child(dbRef,path)).then((snapshot)=>{
        if(snapshot.exists()){
            
            var dateIds = snapshot.val();
            
            for(const it in dateIds){             
                
                if(parseInt(it) < parseInt(todayDateId())){
                    set(ref(database,path+"/"+it),{
                    })  
                }
            }
        }
    })
}

deletePreviousFn("ticketContainer");
deletePreviousFn("selected_seats");
deletePreviousFn("mapSeatToStation");
deletePreviousFn("extraTickets");


const sN_allocatedSeat = 1;
const sN_bookedSeats = 2;
const sN_bookedSeatsId = 3;
const sN_destinationSeat = 4;
const sN_inforCollect = 5;
const sN_allocatedLeftStation = 6;
const sN_extraSeats = 7;
const sN_selectedSeatServer = 8;
const sN_userMail = 9;
var journeyCombinationFromUrl = journeyData[0]+"to"+journeyData[1];

var journeyCombinationVar = [];
function journeyCombinationFn(data){
    journeyCombinationVar = data;
}
function fetchDataOnce(path,serial) {
    return new Promise((resolve, reject) => {
        get(child(dbRef, path)).then((snapshot) => {
            if (snapshot.exists()) {
                //////////////////console.log(snapshot.val());
                if(serial == 1){//allocated Seat comment
                    setAllocatedSeatsValFn(snapshot.val().seats);
                    amountOfSeatsVar = snapshot.val().length;
                    resolve(); // Resolve the promise when the operation is completed
                }
                else if(serial == 2){//booked seats comment
                    setBookSeatsValFn(snapshot.val());
                    ////////////////console.log("alkfjlskjfl;ak: "+typeof(snapshot.val()));
                    let tp = snapshot.val();
                    let utp = [... new Set(tp)];
                    utp.sort();
                    resolve(); // Resolve the promise when the operation is completed
                }
                else if(serial == 3){//booked seats id
                    setUserBookedFn(snapshot.val().userBooked);
                    setUserJourneyDateFn(snapshot.val().userJourneyDate);
                    resolve(); // Resolve the promise when the operation is completed
                }
                else if (serial == 4){//destination station
                    var obj = snapshot.val();
                    const stidNow = parseInt(journeyData[0].match(/\d+/));//stidNow --> from which station passenger goes
                    //////////////////console.log(typeof(stidNow));
                    for(const it in obj){
                        var stidbooked = parseInt(obj[it].match(/\d+/));//stidbooked--> stationId of booked seat. the seat contain which station
                        
                        if(isUp){
                            if(stidNow>=stidbooked){
                                setDestSeatFn(it);
                            }
                        }else{
                            if(stidNow<=stidbooked){
                                setDestSeatFn(it);
                            }
                        }

                    }
                    resolve();
                }   
                else if(serial == 5){ //info collect
                
                    curPosVar = snapshot.val().currentPos;
                    fareVar = snapshot.val().fare;
                    offDayVar = snapshot.val().offDay;
                    departTimeVar = snapshot.val().departTime;
                    journeyCombinationVar = snapshot.val().jourNeyCombination;
                                        
                    resolve();                
                
                }   
                else if(serial == 6){//allocated Seat of left station
                
                setAllocatedSeatsLeftStationFn(snapshot.val().seats);
                resolve(); // Resolve the promise when the operation is completed
                } 
                else if(serial == 7){//extra Seat of train position
                setExtraSeatsFn(snapshot.val());
                resolve(); // Resolve the promise when the operation is completed
                }
                else if(serial == 8){//selected seat server
                setSelectedSeatServerFn(snapshot.val());
                resolve(); // Resolve the promise when the operation is completed
                }else if(serial == 9){
                    setUserMail(snapshot.val().email);
                }
            }else {
                //console.error("snapshot not exists for serial: "+serial);
                if(serial == 8){
                    selectedSeatServerVar = {};
                }
                if(serial == 3){
                    userBookedVar = [];
                }
                if(serial == 7){
                    extraSeatsVar = [];
                }
                resolve(); // Resolve the promise even if no data is available
            }
        }).catch((error) => {
            //console.error(error);
            reject(error); // Reject the promise if an error occurs
        });
    });
}
let fareUnitVar="unavailable";
function setFareUnitVarFn(data){
    fareUnitVar = data;
}
function getFareUnitVarFn(){
    return fareUnitVar;
}
let pathToShow = 'trainInfo/'+trainName+'/'+up_down;
fetchDataOnce(pathToShow,5) //trainInfo
    .then(()=>{
        
        //////////////////console.log("position: "+curPosVar);
        ////////////////console.log("OffDay: "+offDayVar);
        ////////////////console.log("Fare: " +fareVar);

        let jd = parseInt(journeyData[2].split('-')[2]);
                let gap = jd - dateNow.getDate();
                let journeyDateId = parseInt(journeyData[2].replace(/-/g,""));
                let journey_idx = dateNow.getDay()+journeyDateId-parseInt(todayDateId());

                if(journey_idx>6){journey_idx -=7;}
                ////////////////console.log('ji: '+journey_idx);
                
                if (offDayVar.toLowerCase() === daysInWeek[journey_idx].toLowerCase()) {                                                                           
                    var element = document.querySelector('.content');
                    element.style.display = 'none';//checking if today is off day
                    document.getElementById('availableTrainId').innerHTML = "<h1  style='color: red;'>Today is OFF</h1>";
                    document.getElementById('containerForAvalaibleTrain').innerText = availableTrains[0];
                    document.getElementById('journey-data').style = 'box-shadow: 0 0 10px #cf1212;';
                    //document.getElementById('availableTrainId').innerText = "Today is OFF";
                    let journeyDataIdWet = document.getElementById('journey-data');
                    journeyDataIdWet.innerHTML = "From: " + journeyData[0] + "<br>To: " + journeyData[1] + "\nDate: " + journeyData[2] + "<br>";
                    let offday_n = daysInWeek[journey_idx].toUpperCase();
                    journeyDataIdWet.innerHTML += "OFF Day: <i><u>" + offday_n + "</u></i><br>";
                    journeyDataIdWet.innerHTML += "Depart Time: " + departTimeVar[fromStationID] + "<br>";
                    journeyDataIdWet.innerHTML += "Arrival Time: " + departTimeVar[4] + "<br>";
                    //journeyDataIdWet.innerText += "Allocated seats: " + allocatedSeatsVar + "\n";
                    unavailableOFFDayFn();
                } else {
                    let trainNameCap = availableTrains[0].toString().charAt(0).toUpperCase()+availableTrains[0].toString().slice(1);                            
                    document.getElementById('containerForAvalaibleTrain').innerHTML = trainNameCap;
                    let journeyDataIdWet = document.getElementById('journey-data');
                    journeyDataIdWet.innerHTML = "From: " + journeyData[0] + "<br>To: " + journeyData[1] + "\nDate: " + journeyData[2] + "<br>";
                    journeyDataIdWet.innerHTML += "Today: " + daysInWeek[journey_idx] + "<br>";
                    journeyDataIdWet.innerHTML += "Depart Time: " + departTimeVar[fromStationID] + "<br>";
                    journeyDataIdWet.innerHTML += "Arrival Time: " + departTimeVar[4] + "<br>";
                    
                    fetchDataOnce("trainInfo/"+trainName+"/"+up_down,sN_inforCollect)
                    .then(()=>{
                        // for(const it in journeyCombinationVar){
                        //     if(journeyCombinationVar[it] == journeyCombinationFromUrl){
                        //         setFareUnitVarFn(fareVar[it]);
                        //         break;
                        //     }
                        // }
                        setFareUnitVarFn(fareVar[toStationID-fromStationID-1]);
                        journeyDataIdWet.innerHTML += "Fare(unit): <font style= color:red;> BDT " + getFareUnitVarFn() + "</font><br>";
                        
                    })                   


                    let pathGetRangeOfAlctSeats = "trainInfo/"+trainName+"/"+up_down+"/seatInfo/lists/"+fromStationID+"/";                  

                    fetchDataOnce(pathGetRangeOfAlctSeats,1)
                        .then(()=>{
                            let range_alct_st = allocatedSeatsVar;
                            //alert(allocatedSeatsVar);
                            let len_range_alct_st;
                            if(isValid(range_alct_st)){
                                //range_alct_st = splitter(range_alct_st);
                                    len_range_alct_st = range_alct_st.length;
                            }else{
                                range_alct_st = [];
                            }
                            journeyDataIdWet.innerHTML += "Allocated seats: " + amountOfSeatsVar.toString() +"<p align='center'>("+range_alct_st[0]+" --> "+range_alct_st[(len_range_alct_st-1)] +")</p>";
                    
                        })
                        
                    
                    
                }

            })
    .catch((error)=>{

    })
    function clickCancelBtnFn(){
        document.getElementById('confirmation_popup').style.display = "none";
        document.getElementById('header').style.display = "block";
        document.getElementById('content').style.display = "block";
        
    }
    function setSelectedSeatLocalFn(data){
        selectedSeatLocal = data;
    }
    function getSelectedSeatLocalFn(){
        return selectedSeatLocal;
    }
function confirmation_popup(remTimeForBooking){
    
    let conf_popup_id = document.getElementById('confirmation_text');
    
        function remCheck(){
            if(remTimeForBooking<=0){
                clearInterval(interValId);
                for(const it in selectedSeatLocal){
                    document.getElementById(selectedSeatLocal[it]).style.backgroundColor = "green";
                    document.getElementById(selectedSeatLocal[it]).style.color = "black";                 
                }
                makeGreenSelectedSeatLocalFn()
                    .then(()=>{
                        setSelectedSeatLocalFn([]);
                    })
                
                clickCancelBtnFn();
                return remTimeForBooking;
            }
            conf_popup_id.innerHTML = "<h1 id='heading_ct'><u>Booking Confirmation</u></h1><h2 align='center' style='color:blue;'>Remaining Time: "+Math.floor(remTimeForBooking/1000)+" seconds </h1>";
            document.getElementById('table').innerHTML="<tr><th>Passenger</th><td>"+getUsermail()+"</td></tr><tr>"+"<th>From</th><td>"+journeyData[0]+"</td></tr><tr><th>To</th><td>"+journeyData[1]+"</td></tr><tr><th>Date of Journey</th><td style='font-weight: bold'>"+journeyData[2]+"</td></tr><tr><th>Seat(s)</th><td>"+selectedSeatLocal+"</td></tr><tr><th>Total Fare </th><td>BDT "+selectedSeatLocal.length*getFareUnitVarFn()+"</td></tr>";
            remTimeForBooking -= 1000;     
        }
        const interValId = setInterval(remCheck,1000);
        
    
    }
function makeGreenSelectedSeatLocalFn(){
    return new Promise ((resolve,reject)=>{
        let tmpSelectedSeatLocal = getSelectedSeatLocalFn();
        for(var it in tmpSelectedSeatLocal){

            document.getElementById(tmpSelectedSeatLocal[it]).style.backgroundColor = "green";
            document.getElementById(tmpSelectedSeatLocal[it]).style.color = "black";

            if(document.getElementById(tmpSelectedSeatLocal[it]).style.backgroundColor != "green" &&
                document.getElementById(tmpSelectedSeatLocal[it]).style.color != "black"){
                    makeGreenSelectedSeatLocalFn();  
            }
        }   
        resolve(); 
    })
    
}
document.getElementById('hide').addEventListener('click',hide_container);
document.getElementById('dropdown-btn').addEventListener('click',gotoSearch);
document.getElementById('bookBtn').addEventListener('click',()=>{
    let pathUsersVar = "users/"+sessionStorage.getItem('uidToken');
    fetchDataOnce(pathUsersVar,sN_userMail);
    if(selectedSeatLocal.length>0){
        var dnow = new Date();
        var  nowTime = dnow.getTime();
        var min = parseInt(nowTime); //maxtime
        var remTimeForBooking=9999;
        function operationStart(){
            return new Promise((resolve,reject)=>{
                
                for(const it in selectedSeatLocal){
                    if(selectedSeatServerVar[selectedSeatLocal[it]]){
                        if(selectedSeatServerVar[selectedSeatLocal[it]]<min){
                            min =parseInt(selectedSeatServerVar[selectedSeatLocal[it]]);
                        }
                    }        
                }
                remTimeForBooking = seatTimeLimit*1000 - (nowTime - min)+1000;
                resolve();
            })
        }
        operationStart()
            .then(()=>{
                if(seatTimeLimit*1000 >= remTimeForBooking && remTimeForBooking>0 ){
                    remTimeForBooking = confirmation_popup(remTimeForBooking);
                }else{
                    alert('Time is up. select new!');
                    makeGreenSelectedSeatLocalFn()
                        .then(()=>{
                            setSelectedSeatLocalFn([]);
                        })
                    
                    return;
                }
                
                document.getElementById('confirmation_popup').style.display = "block";
                document.getElementById('content').style.display = "none";
                document.getElementById('header').style.display = "none";
            })
            
        
    }else{
        alert('Select at least one seat');
    }
});

document.getElementById('cancel_btn').addEventListener('click',()=>{
    clickCancelBtnFn();      
});

document.getElementById('confirm_btn').addEventListener('click',()=>{
    
    document.getElementById('confirmation_popup').style.display = "none";
        var userJourneyDate = jouneyDateID;
        let clickedSeatsBk = selectedSeatLocal;
        // for(let clc_st in clickedSeatsBk){
        //     let path_clc_st = 'selected_seats/'+jouneyDateID+'/'+trainName+'/'+up_down+'/'+clickedSeatsBk[clc_st];
        //     set(ref(database,path_clc_st),{

        //     });
        // }
        
        if (selectedSeatLocal.length>0) {
            if (verifyTime()) {
                document.getElementById('selected_seats').innerText += "\n\nBooked seat " + selectedSeatLocal + " successful";
                let already_booked, tmpalready_booked, new_booked;
                tmpalready_booked = bookedSeatsVar;

                let bookable_seats = selectedSeatLocal;
                    if(isValid(new_booked)){
                        new_booked = bookable_seats.concat(tmpalready_booked);
                    }else{
                        new_booked = selectedSeatLocal;
                    }
                    new_booked = bookedSeatsVar.concat(selectedSeatLocal);
                    const updates = {
                        booked_seats: new_booked
                    }
                    let userBooked;

                    //let user_already_Booked = localStorage.getItem('userBooked');
                    let user_already_Booked = userBookedVar;
                    //////////////////console.log("user already booked: "+ user_already_Booked);
                    
                    if(isValid(user_already_Booked)){
                        userBooked = user_already_Booked.concat(bookable_seats);
                    }else{
                        userBooked = null;
                    }
                    if(userJourneyDate<userJourneyDateVar){
                        userJourneyDate = userJourneyDateVar;
                    }
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
            location.reload();
        }
});


function makeGrayBookedSeats(){
    var uniqueBookedSeats = [... new Set(bookedSeatsVar)];
    
    for(const it in uniqueBookedSeats){
        const idSt = document.getElementById(uniqueBookedSeats[it]);
        idSt.style.backgroundColor = "gray";
    }
}
function makeGreenExtraSeats(){
    for(const it in extraSeatsVar){
        const idSt = document.getElementById(extraSeatsVar[it]);
        idSt.style.backgroundColor = "green";
    }
}
function makeGreenSingleFn(thisId){
    document.getElementById(thisId).backgroundColor = "green";
    document.getElementById(thisId).color = "black";
}
function makeGreenAlct(){
    for(const it in allocatedSeatsVar){
        const idSt = document.getElementById(allocatedSeatsVar[it]);
        idSt.style.backgroundColor = "green";
    }    
}
function makeYellow(thisId){
    document.getElementById(thisId).style.backgroundColor = "yellow";
    document.getElementById(thisId).style.color = "black";
}
function makeYellowAllSelectedSeatsFn(){
    for(const it in selectedSeatServerVar){
        const idSt = document.getElementById(selectedSeatServerVar[it]);
        if(!(selectedSeatLocal.includes(idSt))){
            idSt.style.backgroundColor = "yellow";
        }
    } 
}
function printSel(){
    //////////////////console.log(selectedSeatServerVar);
}

//---------- getter-setter --------------------
function setBookSeatsValFn(data){
    bookedSeatsVar = data;
}
function setAllocatedSeatsValFn(data){
    allocatedSeatsVar = data;
}
function setAllocatedSeatsLeftStationFn(data){
    allocatedSeatsLeftStationVar = data;
}
function setExtraSeatsFn(data){
    extraSeatsVar = data;
}
function setSelectedSeatServerFn(data){
    ////////////////////console.log("typeOfSelected: "+typeof(data));
    selectedSeatServerVar = data;
}

//------------------------------
function updateSelectedSeatServerFn(){ 
    return new Promise((resolve,reject)=>{
        let objecta = {"tmp": 44};
        let updateSelectedSeatServer = {
            [up_down]: selectedSeatServerVar,
        }  
        ////////////////////console.log(selectedSeatServerVar);    
        let pathUpdateSelectedSeatsVar = "selected_seats/"+jouneyDateID+"/"+trainName+"/";
        update(ref(database, pathUpdateSelectedSeatsVar), updateSelectedSeatServer)
            .then(()=>{
                resolve();
            })
            .catch((error)=>{
                //console.error(error);
                reject(error);
            })
        
    }) 
    
    
}
function deSelectOperationFn(seatValue){
    var idxSelectedSeatLocal = selectedSeatLocal.indexOf(seatValue);
    if(idxSelectedSeatLocal != -1){
        selectedSeatLocal.splice(idxSelectedSeatLocal,1);
    }else{
        //console.error("cant delete selectedSeatLocal value");
        //alert("cant delete selectedSeatLocal value");
    }
}
function makeRedSingleSeat(thisId){
    return new Promise((resolve,reject)=>{
        thisId.style.backgroundColor = "red";
        thisId.style.color = "white";
        if(thisId.style.backgroundColor != "red" || thisId.style.color != "white"){
            makeGrayBookedSeats(thisId);
        }else{
            resolve(1);
        }
    })
    
}
function selectedSeatOp(){
    const allSeats = document.querySelectorAll(".seat");
    for (let i = 0; i < allSeats.length; i++) {
        allSeats[i].addEventListener("click", function () {      
        startOverlay();         
        const computedStyle = window.getComputedStyle(allSeats[i]);
        const color = computedStyle.getPropertyValue('background-color');
        //////////////////console.log(color);
        const isGray = color === 'rgb(128, 128, 128)';
        const isRed = color === 'rgb(255, 0, 0)';
        const isGreen = color === 'rgb(0, 128, 0)';
        const isYellow = color === 'rgb(255, 255, 0)';
        
        
        if(isGray){
            ////////////////console.log("unavailable");
        }else if(isRed){
            
            
            deSelectOperationFn(allSeats[i].value);
            
            //fetchDataOnce("selected_seats/"+jouneyDateID+"/"+trainName+"/"+up_down,8);
            if(selectedSeatServerVar[this.id]){
                delete selectedSeatServerVar[this.id];
                updateSelectedSeatServerFn()
                    .then(()=>{
                        allSeats[i].style.backgroundColor = "green";
                        allSeats[i].style.color = "black";
                        ////////////////console.log("selectedSeats: "+selectedSeatLocal);
                        
                    })
                    .catch((error)=>{
                        //console.error(error);
                    })
            }
        }else if(isYellow){
            document.getElementById(this.id).style.backgroundColor = "green";
            document.getElementById(this.id).style.color = "black";
            ////////////////console.log("wait for sometime");
            deSelectOperationFn(allSeats[i].value);

            //deSelectOperationFn(allSeats[i].value);            
            //fetchDataOnce("selected_seats/"+jouneyDateID+"/"+trainName+"/"+up_down,8);
        }
        else if (isGreen){   

            if(!isValid(userBookedVar)){
                userBookedVar = [];
            }
            let remSeat = 4-(selectedSeatLocal.length+userBookedVar.length);
            if(remSeat || 1){
                
                //////////////////console.log("remaining seat: "+(4-(selectedSeatLocal.length+userBookedVar.length)));
                
                let pathSelectedSeatsVar = "selected_seats/"+jouneyDateID+"/"+trainName+"/"+up_down;
                ////console.error(pathSelectedSeatsVar);
                let randomNumNow = getRandomNumber(1,3000);
                //alert(randomNumNow);
                                    function blinkButton() {
                                        const button = document.getElementById(allSeats[i].value);
                                        let isVisible = true;
                                        const intervalId = setInterval(() => {
                                            button.style.visibility = isVisible ? 'hidden' : 'visible';
                                            isVisible = !isVisible;
                                        }, 500); // Toggle every 500 milliseconds (half a second)
                                    
                                        
                                        setTimeout(() => {
                                            clearInterval(intervalId);
                                            button.style.visibility = 'visible'; // Ensure button is visible
                                        }, randomNumNow); // 3 seconds
                                    }
                                    
                                    // Call the function to start blinking the button
                                    blinkButton();
                
                setTimeout(() => {
                    fetchDataOnce(pathSelectedSeatsVar,8)
                    .then(()=>{ 

                        if(!(selectedSeatServerVar[this.id])){ // this seat is missing in server
                            
                                var d = new Date();   
                                selectedSeatServerVar[this.id] = d.getTime();                              
                                                   
                            updateSelectedSeatServerFn()
                                .then(()=>{
                                    const prevTimeStamp = selectedSeatServerVar[this.id];
                                    fetchDataOnce(pathSelectedSeatsVar,8)
                                        .then(()=>{
                                            const postTimeStamp = selectedSeatServerVar[this.id];
                                            if(prevTimeStamp == postTimeStamp){
                                                //makeRed from Green
                                                makeRedSingleSeat(allSeats[i])
                                                    .then((resVal)=>{
                                                        
                                                        selectedSeatLocal.push(allSeats[i].value);
                                                        ////////////////console.log("selectedSeats: "+selectedSeatLocal);
                                                        
                                                        ////////////////console.log(randomNumNow);
                                                    })                           
                                                
                                                
                                            }else{
                                                makeYellow(allSeats[i].value);
                                            }
                                        })
                                    
                                    //alert(selectedSeatServerVar[this.id]);
                                })
                                .catch((error)=>{
                                    alert(error);
                                })
                            
                        }else{// this seat is clicked by someone
                            var d = new Date();
                            var gapTime = (d.getTime() - selectedSeatServerVar[this.id])/1000;
                            ////////////////console.log(gapTime);
                            if(gapTime > seatTimeLimit){
                                delete selectedSeatServerVar[this.id]; 
                                //alert('clicked by someone');                        
                                updateSelectedSeatServerFn();    
                                document.getElementById(this.id).click();                           
                                              
                            }else{
                                makeYellow(allSeats[i].value);
                            }
                            
                            
                        }
                        
                    })
                    .catch((error)=>{
                        //console.error("selectedSeat Error: "+error);
                    })
                }, randomNumNow);
                
                

            }else{
                alert("Your Quota is Fulfilled");
            }
        }
        
    
        stopOverlay();
    });
}
}

let path_allocatedSeats = "trainInfo/train1/up/seatInfo/lists/"+fromStationID;//variable
fetchDataOnce(path_allocatedSeats,1)
    .then(()=>{
        ////////////////console.log("allocated seats fetched successful");
        ////////////////console.log("Seat Amount: "+amountOfSeatsVar);
        makeGreenAlct();
    })
    .catch((error)=>{
        //console.error("allocated seat error: "+error);
    });


let path_bookedSeats = "ticketContainer/"+jouneyDateID+"/"+trainName+"/"+up_down+"/booked_seats"; //variable
fetchDataOnce(path_bookedSeats,2)
    .then(()=>{
        ////////////////console.log("booked seats fetched successful");
        makeGrayBookedSeats();
    })
    .catch((error)=>{
        //console.error("allocated seat error: "+error);
    });
function makeGraySingleSeatFn(thisId){
    document.getElementById(thisId).style.color = "black";
    document.getElementById(thisId).style.backgroundColor = "gray";
}
onValue(ref(database,path_bookedSeats),(snapshot)=>{
    if(snapshot.exists()){
        bookedSeatsVar = snapshot.val();
        ////////////////console.log("booked seats fetched successful onValue");
        //setBookSeatsValFn(snapshot.val());
        fetchDataOnce(pathForCurPos,5)
            .then(()=>{//get train position
                if(curPosVar >= 0){
                    //get extra seat
                    fetchDataOnce(pathForExtraSeats,7)
                        .then(()=>{
                            for(const it in extraSeatsVar){
                                if(bookedSeatsVar.includes(extraSeatsVar[it])){
                                    makeGraySingleSeatFn(extraSeatsVar[it]);
                                }
                            }
                        });
                }
            })
        makeGrayBookedSeats();
    }
});
let pathUserBooked = "users/"+sessionStorage.getItem("uidToken");
    //////////////////console.log(pathUserBooked);
    fetchDataOnce(pathUserBooked,3)
        .then(()=>{
            ////////////////console.log("userBookedFetched sucess");
            ////////////////console.log("user already booked: "+ userBookedVar);
            if( todayDateId() > userJourneyDateVar){
                var updateData = {
                    userBooked : null
                }
                update(ref(database, pathUserBooked), updateData);
            }
        })
        .catch((error)=>{
            //console.error("userBookedError: "+error);
        })
        
genSeat();
selectedSeatOp();
function stopOverlay(){
    setTimeout(()=>{
        document.getElementById('overlay').style.display = "none";
      },3000);
}
function startOverlay(){
    
    document.getElementById('overlay').style.display = "block";
      
}

stopOverlay();

let pathStDest = "mapSeatToStation/"+jouneyDateID+"/"+trainName+"/"+up_down;
fetchDataOnce(pathStDest,4)
    .then(()=>{
        
        for(const it in destSeatVar){
            const idGreen = document.getElementById(destSeatVar[it]);
            idGreen.style.backgroundColor = "green";
        }
        ////////////////console.log("destinationSeat green fetched succesful");
    })
    .catch((error)=>{
        ////////////////console.log("problem during destination seat feting: "+error);
    })
onValue(ref(database,pathStDest),(snapshot)=>{
    if(snapshot.exists()){
        var obj = snapshot.val();
        for(const it in obj){
            var stidbooked = parseInt(obj[it].match(/\d+/));//stidbooked--> stationId of booked seat. the seat contain which station
            var stidNow = parseInt(journeyData[0].match(/\d+/));//stidNow --> from which station passenger goes

            if(isUp){
                if(stidNow>=stidbooked){
                    var idGreen = document.getElementById(it);
                    idGreen.style.backgroundColor = "green";
                }
            }
        }
    }
});
let pathForCurPos = "trainInfo/"+trainName+"/"+up_down;
var currentPositionUpdateVar = -1;
var totalStationVar = 5;

let pathForExtraSeats = "extraTickets/"+todayDateId()+"/"+trainName+"/"+up_down+"/extraseats";

fetchDataOnce
onValue(ref(database,pathForCurPos),(snapshot)=>{
    if(snapshot.exists()){
        
        curPosVar = snapshot.val().currentPos;
        let pathForLeftAllocated = "trainInfo/"+trainName+"/"+up_down+"/seatInfo/lists/"+(curPosVar);
        ////////////////console.log("TrainPosition: "+curPosVar);        
        currentPositionUpdateVar++;
        //console.error("currentPositionUpdate: "+currentPositionUpdateVar);
        // after train left
                
        fetchDataOnce(pathForExtraSeats,7)
            .then(()=>{
                //////////////////console.log("extraSeats: "+extraSeatsVar);
                
                fetchDataOnce(pathForLeftAllocated,6)
                    .then(()=>{
                        //////////////////console.log("leftAllocation: "+allocatedSeatsLeftStationVar);
                        //////////////////console.log("booked: "+bookedSeatsVar);
                        ////////////////console.log("curpos: "+curPosVar+"->"+allocatedSeatsLeftStationVar);
                        
                        let tmpExtraSeats = [];
                        for(var it in allocatedSeatsLeftStationVar){
                            if(!(bookedSeatsVar.includes(allocatedSeatsLeftStationVar[it]))){
                                tmpExtraSeats.push(allocatedSeatsLeftStationVar[it]);
                            }
                        }
                        if(isValid(extraSeatsVar)){
                            extraSeatsVar = extraSeatsVar.concat(tmpExtraSeats);
                        }else{
                            extraSeatsVar = tmpExtraSeats;
                        }
                        
                        //////////////////console.log("ExtraSeats: "+extraSeatsVar);
                        ////////////////console.log("type:"+typeof(extraSeatsVar));

                        //update extra seats
                        let pathForUpdateExtraSeats = "extraTickets/"+todayDateId()+"/"+trainName+"/"+up_down;
                        var updateExtra = {
                            extraseats:extraSeatsVar
                        }
                        if(curPosVar == totalStationVar-2){
                            ////////////////console.log("Unsold Seats: "+extraSeatsVar);
                        }
                        if(curPosVar == -1 || curPosVar >=totalStationVar-1){
                             updateExtra = {
                                extraseats: null
                            }
                        }
                        makeGreenExtraSeats();
                        //this portion is for server or authorized to server
                        if(currentPositionUpdateVar){ //enters only when train change its position
                            update(ref(database, pathForUpdateExtraSeats), updateExtra);
                        }
                        

                    })
                    .catch((error)=>{

                    })
            })
            .catch((error)=>{
                //console.error("extraSeats Error: "+error);
            })

        if(todayDateId()===jouneyDateID){
            if(fromStationID<=curPosVar){
                var element = document.querySelector('.content');
                element.style.display = 'none';//checking if today is off day
                unavailable();               
            }else{
                if(curPosVar>=0 && curPosVar<snapshot.val().stations.length){
                    ////////////////console.log(snapshot.val().stations);
                    document.getElementById('left_station').innerText = "Left from : "+snapshot.val().stations[curPosVar];
                    document.getElementById('left_station').style.setProperty("font-size","27px");
                    document.getElementById('left_station').style.setProperty("background-color","red");
                    document.getElementById('left_station').style.setProperty("color","white");
                    document.getElementById('left_station').style.setProperty("position","fixed");
                    document.getElementById('left_station').style.setProperty("left","0");
                    document.getElementById('left_station').style.setProperty("padding-right","2px");
                    document.getElementById('left_station').style.setProperty("border","1px solid black");
                    document.getElementById('left_station').style.setProperty("width","28vw");
                    //document.getElementById('left_station').style.setProperty("animation","blink 5s infinite");

                    
                }else if(parseInt(curPosVar) === snapshot.val().stations.length){
                    document.getElementById('left_station').innerText = "Train Reached its destination";
                }else{
                    document.getElementById('left_station').innerText = "Journey hasn\'t started yet";
                }
            }
        }
    }
});


let pathUpdateSelectedSeatsOnValueVar = "selected_seats/"+jouneyDateID+"/"+trainName+"/"+up_down;

var cnt = -1;
function takeActionFn(it){
    return new Promise((resolve,reject)=>{
        document.getElementById(it).style.backgroundColor = "green";
        document.getElementById(it).style.color = "black";
        if(document.getElementById(it).style.backgroundColor == "green" && document.getElementById.style.color == "black"){
            resolve();
        }
    });
}
var c = -1;
onValue(ref(database,pathUpdateSelectedSeatsOnValueVar),(snapshot)=>{
    if(snapshot.exists()){
        selectedSeatServerVar = snapshot.val();
    }else{
        selectedSeatServerVar = {};
    }
    for(const it in selectedSeatLocal){
        if(!selectedSeatServerVar[selectedSeatLocal[it]]){
            
            ////////////////console.log("onValue Selected Seat:\n"+selectedSeatLocal[it]);
            document.getElementById(selectedSeatLocal[it]).style.backgroundColor = "green";
            document.getElementById(selectedSeatLocal[it]).style.color = "black";
            deSelectOperationFn(selectedSeatLocal[it]);
        }
    }
    
})
// function seatTimer(){
//     fetchDataOnce(pathUpdateSelectedSeatsOnValueVar,8)
//     .then(()=>{
//         cnt++;
//         ////////////////console.log("count: "+cnt);
//         var d = new Date();
//         //var gap = (d.getTime() - selectedSeatServerVar["A-19"])/(1000);
//         for(var it in selectedSeatServerVar){
//             var gap = (d.getTime() - selectedSeatServerVar[it])/(1000);
//             if(gap > 20){
//                 takeActionFn(it)
//                     .then(()=>{
//                         delete selectedSeatServerVar[it];
//                         deSelectOperationFn(it);
//                         updateSelectedSeatServerFn();
//                     }) 
//                     .catch((error)=>{
//                         //console.error("colorChange Error: "+error);
//                     })              
//             }
//         }
        
        
//     })
//     .catch((error)=>{
//         //console.error("continuousSeatServer error: "+error);
//     })
// }

// setInterval(seatTimer,20000);


if(journeyDateId < todayDateId()){
    gotoSearch();
    unavailable();
}
gotoSearch();
window.addEventListener('scroll', scrollPosLive);



