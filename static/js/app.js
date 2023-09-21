'use strict';

import { fetchData, url } from "./api.js";
import * as module from "./api.js";

const addEventsOnElements = function (elements, eventType, callback) {
    for (const element of elements) {
        element.addEventListener(eventType, callback);
    }
}

const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");
const toggleSearch = () => searchView.classList.toggle("active");
addEventsOnElements(searchTogglers, "click", toggleSearch);

const searchResult = document.querySelector("[data-search-result]");
const searchField = document.querySelector("[data-search-field]");

let searchTimeout = null;
let searchTimeoutDuration = 500;

searchField.addEventListener("input", () => {
    searchTimeout ?? clearTimeout(searchTimeout);
    if (!searchField.value) {
        searchResult.classList.remove("active");
        searchResult.innerHTML = "";
        searchField.classList.remove("searching");
    } else {
        searchField.classList.add("searching");
    }

    if (searchField.value) {
        searchTimeout = setTimeout(() => {
            fetchData(url.geo(searchField.value), function (locations) {
                searchField.classList.remove("searching");
                searchResult.classList.add("active");
                searchResult.innerHTML = `
                <ul class="view-list" data-search-list></ul>
                `;
                const items = [];
                for (const { name, lat, lon, country, state } of locations) {
                    const searchItem = document.createElement("li");
                    searchItem.classList.add("view-item");
                    searchItem.innerHTML = `
                        <span class="m-icon">
                            location_on
                        </span>
                        <div>
                            <p class="item-title">
                                ${name}
                            </p>
                            <p class="item-2 label-subtitle">${state || ""}, ${country}</p>
                        </div>
                        <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather"  data-search-toggler></a>
                    `;
                    searchResult.querySelector("[data-search-list]").appendChild(searchItem);
                    items.push(searchItem.querySelector("[data-search-toggler]"));
                }
                addEventsOnElements(items, "click", function () {
                    toggleSearch();
                    searchResult.classList.remove("active");
                });
            });
        }, searchTimeoutDuration)
    }
})

const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const errorContent = document.querySelector("[data-error-content]");
const forecastSection = document.querySelector("[data-5-day-forecast]");


currentLocationBtn.addEventListener("click", () => {
    if(currentLocationBtn.attributes.disabled == undefined){
        loading.style.display = "grid";
    }
});

async function aQIforecastApi(city){
    forecastSection.innerHTML = "";
    const url = "https://weather.codewithbishal.com";
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so we add 1)
    const day = String(currentDate.getDate()).padStart(2, '0'); // Get the day of the month
    // Create the formatted date string in the "YYYY-MM-DD" format
    const date = module.getNext5Days()[0]
    const iter = 5;
    for (let index = 0; index < iter; index++) {
        const formattedDate = `${year}-${month}-${parseInt(day)+1+index}`;
        const csrfToken = getCookie("csrftoken");
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
          }
        let options = {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({
                city: city,
                date: formattedDate
            }),
        };
        await fetch(url, options).then((response)=> response.json()).then((json)=>{
                forecastSection.innerHTML += `
                <li class="card-item">
                    <div class="icon-wrapper">
                        <img src="/static/img/weather_icons/01d.png" alt="Good" width="36" height="36"
                            class="weather-icon">
                        <span class="span">
                            <p class="title-2">Good</p>
                        </span>
                    </div>
                    <p class="label-1">
                        ${date[index]}
                    </p>
                    <p class="label-1">Sunday</p>
                </li>
                `;
                console.log(json)
        });   
    }
}

export const updateWeather = function (lat, lon) {
    loading.style.display = "grid";
    container.style.overflowY = "hidden";
    container.classList.contains("fade-in") ?? container.classList.remove("fade-in");
    errorContent.style.display = "none";
    const currentWeatherSection = document.querySelector("[data-current-weather]");
    const highLightSection = document.querySelector("[data-highlights]");
    const hourlySection = document.querySelector("[data-hourly-forecast]");
    currentWeatherSection.innerHTML = "";
    highLightSection.innerHTML = "";
    hourlySection.innerHTML = "";
    if (window.location.hash == "#/current-location") {
        currentLocationBtn.setAttribute("disabled", "");
    } else {
        currentLocationBtn.removeAttribute("disabled", "");
    }

    fetchData(url.currentWeather(lat, lon), function (currentWeather) {
        const {
            weather,
            dt: dateUnix,
            sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
            main: { temp, feels_like, pressure, humidity },
            visibility,
            timezone
        } = currentWeather;
        const [{ description, icon }] = weather;
        const card = document.createElement("div");
        card.classList.add("card", "card-lg", "current-weather-card");
        card.innerHTML = `
            <h2 class="title-2 card-title">Now</h2>
            <div class="wrapper">
                <p class="heading">${parseInt(temp)}&deg;<sup>c</sup></p>
                <img src="/static/img/weather_icons/${icon}.png" width="64" height="64" class="weather-icon"
                    alt="${description}">
            </div>
            <p class="body-3">
                ${description}
            </p>
            <ul class="meta-list">
                <li class="meta-item">
                    <span class="m-icon">calendar_today</span>
                    <p class="title-3 meta-text">
                        ${module.getData(dateUnix, timezone)}
                    </p>
                </li>
                <li class="meta-item">
                    <span class="m-icon">location_on</span>
                    <p class="title-3 meta-text" data-location>
                        
                    </p>
                </li>
            </ul>
        `;
        fetchData(url.reverseGeo(lat, lon), function ([{ name, country }]) {
            card.querySelector("[data-location]").innerHTML = `${name}, ${country}`;
            aQIforecastApi(name);
        });
        currentWeatherSection.appendChild(card);
        fetchData(url.airPollution(lat, lon), function (airPollution) {
            const [{
                main: { aqi },
                components: { no2, o3, so2, pm2_5 }
            }] = airPollution.list;
            const card = document.createElement("div");
            card.classList.add("card", "card-lg");
            card.innerHTML = `
            <h2 class="title-2" id="highlights-label">
                            Todays Highlights
                        </h2>
                        <div class="highlight-list">
                            <div class="card card-sm highlight-card one">
                                <h3 class="title-3">Air Quality Index</h3>
                                <div class="wrapper">
                                    <span class="m-icon">air</span>
                                    <ul class="card-list">
                                        <li class="card-item">
                                            <p class="title-1">${Number(pm2_5).toPrecision(3)}</p>
                                            <p class="label-1">PM<sub>2.5</sub></p>
                                        </li>
                                        <li class="card-item">
                                            <p class="title-1">${Number(so2).toPrecision(3)}</p>
                                            <p class="label-1">SO<sub>2</sub></p>
                                        </li>
                                        <li class="card-item">
                                            <p class="title-1">${Number(no2).toPrecision(3)}</p>
                                            <p class="label-1">NO<sub>2</sub></p>
                                        </li>
                                        <li class="card-item">
                                            <p class="title-1">${Number(o3).toPrecision(3)}</p>
                                            <p class="label-1">O<sub>3</sub></p>
                                        </li>
                                    </ul>
                                </div>
                                <span class="badge aqi-${aqi} label-${aqi}" title="${module.aqiText[aqi].message}">${module.aqiText[aqi].level}</span>
                            </div>
                            <div class="card card-sm highlight-card two">
                                <h3 class="title-3">Sunrise and Sunset</h3>
                                <div class="card-list">
                                    <div class="card-item">
                                        <span class="m-icon">clear_day</span>
                                        <div>
                                            <p class="label-1">Sunrise</p>
                                            <p class="title-1">${module.getTime(sunriseUnixUTC, timezone)}</p>
                                        </div>
                                    </div>
                                    <div class="card-item">
                                        <span class="m-icon">clear_night</span>
                                        <div>
                                            <p class="label-1">Sunset</p>
                                            <p class="title-1">${module.getTime(sunsetUnixUTC, timezone)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card card-sm highlight-card">
                                <h3 class="title">Humidity</h3>
                                <div class="wrapper">
                                    <span class="m-icon">humidity_percentage</span>
                                    <p class="title-1">${humidity}<sub>%</sub></p>
                                </div>
                            </div>
                            <div class="card card-sm highlight-card">
                                <h3 class="title">Pressure</h3>
                                <div class="wrapper">
                                    <span class="m-icon">airwave</span>
                                    <p class="title-1">${pressure}<sub>hpa</sub></p>
                                </div>
                            </div>
                            <div class="card card-sm highlight-card">
                                <h3 class="title">Visibility</h3>
                                <div class="wrapper">
                                    <span class="m-icon">visibility</span>
                                    <p class="title-1">${visibility / 1000}<sub>km</sub></p>
                                </div>
                            </div>
                            <div class="card card-sm highlight-card">
                                <h3 class="title">Feels Like</h3>
                                <div class="wrapper">
                                    <span class="m-icon">thermostat</span>
                                    <p class="title-1">${parseInt(feels_like)}&deg;<sup>c</sup></p>
                                </div>
                            </div>
                        </div>
            `;
            highLightSection.appendChild(card);
        })
        fetchData(url.forecast(lat, lon), function (forecast) {
            const {
                list: forecastList,
                city: { timezone },
            } = forecast;
            hourlySection.innerHTML = `
            <h2 class="tile-2">
                        Today at
                    </h2>
                    <div class="slider-container">
                        <ul class="slider-list" data-temp>
                            
                        </ul>
                    </div>
            `;
            for (const [index, data] of forecastList.entries()) {
                if (index > 6) break;
                const {
                    dt: dateTimeUnix,
                    main: { temp },
                    weather,
                } = data;
                const [{icon, description}] = weather
                const tempLi = document.createElement("li");
                tempLi.classList.add("slider-item");
                tempLi.innerHTML = `
                <li class="slider-item">
                <div class="card card-sm slider-card">
                    <p class="body-3">
                        ${module.getHours(dateTimeUnix, timezone)}
                    </p>
                    <img src="/static/img/weather_icons/${icon}.png" class="weather-icon" width="48" height="48" loading="lazy" alt="${description}" title="${description}">
                    <p class="body-3">
                        ${parseInt(temp)}&deg;
                    </p>

                </div>
                </li>
                `;
                hourlySection.querySelector("[data-temp]").appendChild(tempLi);
            }
        });
        loading.style.display = "none";

    });
}


export const error404 = function () {
    loading.style.display = "none";
    errorContent.style.display = "flex";
}