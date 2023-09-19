'use strict';
import { updateWeather, error404} from "./app.js";
const defaultLatLong = "#/weather?lat=28.6517178&lon=77.2219388"//Delhi

const currectLoc = function() {
    window.navigator.geolocation.getCurrentPosition(res=>{
        const {latitude, longitude} = res.coords;
        updateWeather(`lat=${latitude}`, `lon=${longitude}`);
    }, err => {
        window.location.hash = defaultLatLong;
    })
}
const searchedLocation = query => {
    updateWeather(...query.split("&"))
    //updateWeather("lat=28.667", "lon=77.217")
}
const routes = new Map([
    ["/current-location",currectLoc],
    ["/weather",searchedLocation]
]);

const checkHash = function(){
    const reqURL = window.location.hash.slice(1);
    const [route,query] = reqURL.includes ? reqURL.split("?") : [reqURL];
    routes.get(route) ? routes.get(route)(query) : error404();
}

window.addEventListener("hashchange",checkHash);
window.addEventListener("load", function() {
    if (!window.location.hash) {
        window.location.hash = defaultLatLong;
    }else{
        checkHash();
    }
})