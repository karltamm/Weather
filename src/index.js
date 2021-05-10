import React, { useState } from "react";
import ReactDOM from "react-dom";
import API from "./api";

/* CONSTANTS */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TODAY = formatDate(new Date());

/* GLOBAL VARIABLES */
var show_error = false;

/* REACT */
function App() {
  /* DOM states */
  var [location, setLocation] = useState({});
  var [weather, updateWeather] = useState({});
  var [forecast, updateForecast] = useState({});
  var [error, raiseError] = useState({});

  /* Events */
  function sendQuery(event) {
    event.preventDefault();

    API.getWeatherByName(
      location,
      (data) => {
        updateWeather(data);

        API.getForecast(
          data.coord,
          (data) => {
            updateForecast(data);
          },
          () => {
            show_error = true;
            raiseError(true);
          }
        );

        raiseError(false);
      },
      () => {
        show_error = true;
        raiseError(true);
      }
    );
  }

  function localWeather() {
    API.getWeatherByPos(
      (data) => {
        updateWeather(data);

        API.getForecast(
          data.coord,
          (data) => {
            updateForecast(data);
          },
          () => {
            show_error = true;
            raiseError(true);
          }
        );

        raiseError(false);
      },
      () => {
        show_error = true;
        raiseError(true);
      }
    );
  }

  /* Rendering */
  function renderIcon() {
    return `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  }

  function showWeatherInfo() {
    if (!error) {
      return (
        <section>
          <h1>{weather.location}</h1>
          <div>{TODAY}</div>
          <div>{weather.temp} °C</div>
          <div>Feels like {weather.feels_like}°C</div>
          <div>{weather.desc}</div>
          <div>{weather.wind} m/s</div>
          <img src={renderIcon()} />
        </section>
      );
    } else if (error && show_error) {
      return <span>No such location</span>;
    }
  }

  function showSearch() {
    return (
      <React.Fragment>
        <form id="search" onSubmit={sendQuery}>
          <input
            placeholder="Insert location"
            onChange={(e) => setLocation(e.target.value)}
          ></input>
          <button>Search</button>
        </form>
        <button onClick={localWeather}>Locate me</button>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {showSearch()}
      {showWeatherInfo()}
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

/* FUNCTIONS */
function formatDate(date_obj) {
  let day = DAYS[date_obj.getDay()];
  let date = date_obj.getDate();
  let month = MONTHS[date_obj.getMonth()];
  let year = date_obj.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
}
