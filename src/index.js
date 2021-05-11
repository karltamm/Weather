import React, { useState } from "react";
import ReactDOM from "react-dom";
import API from "./api";
import "./style.css";

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

/* GLOBAL VARIABLES */
var show_error = false;

/* REACT */
function App() {
  /* DOM states */
  var [location_name, setLocation] = useState({});
  var [query, setQuery] = useState({});
  var [forecast, updateForecast] = useState({});
  var [error, raiseError] = useState({});

  /* Events */
  function searchWeather(event) {
    event.preventDefault();
    API.getCoordsByName(
      query,
      (coords) => {
        getForecast(coords, query);
      },
      () => {
        show_error = true;
        raiseError(true);
      }
    );
  }

  function getLocalWeather() {
    API.getUserCoords(
      (coords) => {
        getForecast(coords, "Current location");
      },
      () => {
        show_error = true;
        raiseError(true);
      }
    );
  }

  function getForecast(coords, location) {
    API.getForecast(
      coords,
      (data) => {
        updateForecast(data);
        setLocation(location); // Update info on screen
        raiseError(false);
      },
      () => {
        show_error = true;
        raiseError(true);
      }
    );
  }

  /* Rendering */
  function getWeatherIcon(day) {
    return `http://openweathermap.org/img/wn/${forecast[day].icon}@2x.png`;
  }

  function showWeatherInfo() {
    if (!error) {
      var upcoming_days = forecast.slice(1);

      return (
        <section id="forecast">
          <div id="location_name">{location_name}</div>

          <section id="current_weather" className="row">
            {generateCurrent()}
          </section>

          <section id="upcoming_weather" className="row">
            <h2>Upcoming weather</h2>
            <ul id="upcoming_days">
              {upcoming_days.map((data, index) => {
                return generateNextDay(data, index);
              })}
            </ul>
          </section>
        </section>
      );
    } else if (error && show_error) {
      return <span>No such location</span>;
    }
  }

  function generateCurrent() {
    var cur = forecast[0]; // Current weather

    return (
      <React.Fragment>
        <div className="col">
          <div id="cur_temp">{cur.cur_temp}°C</div>
          <div id="cur_feels_like">Feels like {cur.feels_like} °C</div>
        </div>

        <div className="col">
          <h2>Currently</h2>
          <h3>{formatDate(cur.time)}</h3>
          {/* <img src={getWeatherIcon(0)} /> */}
          <p id="cur_desc">{cur.desc}</p>
          <div id="cur_wind">{cur.wind}</div>
        </div>
      </React.Fragment>
    );
  }

  function generateNextDay(data, index) {
    return (
      <li key={index}>
        <h3 className="date"></h3>
        <img className="weather_icon" src={getWeatherIcon(index)} />
        <p className="weather_desc">{data.desc}</p>
        <span className="day_temp">{data.day_temp}</span>
        <span className="night_temp">{data.night_temp}</span>
      </li>
    );
  }

  function showSearch() {
    return (
      <section id="search">
        <div className="row">
          <div className="col">
            <form className="input-group" onSubmit={searchWeather}>
              <input
                type="text"
                id="search_input"
                className="form-control"
                placeholder="Insert location"
                onChange={(e) => setQuery(e.target.value)}
              ></input>
              <button
                type="button"
                className="form-control"
                className="btn btn-primary"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={getLocalWeather}
            >
              Locate me
            </button>
          </div>
        </div>
      </section>
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
function formatDate(epoch_time) {
  var date_obj = new Date();
  date_obj.setUTCSeconds(epoch_time);

  var day = DAYS[date_obj.getDay()];
  var date = date_obj.getDate();
  var month = MONTHS[date_obj.getMonth()];
  //var year = date_obj.getFullYear();

  return `${day}, ${date} ${month}`;
}
