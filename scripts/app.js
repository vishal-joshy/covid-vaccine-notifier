function getPresentDate() {
    let today = new Date();
    const dd = String(today.getDate());
    const mm = String(today.getMonth() + 1);
    const yyyy = String(today.getFullYear());
    today = `${dd}-0${mm}-${yyyy}`;
    return today;
}

function getApiUrl() {
    const districId = 307;           //Ekm id = 307 from https://cdn-api.co-vin.in/api/v2/admin/location/districts/17
    let presentDate = getPresentDate();
    const apiUrl = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districId}&date=${presentDate}`;
    return apiUrl;
}

function AddCell(row, text) {
    let newCell = row.insertCell();
    let newText = document.createTextNode(text);
    newCell.appendChild(newText);
}

function clearTableContents() {
    let vaccineListTable = document.getElementById('vaccine-list-table');
    let rowCount = vaccineListTable.rows.length;
    for (let i = rowCount - 1; i > 0; i--) {
        vaccineListTable.deleteRow(i);
    }
}

function createTable(filteredData) {

    clearTableContents();

    let tbodyRef = document.getElementById('vaccine-table-body');

    filteredData.forEach(center => {
        let newRow = tbodyRef.insertRow();

        AddCell(newRow, center.name);
        AddCell(newRow, center.pincode);

        for (let j = 0; j < center.sessions.length; j++) {
            if (center.sessions[j].available_capacity_dose1 > 0 || center.sessions[j].available_capacity_dose2 > 0) {
                AddCell(newRow, center.sessions[j].date);
                AddCell(newRow, center.sessions[j].available_capacity_dose1);
                AddCell(newRow, center.sessions[j].available_capacity_dose2);
                AddCell(newRow, center.sessions[j].min_age_limit);
                AddCell(newRow, center.sessions[j].vaccine)
                return;
            }
        }
    });
}


function getUserNotificationStatus() {
    const notifyMeButton = document.querySelector('#notify-me-button');
    notifyMeButton.addEventListener('click', () => {
        notifyMeButton.classList.add('button-selected');
        let promise = Notification.requestPermission();
        notificationStatus = true;
    });
}



function sendNotification() {
    if (Notification.permission == 'granted') {
        let notification = new Notification('Vaccine is available');
        notificationStatus = false;
        clearButtonStyleNotifyMeButton();
    }
}

function clearButtonStyleNotifyMeButton() {
    const notifyMeButton = document.querySelector('#notify-me-button');
    notifyMeButton.classList.remove('button-selected');
}




function filterDataBasedOnAvailability(data) {
    let filteredArray = [];

    data.forEach(center => {
        for (let i = 0; i < center.sessions.length; i++) {
            if (center.sessions[i].available_capacity_dose1 > 0 || center.sessions[i].available_capacity_dose2 > 0) {
                filteredArray.push(center);
                return;
            }
        }
    });
    return filteredArray;
}


function getUserInputAge() {
    const ageFilterButton = document.querySelectorAll('#age-filter-button');

    ageFilterButton.forEach(ageFilter => {
        ageFilter.addEventListener('click', function () {
            clearButtonStyle(ageFilterButton);
            ageFilter.classList.add('button-selected');

            minAgeLimit = parseInt(ageFilter.dataset.value);

            getVaccineDataFromAPI();
        });
    });
}

function clearButtonStyle(button) {
    button.forEach(button => {
        button.classList.remove('button-selected');
    })
}


function filterDataBasedOnAge(data, age) {
    let filteredArray = [];
    data.forEach(center => {
        for (let i = 0; i < center.sessions.length; i++) {
            if (center.sessions[i].available_capacity_dose1 > 0 || center.sessions[i].available_capacity_dose2 > 0) {
                switch (age) {
                    case 18: if (center.sessions[i].min_age_limit == 18) {
                        filteredArray.push(center);
                    }
                        break;

                    case 40: if (center.sessions[i].min_age_limit == 40) {
                        filteredArray.push(center);
                    }
                        break;

                    case 45: if (center.sessions[i].min_age_limit == 45) {
                        filteredArray.push(center);
                    }
                        break;

                    default: filteredArray.push(center);
                }
                return;
            }
        }
    });
    return filteredArray;
}


function getUserInputDose() {
    const doseFilterButton = document.querySelectorAll('#dose-filter-button');
    doseFilterButton.forEach(doseFilter => {
        doseFilter.addEventListener('click', function () {

            clearButtonStyle(doseFilterButton);
            doseFilter.classList.add('button-selected');

            dose = doseFilter.dataset.value;

            getVaccineDataFromAPI();
        });
    });
}

function filterDataBasedOnDose(data, dose) {
    let filteredArray = [];
    data.forEach(center => {
        for (let i = 0; i < center.sessions.length; i++) {
            if (center.sessions[i].available_capacity_dose1 > 0 || center.sessions[i].available_capacity_dose2 > 0) {
                switch (dose) {
                    case 'dose1': if (center.sessions[i].available_capacity_dose1 > 0) {
                        filteredArray.push(center);
                    }
                        break;
                    case 'dose2': if (center.sessions[i].available_capacity_dose2 > 0) {
                        filteredArray.push(center);
                    }
                        break;
                    default: filteredArray.push(center);
                }
                return;
            }
        }
    });
    return filteredArray;
}



function getVaccineDataFromAPI() {
    const url = getApiUrl();
    fetch(url).then((res) => {
        res.json().then((data) => {

            let filteredData = filterDataBasedOnAvailability(data.centers);

            filteredData = filterDataBasedOnAge(filteredData, minAgeLimit);

            filteredData = filterDataBasedOnDose(filteredData, dose);
            //console.log(filteredData);

            if (notificationStatus) {
                if (filteredData.length > 0) {
                    sendNotification();
                }
            }
            

            createTable(filteredData);

        }).catch((err) => {
            console.log(err);
        });
    });
}




//Default values
let minAgeLimit = 0;
let dose = 'all';
let notificationStatus = false;

const ageFilterButton = document.querySelectorAll('#age-filter-button');
ageFilterButton[0].classList.add('button-selected');
const doseFilterButton = document.querySelectorAll('#dose-filter-button');
doseFilterButton[0].classList.add('button-selected');


getVaccineDataFromAPI();
getUserInputAge();
getUserInputDose();
getUserNotificationStatus();


navigator.serviceWorker.register('./sw.js');

setInterval(function () { getVaccineDataFromAPI() }, 10000);

