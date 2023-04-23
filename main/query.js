window.addEventListener('load', checkAuth); //authenticity checking
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-analytics.js";
import { getDatabase, ref, set, get, child, onValue} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAT-MEaTjJP_LdDtWsrTQSVDdcgBIw7vNI",
  authDomain: "webtrain-3a2cf.firebaseapp.com",
  databaseURL: "https://webtrain-3a2cf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webtrain-3a2cf",
  storageBucket: "webtrain-3a2cf.appspot.com",
  messagingSenderId: "1019671179590",
  appId: "1:1019671179590:web:b0ff8a84baa2549a6cf547",
  measurementId: "G-8XNC10VJGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


function logout(){
  localStorage.clear();
  sessionStorage.clear();
  try{
    parent.location.href = 'login.html'
  }catch(e){
    window.location.href = 'login.html';
  }
}
function checkAuth() {
  // Check if the token exists in localStorage
  const tokenLocal = sessionStorage.getItem('myAppToken');
  const uidLocal = sessionStorage.getItem('uidToken');
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/${uidLocal}`)).then((snapshot) => {
    if (snapshot.exists()) {
      var x = snapshot.val().token;
      if(tokenLocal !== x){
         alert('token mismatch');
        logout();
      }
    }else{
      logout();
    }
  }).catch((error) => {
    console.error(error);
  });
} 
//----------------------------------------------------------




// Define an array of stations for autocomplete suggestions
const suggestions = ['station1', 'station2', 'station3', 'station4', 'station5'];

const fromInputID = document.getElementById('from-station');
const suggestionsDivFromID = document.getElementById('dropdown-list1');
const toInputID = document.getElementById('to-station');
const suggestionsDivToID = document.getElementById('dropdown-list2');
const logoutbtnID = document.getElementById('logout');




logoutbtnID.addEventListener('click',function(){
  //localStorage.removeItem("myAppToken");
  logout();
});
function suggestionFun(inputField,dropdownList,suggestions){
  // Event listener for keyup events on the input field
  inputField.addEventListener("keyup", function() {
    // Clear the existing dropdown list
    dropdownList.innerHTML = "";

    // Get the current value of the input field
    var inputValue = inputField.value.toLowerCase();

    // Filter the list of suggestions based on the input value
    var filteredSuggestions = suggestions.filter(function(suggestion) {
      return suggestion.toLowerCase().indexOf(inputValue) === 0;
    });

    // Add the filtered suggestions to the dropdown list
    filteredSuggestions.forEach(function(suggestion) {
      var li = document.createElement("li");
      li.textContent = suggestion;
      li.addEventListener("click", function() {
        // Set the value of the input field to the selected suggestion
        inputField.value = suggestion;
        // Clear the dropdown list
        dropdownList.innerHTML = "";
      });
      dropdownList.appendChild(li);
    });

    // Show or hide the dropdown list based on whether there are any suggestions
    if (filteredSuggestions.length > 0) {
      dropdownList.style.display = "block";
    } else {
      dropdownList.style.display = "none";
    }
  });

  // Event listener for click events outside the input field and dropdown list
  document.addEventListener("click", function(event) {
    if (event.target !== inputField && event.target !== dropdownList) {
      dropdownList.style.display = "none";
    }
  });
}
suggestionFun(fromInputID,suggestionsDivFromID,suggestions);
suggestionFun(toInputID,suggestionsDivToID,suggestions);
//==============


// Get references to the form and its fields
const form = document.querySelector('form');
const fromStationField = form.querySelector('#from-station');
const toStationField = form.querySelector('#to-station');
const journeyDateField = form.querySelector('#journey-date');

const searchTrainId = document.getElementById('searchTrainbtnid');
// Enable journey date for the upcoming 5 days
const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 5);
//journeyDateField.setAttribute('min', today.toISOString().split('T')[0]);
journeyDateField.setAttribute('min', today.getFullYear().toString()+(today.getMonth()+1).toString()+today.getDate().toString());
//journeyDateField.setAttribute('max', maxDate.toISOString().split('T')[0]);
journeyDateField.setAttribute('max', maxDate.getFullYear().toString()+(maxDate.getMonth()+1).toString()+(maxDate.getDate()+5).toString());




// Get today's date and format it as yyyy-mm-dd
let todaysdate = new Date().toISOString().substr(0, 10);
document.getElementById("journey-date").value = todaysdate;


// Add form submission event listener
form.addEventListener('submit', (event) => {
  event.preventDefault();
  
  // Validate that from-station and to-station fields are different
  if (fromStationField.value.toLowerCase() === toStationField.value.toLowerCase()) {
    alert('From Station and To Station must be different.');
    return;
  }
  
  // Validate that all fields are filled out
  const fields = [fromStationField, toStationField, journeyDateField];
  let isFormValid = true;
  fields.forEach((field) => {
    if (!field.value) {
      field.classList.add('error');
      isFormValid = false;
    } else {
      field.classList.remove('error');
    }
  });
  
  // If the form is valid, redirect to Bing search with the form data as search parameters
  if (isFormValid) {
    // const searchParams = new URLSearchParams({
    //   // q: `${fromStationField.value}to${toStationField.value}on${journeyDateField.value}`,
    //   q: `${fromStationField.value}to${toStationField.value}`,
    // });
    //window.location.href = `https://www.bing.com/search?${searchParams.toString()}`;
    let journey = fromStationField.value + "to" + toStationField.value;
    localStorage.setItem('selected_seats','');
    localStorage.setItem('extraseats','');
    try{
      parent.location.href = './main/index.html?journey='+fromStationField.value+","+toStationField.value+","+journeyDateField.value;
    }catch(e){
      window.location.href = './main/index.html?journey='+fromStationField.value+","+toStationField.value+","+journeyDateField.value;
    }


  }
   
});


