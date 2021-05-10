/* CONSTANTS */
const API_KEY = "9625d17991923b2fcd6ebcbc7a90fc25";

/* FUNCTIONS */
function getUserCoords(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      var coords = {
        long: position.coords.longitude,
        lat: position.coords.latitude,
      };

      callback(coords);
    });
  }
}

function getWeatherByPos(callback, errorCallback) {
  getUserCoords((coords) => {
    var API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.long}&appid=${API_KEY}&units=metric&lang=en`;
    apiCall(
      API_URL,
      (response) => {
        callback(formatWeatherData(response));
      },
      () => {
        errorCallback();
      }
    );
  });
}

function getWeatherByName(location, callback, errorCallback) {
  var API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric&lang=en`;
  apiCall(
    API_URL,
    (response) => {
      callback(formatWeatherData(response));
    },
    () => {
      errorCallback();
    }
  );
}

function getForecast(coords, callback, errorCallback) {
  var API_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&exclude=current,minutely,hourly,alerts&appid=${API_KEY}&units=metric&lang=en`;
  apiCall(
    API_URL,
    (response) => {
      callback(formatForecastData(response));
    },
    () => {
      errorCallback();
    }
  );
}

function handleFetchError(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
}

function captalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

function apiCall(API_URL, callback, errorCallback) {
  fetch(API_URL)
    .then(handleFetchError)
    .then((response) => {
      return response.json();
    })
    .then((response) => callback(response))
    .catch((error) => errorCallback(error));
}

function formatWeatherData(response) {
  var data = {};

  data.coord = response.coord;
  data.location = response.name;
  data.temp = Math.round(response.main.temp);
  data.desc = captalizeFirstLetter(response.weather[0].description);
  data.icon = response.weather[0].icon;
  data.feels_like = Math.round(response.main.feels_like);
  data.wind = Math.round(response.wind.speed);

  return data;
}

function formatForecastData(response) {
  var data = {};

  //   data.location = response.name;
  //   data.temp = Math.round(response.main.temp);
  //   data.desc = captalizeFirstLetter(response.weather[0].description);
  //   data.icon = response.weather[0].icon;
  //   data.feels_like = Math.round(response.main.feels_like);
  //   data.wind = Math.round(response.wind.speed);

  return data;
}

/* EXPORT */
export default { getWeatherByName, getWeatherByPos, getForecast };
