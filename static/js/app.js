'use strict';

import { fetchData, url } from "./api.js";
import * as module from "./api.js";

const addEventsOnElements = function (elements, eventType, callback) {
    for (const element of elements) element.addEventListener(eventType, callback);
}

const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");
const toggleSearch = () => searchView.classList.toggle("active");
addEventsOnElements(searchTogglers, "click", toggleSearch);

const searchResult = document.querySelector("[data-search-result]");
const searchField = document.querySelector("[data-search-field]");

let searchTimeout = null;
let searchTimeoutDuration = 500;

searchField.addEventListener("input", ()=>{
    searchTimeout ?? clearTimeout(searchTimeout);
    if(!searchField.value){
        searchResult.classList.remove("active");
        searchResult.innerHTML = "";
        searchField.classList.remove("searching");
    }else{
        searchField.classList.add("searching");
    }

    if(searchField.value){
        searchTimeout = setTimeout(()=>{
            fetchData(url.geo(searchField.value), function(locations){
                searchField.classList.remove("searching");
                searchResult.classList.add("active");
                searchResult.innerHTML = `
                <ul class="view-list" data-search-list></ul>
                `;
                const items = [];
                for(const {name, lat, lon, country, state} of locations){
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
                    items.push(searchItem.querySelector("[data-search-list]"));
                }
            });
        }, searchTimeoutDuration)
    }
})

const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const errorContent = document.querySelector("[data-error-content]");
export const updateWeather = function(lat, lon){
    loading.style.display = "grid";
    container.style.overflowY = "hidden";
    container.classList.contains("fade-in") ?? container.classList.remove("fade-in");
    errorContent.style.display = "none";
}