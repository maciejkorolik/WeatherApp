import './css/style.css';
var moment = require('moment');

// navigator.geolocation.getCurrentPosition(function (position) {
//     console.log(position.coords.latitude, position.coords.longitude);
// });

let appId = '4028c59f77317ad8b5a44c41e53ca804';
let units = 'metric';


// function getWeatherByGeo() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(pos => {
//             document.querySelector('.intro').classList.add("intro--hidden");
//             toggleLoader();
//             fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${appId}&units=${units}`)
//                 .then(result => {
//                     if(result.ok) {
//                         return result.json()
//                     } else {
//                         return Promise.reject(result)
//                     }
//                 })
//                 .then(result => showTodayWeather(result))
//                 .catch(error => console.log(error));
//         });
//     } else {
//         console.log('geolocation not supported');
//     }
// };

function getWeatherByCity(searchInput) {
    document.querySelector('.intro').classList.add("intro--hidden");
    toggleLoader();
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchInput}&appid=${appId}&units=${units}`)
        .then(result => {
            deleteError();
            if(result.ok) {
                return result.json()
            } else {
                return Promise.reject(result)
            }
            
        })
        .then(result => showTodayWeather(result))
        .catch(error => {
            console.log(error);
            showError();
        });
};

function showTodayWeather(result) {
    console.log(result);
    toggleLoader();
    document.querySelector('.main').classList.remove("main--hidden");
    //    Calculate sunset, sunrise and percent of day
    let currentTimeUnix = moment().unix()
    let percentOfDay = ((currentTimeUnix - result.sys.sunrise)/(result.sys.sunset-result.sys.sunrise));
    let percentOfNight;
    if (moment().format("HH") > 12 && moment().format("HH")<= 23) {
        percentOfNight = ((currentTimeUnix - result.sys.sunset) / (86400 - (result.sys.sunset - result.sys.sunrise)));
    } else {
        percentOfNight = 1 - ((result.sys.sunrise - currentTimeUnix) / (86400 - (result.sys.sunset - result.sys.sunrise)));
    }
    let sunriseTime = moment(new Date(result.sys.sunrise *1000)).format("H:mm");
    let sunsetTime = moment(new Date(result.sys.sunset * 1000)).format("H:mm");
    console.log(percentOfDay, percentOfNight, sunsetTime, sunriseTime);

    document.querySelector('.date').innerHTML = moment().format("dddd, D MMMM YYYY");
    document.querySelector('.city-name').innerHTML = result.name;
    document.querySelector('.today-temp').innerHTML = result.main.temp.toFixed();
    document.querySelector('.today-cond').innerHTML = result.weather[0].main;
    document.querySelector('#humidity').innerHTML = result.main.humidity;
    document.querySelector('#pressure').innerHTML = result.main.pressure;
    // document.querySelector('#sunrise').innerText = 
    // document.querySelector('#sunset').innerText = 
    if (currentTimeUnix >= result.sys.sunrise && currentTimeUnix < result.sys.sunset){
        displaySunPath(percentOfDay, 'day');
    } else {
        displaySunPath(percentOfNight, 'night');
    }
    
};

function toggleLoader() {
    document.querySelector('.loader').classList.toggle("loader--hidden");
};

function showError() {
    toggleLoader();
    document.querySelector('.intro').classList.toggle("intro--hidden");
    document.querySelector('p.error').innerText = 'I cant find this city. Try another one or use your location';
};

function deleteError() {
    let errorText = document.querySelector('p.error');
    if (errorText.innerText !== '') {
        errorText.innerText = '';
    };
};

function displaySunPath(percent, time) {
    let sunPath = document.getElementById('sun-path');
    let sunPathTotal = sunPath.getTotalLength();
    let sunPathCurrent = sunPathTotal * (1-percent);
    console.log(sunPathTotal);
    sunPath.style.strokeDasharray = sunPathTotal;
    sunPath.style.strokeDashoffset = sunPathCurrent;
    // get position of length
    let sunPosition = sunPath.getPointAtLength(sunPathTotal - sunPathCurrent);
    console.log(sunPosition);
    let sun = document.getElementById('sun');
    sun.setAttribute("cx", sunPosition.x);
    sun.setAttribute("cy", sunPosition.y);
    if (time == 'night') {
        sunPath.setAttribute('stroke', '#000');
        sun.setAttribute('fill', '#000');
    }
}

document.querySelector('.intro__form').addEventListener('submit', (e) => {
    e.preventDefault();
    let searchInput = document.querySelector('.search-input').value;
    getWeatherByCity(searchInput);
    // Clear input value
    document.querySelector('.search-input').value = "";
});
// document.querySelector('.btn__geo').addEventListener('click', getWeatherByGeo());
window.addEventListener('load', toggleLoader());
