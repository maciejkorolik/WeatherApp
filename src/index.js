// ***  Still to be done:  ***
// ***************************
// - repair issues with time for other timezones
//     (time is read as local time of user, the app doesn't convert it 
//      to timezone of the searched city. A result is that sunset and sunrise times are
//      not real for cities in different timezones, and 5day forecast is not shown properly)


import './css/style.css';
import './css/zwicon.css';
var moment = require('moment');
let appId = '4028c59f77317ad8b5a44c41e53ca804';
let units = 'metric';

// function to repair vh issues on mobile

window.addEventListener('resize', () => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
});


// get weather by searching for the city name

function getWeatherByCity(searchInput) {
    document.querySelector('.intro').classList.add("intro--hidden");
    toggleLoader();
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchInput}&appid=${appId}&units=${units}`)
        .then(resultToday => {
            deleteError();
            if(resultToday.ok) {
                return resultToday.json()
            } else {
                return Promise.reject(resultToday)
            }
        })
        .then(resultToday => showTodayWeather(resultToday))
        .catch(error => {
            console.log(error);
            toggleLoader();
            showError(`I can't find this city. Try again or use your location!`);
        });
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchInput}&appid=${appId}&units=${units}`)
        .then(resultFiveDays => {
            if (resultFiveDays.ok) {
                return resultFiveDays.json()
            } else {
                return Promise.reject(resultFiveDays)
            }
        })
        .then(resultFiveDays => showFiveDays(resultFiveDays))
        .catch(error => {
            console.log(error);
        });
};

// get weather by geolocation

function getWeatherByGeo(lat, lon) {
    document.querySelector('.intro').classList.add("intro--hidden");
    toggleLoader();
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}&units=${units}`)
        .then(resultToday => {
            deleteError();
            if (resultToday.ok) {
                return resultToday.json()
            } else {
                return Promise.reject(resultToday)
            }
        })
        .then(resultToday => showTodayWeather(resultToday))
        .catch(error => {
            console.log(error);
            toggleLoader();
            showError(`I can't find your location. Try normal search.`);
        });
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appId}&units=${units}`)
        .then(resultFiveDays => {
            if (resultFiveDays.ok) {
                return resultFiveDays.json()
            } else {
                return Promise.reject(resultFiveDays)
            }
        })
        .then(resultFiveDays => showFiveDays(resultFiveDays))
        .catch(error => {
            console.log(error);
        });
};

// show today current weather

function showTodayWeather(result) {
    // console.log(result);
    toggleLoader();
    document.querySelector('.main').classList.remove("main--hidden");
    document.querySelector('.details').classList.remove("details--hidden");
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

    document.querySelector('.date').innerHTML = moment().format("dddd, D MMMM YYYY");
    document.querySelectorAll('.city-name').forEach(el => el.innerHTML = result.name);
    if (result.name.length > 10) {
        document.documentElement.style.setProperty('--city-name-size', '2.5em');
    }
    document.querySelector('.current-temp').innerHTML = result.main.temp.toFixed() + '&deg';
    document.querySelector('.max-temp').innerHTML = result.main.temp_max.toFixed() + '&deg';
    document.querySelector('.min-temp').innerHTML = result.main.temp_min.toFixed() + '&deg';
    document.querySelector('.today-cond').innerHTML = result.weather[0].main.toLowerCase();
    document.querySelector('.sunrise-value').innerHTML = sunriseTime;
    document.querySelector('.sunset-value').innerHTML = sunsetTime;
    document.querySelector('.today-clouds').innerHTML = result.clouds.all;
    document.querySelector('.today-humidity').innerHTML = result.main.humidity;
    document.querySelector('.today-pressure').innerHTML = result.main.pressure;
    if (result.wind) {
        document.querySelector('.today-wind').innerHTML = result.wind.speed;
     };

    if (currentTimeUnix >= result.sys.sunrise && currentTimeUnix < result.sys.sunset){
        displaySunPath(percentOfDay, 'day');
        document.querySelector('.today-icon').innerHTML = `<i class="${setIcon(result.weather[0].id)}"></i>`;
        document.documentElement.style.setProperty('--background-main', `${setBackground(result.weather[0].id)}`);
        document.documentElement.style.setProperty(`--text-color`, '#3C3C3B');
    } else {
        displaySunPath(percentOfNight, 'night');
        document.querySelector('.today-icon').innerHTML = `<i class="zwicon-moon"></i>`;
        document.documentElement.style.setProperty(`--background-main`, '#3C3C3B');
        document.documentElement.style.setProperty(`--text-color`, '#FFF');
    }
    
};

// show five days forecast

function showFiveDays(result) {
    let noonData = [];
    result.list.map(el => {
        if (el.dt_txt.includes("12:00")) {
            noonData.push(el);
        }
    });
    console.log(noonData);
    let nextDays = document.querySelector('.details__next-days');
    nextDays.innerHTML = '';
    noonData.forEach(
        day => {
            let dayName = moment(day.dt_txt).format("dddd");
            let dayTemp = day.main.temp.toFixed();
            let dayIcon = day.weather[0].id;
            let dayDisplay = document.createElement('div');
            dayDisplay.classList.add('next-day');
            dayDisplay.innerHTML = 
            `<p class="next-day__date">${dayName}</p>
            <p class="next-day__icon"><i class="${setIcon(dayIcon)}"></i></p>
            <p class="next-day__temp">${dayTemp} &deg</p>`
            nextDays.appendChild(dayDisplay);
        }
    )
};

// display svg of sun position
function displaySunPath(percent, time) {
    let sunPath = document.getElementById('sun-path');
    let sunPathTotal = sunPath.getTotalLength();
    let sunPathCurrent = sunPathTotal * (1 - percent);
    sunPath.style.strokeDasharray = sunPathTotal;
    sunPath.style.strokeDashoffset = sunPathCurrent;
    // get position of length
    let sunPosition = sunPath.getPointAtLength(sunPathTotal - sunPathCurrent);
    let sun = document.getElementById('sun');
    sun.setAttribute("cx", sunPosition.x);
    sun.setAttribute("cy", sunPosition.y);
    if (time == 'night') {
        sunPath.setAttribute('stroke', '#C5C3C6');
        sun.setAttribute('fill', '#C5C3C6');
    } else {
        sunPath.setAttribute('stroke', '#3C3C3B');
        sun.setAttribute('fill', '#3C3C3B');
    };
};

// set background color for each weather condition
function setBackground(id) {
    if (id < 300) {
        return '#C5C3C6';
    } else if (id < 500) {
        return '#C5C3C6';
    } else if (id < 600) {
        return '#C5C3C6';
    } else if (id < 700) {
        return '#C5C3C6';
    } else if (id < 800) {
        return '#C5C3C6';
    } else if (id == 800) {
        return '#FBC244';
    } else {
        return '#C5C3C6';
    };
};

// set icon for each weather condition
function setIcon(id) {
    if (id < 300) {
        return 'zwicon-storm';
    } else if (id < 500) {
        return 'zwicon-mild-rain';
    } else if (id < 600) {
        return 'zwicon-heavy-rain';
    } else if (id < 700) {
        return 'zwicon-snow';
    } else if (id < 800) {
        return 'zwicon-cloud';
    } else if (id == 800) {
        return 'zwicon-sun';
    } else {
        return 'zwicon-cloud';
    };
};

function toggleLoader() {
    document.querySelector('.loader').classList.toggle("loader--hidden");
};

// Show and delete errors
function showError(text) {
    document.querySelector('.intro').classList.toggle("intro--hidden");
    document.querySelector('p.error').innerText = text;
};

function deleteError() {
    let errorText = document.querySelector('p.error');
    if (errorText.innerText !== '') {
        errorText.innerText = '';
    };
};

// main event listeners
document.querySelector('.intro__form').addEventListener('submit', (e) => {
    e.preventDefault();
    let searchInput = document.querySelector('.search-input').value;
    getWeatherByCity(searchInput);
    // Clear input value
    document.querySelector('.search-input').value = "";
});

document.querySelector('.btn.btn__geo').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            getWeatherByGeo(pos.coords.latitude, pos.coords.longitude);
        },
        error => {
            if (error.code == error.PERMISSION_DENIED) {
                document.querySelector('.intro').classList.toggle("intro--hidden");
                showError(`Geolocation not supported`);
            }
                });
    } else {
        console.log('geolocation not supported');
        showError(`Geolocation not supported`);
    }});

document.querySelector('.btn.btn__arrow-down').addEventListener('click', () => {
    document.querySelector('.main').classList.toggle('main--up');
    document.querySelector('.details').classList.toggle('details--down');
});

document.querySelector('.btn.btn__arrow-up').addEventListener('click', () => {
    document.querySelector('.main').classList.toggle('main--up');
    document.querySelector('.details').classList.toggle('details--down');
});

document.querySelector('.btn__return').addEventListener('click', () => {
    document.querySelector('.intro').classList.toggle("intro--hidden");
    if (document.querySelector('.main').classList.contains('main--up')) {
        document.querySelector('.main').classList.toggle('main--up');
        document.querySelector('.details').classList.toggle('details--down');
    }
});