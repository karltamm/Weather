import COUNTRIES from "./countryCodes.json";

/* CONSTANTS */
const NUM_COUNTRIES = 249;
const API_KEY = "9625d17991923b2fcd6ebcbc7a90fc25";
const NUM_UPCOMING_DAYS = 5;

/* FUNCTIONS */
/* Get location */
function getUserCoords(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      var coords = {
        lon: position.coords.longitude,
        lat: position.coords.latitude,
      };

      callback(coords);
    });
  }
}

function getCoordsByName(loc_name, callback, errorCallback) {
  var api_url = `https://api.openweathermap.org/geo/1.0/direct?q=${loc_name}&limit=1&appid=${API_KEY}`;

  apiCall(
    api_url,
    (response) => {
      var coords = {
        lat: response[0].lat,
        lon: response[0].lon,
      };

      callback(coords);
    },
    () => {
      errorCallback();
    }
  );
}

function getNameByCoords(coords, callback, errorCallback) {
  var api_url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${coords.lat}&lon=${coords.lon}&limit=1&appid=${API_KEY}`;

  apiCall(
    api_url,
    (response) => {
      var location = {
        name: response[0].name,
        country: getCountryNameByCode(response[0].country),
        coords: {
          lat: response[0].lat,
          lon: response[0].lon,
        },
      };
      callback(location);
    },
    () => {
      errorCallback();
    }
  );
}

/* Forecast */
function getForecast(coords, callback, errorCallback) {
  var api_url = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&exclude=minutely,hourly,alerts&appid=${API_KEY}&units=metric&lang=en`;
  apiCall(
    api_url,
    (response) => {
      callback(formatForecastData(response));
    },
    () => {
      errorCallback();
    }
  );
}

/* Fetch */
function apiCall(API_URL, callback, errorCallback) {
  fetch(API_URL)
    .then(handleFetchError)
    .then((response) => {
      /* Parse response */
      return response.json();
    })
    .then(handleDataError)
    .then((response) => callback(response))
    .catch((error) => errorCallback(error));
}

function handleFetchError(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
}

function handleDataError(data) {
  if (data.length === 0) {
    throw Error("Empty fetch response");
  }

  return data;
}

/* Format data */
function formatForecastData(res) {
  var data = [];

  var now = res.current; // Data about current weather
  var next = res.daily; // Data about current weather

  for (var day = 0; day <= NUM_UPCOMING_DAYS; day++) {
    if (day === 0) {
      /* Current weather */
      data[0] = {
        time: now.dt,
        temp: Math.round(now.temp),
        feels: Math.round(now.feels_like),
        wind: Math.round(now.wind_speed),
        desc: captalizeFirstLetter(now.weather[0].description),
        icon: now.weather[0].icon,
      };
    } else {
      /* Upcoming weather */
      data[day] = {
        time: next[day].dt,
        day_temp: Math.round(next[day].temp.day),
        night_temp: Math.round(next[day].temp.night),
        desc: captalizeFirstLetter(next[day].weather[0].description),
        icon: next[day].weather[0].icon,
      };
    }
  }

  return data;
}

function captalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

function getCountryNameByCode(code) {
  /* ISO 3166 country codes */
  for (var i = 0; i < NUM_COUNTRIES; i++) {
    if (code === COUNTRIES[i]["alpha-2"]) {
      return COUNTRIES[i].name;
    }
  }
}

/* EXPORT */
export default { getUserCoords, getForecast, getCoordsByName, getNameByCoords };
