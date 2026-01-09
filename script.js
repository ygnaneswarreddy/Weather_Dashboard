
const $ = (id) => document.getElementById(id);

const WEATHER_ICONS = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "🌨️",
  80: "🌦️", 95: "⛈️"
};

const WEATHER_TEXT = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  51: "Light drizzle",
  61: "Light rain",
  71: "Light snow",
  95: "Thunderstorm"
};

const icon = (c) => WEATHER_ICONS[c] || "🌤️";
const text = (c) => WEATHER_TEXT[c] || "Unknown";

async function getCity(city) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
  );
  const data = await res.json();
  if (!data.results) throw "City not found";
  return data.results[0];
}

async function getWeather(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
  );
  return res.json();
}

async function searchAndLoadWeather() {
  try {
    $("loading").style.display = "block";
    $("weatherContent").style.display = "none";
    $("errorMsg").style.display = "none";

    const city = $("cityInput").value.trim();
    const location = await getCity(city);
    const data = await getWeather(location.latitude, location.longitude);

    $("location").textContent = `${location.name}, ${location.country}`;
    $("date").textContent = new Date().toDateString();
    $("currentIcon").textContent = icon(data.current.weather_code);
    $("temperature").textContent = Math.round(data.current.temperature_2m) + "°C";
    $("description").textContent = text(data.current.weather_code);
    $("feelsLike").textContent = Math.round(data.current.apparent_temperature) + "°C";
    $("humidity").textContent = data.current.relative_humidity_2m + "%";
    $("windSpeed").textContent = data.current.wind_speed_10m + " km/h";
    $("pressure").textContent = data.current.pressure_msl + " hPa";

    $("hourlyForecast").innerHTML = "";
    for (let i = 0; i < 24; i++) {
      $("hourlyForecast").innerHTML += `
        <div class="hourly-item">
          <div>${new Date(data.hourly.time[i]).getHours()}:00</div>
          <div>${icon(data.hourly.weather_code[i])}</div>
          <div>${Math.round(data.hourly.temperature_2m[i])}°C</div>
        </div>`;
    }

    $("dailyForecast").innerHTML = "";
    for (let i = 0; i < 7; i++) {
      $("dailyForecast").innerHTML += `
        <div class="daily-item">
          <div>${i === 0 ? "Today" : new Date(data.daily.time[i]).toLocaleDateString("en", { weekday: "short" })}</div>
          <div>${icon(data.daily.weather_code[i])}</div>
          <div>
            <span style="color:red">${Math.round(data.daily.temperature_2m_max[i])}°</span>
            <span style="color:blue">${Math.round(data.daily.temperature_2m_min[i])}°</span>
          </div>
        </div>`;
    }

    $("loading").style.display = "none";
    $("weatherContent").style.display = "block";
  } catch (err) {
    $("loading").style.display = "none";
    $("errorMsg").textContent = err;
    $("errorMsg").style.display = "block";
  }
}

$("searchBtn").addEventListener("click", searchAndLoadWeather);
$("cityInput").addEventListener("keypress", e => e.key === "Enter" && searchAndLoadWeather());

searchAndLoadWeather();
