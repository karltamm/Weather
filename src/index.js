import React, { useState } from "react";
import ReactDOM from "react-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

import API from "./js/api";
import "./style/style.css";
import error_image from "./style/lost_illustration.svg";

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
  var [location_data, setLocation] = useState({});
  var [query, setQuery] = useState({});
  var [forecast, setForecast] = useState({});
  var [error, setError] = useState({});
  var [loading, setLoader] = useState(false);

  /* Events */
  function searchWeather(event) {
    event.preventDefault();

    setLoader(true);

    API.getCoordsByName(
      query,
      (coords) => {
        updateForecast(coords);
      },
      () => {
        handleError();
      }
    );
  }

  function getLocalWeather() {
    setLoader(true);

    API.getUserCoords(
      (coords) => {
        updateForecast(coords);
      },
      () => {
        handleError();
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
            setLoader(false);
          },
          () => {
            handleError();
          }
        );
      },
      () => {
        handleError();
      }
    );
  }

  function handleError() {
    show_error = true;
    setError(true);
    setLoader(false);
  }

  /* Rendering */
  /* Weather */
  function showWeatherInfo() {
    if (!error) {
      return (
        <React.Fragment>
          <section id="forecast">
            {showMap()}
            {showCurrentWeather()}
            {showForecast()}
          </section>
        </React.Fragment>
      );
    }
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
              src={getWeatherIcon(now.icon)}
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

  function getWeatherIcon(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
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
                <span className="temp_label">
                  <i className="bi bi-sun"> </i>
                  Day
                </span>
                <span className="temp_value">{data.day_temp}°C</span>
              </div>
              <div className="temp_wrapper">
                <span className="temp_label">
                  <i className="bi bi-moon"> </i>
                  Night
                </span>
                <span className="temp_value">{data.night_temp}°C</span>
              </div>
            </div>

            <div className="extra_side">
              <img
                src={getWeatherIcon(data.icon)}
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

  /* Search */
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

  function showLoader() {
    var forecast_el = document.getElementById("forecast");
    var error_el = document.getElementById("error");

    if (loading) {
      /* Hide elements*/
      if (forecast_el) forecast_el.style.opacity = 0;
      if (error_el) error_el.style.visibility = "hidden";

      return (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    } else {
      /* Show elements */
      if (forecast_el) forecast_el.style.opacity = 1;
      if (error_el) error_el.style.visibility = "visible";

      return "";
    }
  }

  function showError() {
    if (error && show_error) {
      return (
        <section id="error">
          <img id="error_image" src={error_image} alt="Lost" />
          <span id="error_message">Error: no such location</span>
        </section>
      );
    } else {
      return "";
    }
  }

  function showMap() {
    var pos = [location_data.coords.lat, location_data.coords.lon];

    return (
      <section>
        <div id="location_name">
          {location_data.name}, {location_data.country}
        </div>

        <MapContainer center={pos} zoom={13} scrollWheelZoom={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={pos}></Marker>
          <UpdateMapView></UpdateMapView>
        </MapContainer>
      </section>
    );
  }

  function UpdateMapView() {
    var map = useMap();
    map.setView([location_data.coords.lat, location_data.coords.lon], 13);
    return null;
  }

  /* Misc */
  function showHeader() {
    return (
      <header>
        <div id="site_title">Peek</div>
        <div id="site_subtitle">A weather app</div>
        <div id="author">
          Made by <a href="https://github.com/karltamm">Karl-Heinrich</a>
        </div>
        {showSearch()}
      </header>
    );
  }

  /* COMPLETE */
  return (
    <React.Fragment>
      {showHeader()}
      {showWeatherInfo()}
      {showLoader()}
      {showError()}
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

  return `${day}, ${month} ${date}`;
}
