'use strict';
const api_key = "ab909bfc29fc6d1a9010f00d8f3530d1";
export const fetchData = function(URL, callback) {
    fetch(`${URL}&appid=${api_key}`)
    .then(res=>res.json())
    .then(data=>callback(data));
}
export const url = {
    currentWeather(lat, lon){
        return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`;
    },
    forecast(lat, lon){
        return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`;
    },
    airPollution(lat, lon){
        return `https://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}`;
    },
    geo(query){
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
    },
    reverseGeo(lat,lon){
        return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`;
    }
}

export const weekDaynames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];
export const monthnames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export const getData = function(dateUnix, timezone) {
    const date = new Date((dateUnix+timezone)*1000);
    const weekDay = weekDaynames[date.getUTCDay()];
    const monthName = monthnames[date.getUTCMonth()];
    return `${weekDay} ${date.getUTCDate()}, ${monthName}`;
}

export const getTime = function(timeUnix, timezone) {
    const date = new Date((timeUnix+timezone)*1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12}:${minutes} ${period};`
}

export const getHours = function(timeUnix, timezone){
    const date = new Date((timeUnix+timezone)*1000);
    const hours = date.getUTCHours();
    const period = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12} ${period};`
}

export const getNext5Days = function getNext5Days() {
    const today = new Date();
    const ret = [];
    const day = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      var dayOfWeek = undefined;
      date.setDate(today.getDate() + i);
      if (date.getDay()+1 > 6) {
        dayOfWeek  = days[0];
      }else{
        dayOfWeek = days[date.getDay()+1];
      }
      const month = date.toLocaleString('en-US', { month: 'short' });
      const dayOfMonth = date.getDate();
      const formattedDate = `${dayOfMonth} ${month}`;
      ret.push(formattedDate);
      day.push(dayOfWeek);
    }

  
    return [ret,day];
  }

export const aqiText = {
    1:{
        level: "Good",
        message: "Air Quality is considered satisfactory, and air pollution poses little or no risk."
    },
    2:{
        level: "Fair",
        message: "Air Quality is acceptable; however, there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution."
    },
    3:{
        level: "Moderate",
        message: "Members of sensitive groups may experience health effects. The general public is not likely to be affected."
    },
    4:{
        level: "Poor",
        message: "Everyone may begin to experience health effects. Members of sensitive groups may experience more serious health effects."
    },
    5:{
        level: "Very Poor",
        message: "Health warning of emergency conditions. The entire population is more likely to be affected."
    },
}