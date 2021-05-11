/* CONSTANTS */
const API_KEY = "9625d17991923b2fcd6ebcbc7a90fc25";
const NUM_UPCOMING_DAYS = 5;

/* FUNCTIONS */
/* Forecast */
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
  var api_url = `http://api.openweathermap.org/geo/1.0/direct?q=${loc_name}&limit=1&appid=${API_KEY}`;

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

  var cur = res.current; // Data about current weather
  var next = res.daily; // Data about current weather

  for (var day = 0; day <= NUM_UPCOMING_DAYS; day++) {
    if (day === 0) {
      /* Current weather */
      data[0] = {
        time: cur.dt,
        cur_temp: Math.round(cur.temp),
        feels_like: Math.round(cur.feels_like),
        wind: Math.round(cur.wind_speed),
        desc: captalizeFirstLetter(cur.weather[0].description),
        icon: cur.weather[0].icon,
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

/* EXPORT */
export default { getUserCoords, getForecast, getCoordsByName };
