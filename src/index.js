import React, { useState } from "react";
import ReactDOM from "react-dom";
import API from "./api";
import "./style.css";
import error_image from "./lost_illustration.svg";

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
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/* GLOBAL VARIABLES */
var show_error = false;

/* REACT */
function App() {
  /* States */
  var [location_name, setLocation] = useState({});
  var [query, setQuery] = useState({});
  var [forecast, setForecast] = useState({});
  var [error, setError] = useState({});

  /* Events */
  function searchWeather(event) {
    event.preventDefault();
    API.getCoordsByName(
      query,
      (coords) => {
        updateForecast(coords);
      },
      () => {
        show_error = true;
        setError(true);
      }
    );
  }

  function getLocalWeather() {
    API.getUserCoords(
      (coords) => {
        updateForecast(coords);
      },
      () => {
        show_error = true;
        setError(true);
      }
    );
  }

  function updateForecast(coords) {
    API.getForecast(
      coords,
      (data) => {
        API.getNameByCoords(
          coords,
          (location) => {
            setLocation(location);
            setForecast(data);
            setError(false);
          },
          () => {
            show_error = true;
            setError(true);
          }
        );
      },
      () => {
        show_error = true;
        setError(true);
      }
    );
  }

  /* Rendering */
  function getWeatherIcon(day) {
    return `http://openweathermap.org/img/wn/${forecast[day].icon}@2x.png`;
  }

  function showWeatherInfo() {
    if (!error) {
      return (
        <section id="forecast">
          <div id="location_name">
            {location_name.name}, {location_name.country}
          </div>
          {showCurrentWeather()}
          {showForecast()}
        </section>
      );
    } else if (error && show_error) {
      return showError();
    }
  }

  function showError() {
    return (
      <section id="error">
        <img id="error_image" src={error_image} alt="Lost" />
        <span id="error_message">Error: no such location</span>
      </section>
    );
  }

  function showCurrentWeather() {
    var now = forecast[0];

    return (
      <div id="current_weather" className="day">
        <div className="period">
          <span className="period_title">Currently</span>
          <span className="date">{formatDate(now.time)}</span>
        </div>

        <div className="weather_tab">
          <div className="temp_side">
            <div className="temp">{now.temp}°C</div>
            <div className="feels">Feels like {now.feels} °C</div>
          </div>

          <div className="extra_side">
            <img
              src={getWeatherIcon(0)}
              className="weather_icon"
              alt="A symbol for weather"
            />
            <span className="weather_desc">{now.desc}</span>
            <span className="wind">Wind {now.wind} m/s</span>
          </div>
        </div>
      </div>
    );
  }

  function showForecast() {
    var upcoming_days = forecast.slice(1);

    return (
      <div id="upcoming_weather">
        <span id="upcoming_title" className="period_title">
          Upcoming
        </span>
        {upcoming_days.map((data, index) => {
          return generateNextDay(data, index);
        })}
      </div>
    );
  }

  function generateNextDay(data, index) {
    return (
      <React.Fragment>
        <div key={index} className="day">
          <div className="period">
            <span className="date">{formatDate(data.time)}</span>
          </div>

          <div className="weather_tab">
            <div className="temp_side">
              <div className="temp_wrapper">
                <span className="temp_label">Day</span>
                <span className="temp_value">{data.day_temp}°C</span>
              </div>
              <div className="temp_wrapper">
                <span className="temp_label">Night</span>
                <span className="temp_value">{data.night_temp}°C</span>
              </div>
            </div>

            <div className="extra_side">
              <img
                src={getWeatherIcon(index)}
                className="weather_icon"
                alt="A symbol for weather"
              />
              <span className="weather_desc">{data.desc}</span>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  function showSearch() {
    return (
      <section id="search">
        <div>
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
                onClick={searchWeather}
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div>
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

  function showHeader() {
    return (
      <header>
        <div id="site_title">Peek</div>
        <div id="site_subtitle">A weather app</div>
        {showSearch()}
      </header>
    );
  }

  return (
    <React.Fragment>
      {showHeader()}
      {showWeatherInfo()}
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

/* FUNCTIONS */
function formatDate(epoch_time) {
  var date_obj = new Date(epoch_time * 1000); // Convert to milliseconds

  var day = DAYS[date_obj.getDay()];
  var date = date_obj.getDate();
  var month = MONTHS[date_obj.getMonth()];
  //var year = date_obj.getFullYear();

  return `${day}, ${month} ${date}`;
}
