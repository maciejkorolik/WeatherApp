import './css/style.css';
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
            if(result.ok) {
                return result.json()
            } else {
                return Promise.reject(result)
            }
        })
        .then(result => showTodayWeather(result))
        .catch(error => console.log(error));
};

function showTodayWeather(result) {
    console.log(result);
    toggleLoader();
    document.querySelector('.main').classList.remove("main--hidden");
   
    document.querySelector('.city-name').innerHTML = result.name;
    document.querySelector('.today-temp').innerHTML = result.main.temp.toFixed();
    document.querySelector('.today-cond').innerHTML = result.weather[0].main;
    document.querySelector('#humidity').innerHTML = result.main.humidity;
    document.querySelector('#pressure').innerHTML = result.main.pressure;
    // document.querySelector('#rain').innerText =
    // document.querySelector('#snow').innerText =
    
};

function toggleLoader() {
    document.querySelector('.loader').classList.toggle("loader--hidden");
};
document.querySelector('.intro__form').addEventListener('submit', (e) => {
    e.preventDefault();
    let searchInput = document.querySelector('.search-input').value;
    getWeatherByCity(searchInput);
});
// document.querySelector('.btn__geo').addEventListener('click', getWeatherByGeo());