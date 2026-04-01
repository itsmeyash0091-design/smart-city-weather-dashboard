const apiKey = "3c265094d6f4720092510fc575e1015e";

const loading = document.getElementById("loading");
const weatherDiv = document.getElementById("weather");

async function getWeather() {
  const city = document.getElementById("city").value.trim();

  if (city === "") {
    weatherDiv.innerHTML = "⚠️ Please enter a city name";
    return;
  }

  loading.innerText = "Loading...";
  weatherDiv.innerHTML = "";

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const data = await res.json();

    loading.innerText = "";

    if (data.cod !== 200) {
      weatherDiv.innerHTML = "❌ City not found";
      return;
    }

    const { name } = data;
    const { temp, humidity } = data.main;
    const { main, icon } = data.weather[0];

    weatherDiv.innerHTML = `
      <h2>${name}</h2>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
      <p>🌡 Temperature: ${temp} °C</p>
      <p>🌥 Weather: ${main}</p>
      <p>💧 Humidity: ${humidity}%</p>
    `;

  } catch (error) {
    loading.innerText = "";
    weatherDiv.innerHTML = "⚠️ Network error, try again!";
    console.log(error);
  }
}