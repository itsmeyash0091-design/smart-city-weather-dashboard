
let searchHistory = JSON.parse(localStorage.getItem("history")) || [];
let favorites = JSON.parse(localStorage.getItem("favCities")) || [];

const apiKey = "3c265094d6f4720092510fc575e1015e";

const loading = document.getElementById("loading");
const weatherDiv = document.getElementById("weather");


async function getWeather() {
  const city = document.getElementById("city").value.trim();

  if (city === "") {
    weatherDiv.innerHTML = " Please enter a city name";
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
      weatherDiv.innerHTML = " City not found";
      return;
    }

    const { name } = data;
    const { temp, humidity } = data.main;
    const { main, icon } = data.weather[0];

    const entry = { name, temp };
    searchHistory.push(entry);
    localStorage.setItem("history", JSON.stringify(searchHistory));

    
    weatherDiv.innerHTML = `
      <h2>${name}</h2>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
      <p>Temperature: ${temp} °C</p>
      <p>Weather: ${main}</p>
      <p> Humidity: ${humidity}%</p>
    `;

    
    renderHistory(searchHistory);

  } catch (error) {
    loading.innerText = "";
    weatherDiv.innerHTML = " Network error, try again!";
    console.log(error);
  }
}


function renderHistory(arr) {
  const historyDiv = document.getElementById("history");

  historyDiv.innerHTML = arr.map(item => `
    <div style="border:1px solid #ccc; margin:5px; padding:5px;">
      <strong>${item.name}</strong>  ${item.temp}°C

      <button onclick="toggleFav('${item.name}')">
        ${favorites.includes(item.name) ? "❤️" : "🤍"}
      </button>
    </div>
  `).join("");
}


document.getElementById("filterTemp").addEventListener("change", (e) => {
  const value = e.target.value;

  let filtered = searchHistory;

  if (value === "hot") {
    filtered = searchHistory.filter(item => item.temp > 25);
  } 
  else if (value === "cold") {
    filtered = searchHistory.filter(item => item.temp <= 25);
  }

  renderHistory(filtered);
});


document.getElementById("sortTemp").addEventListener("change", (e) => {
  const value = e.target.value;

  let sorted = [...searchHistory];

  if (value === "asc") {
    sorted.sort((a, b) => a.temp - b.temp);
  } 
  else if (value === "desc") {
    sorted.sort((a, b) => b.temp - a.temp);
  }

  renderHistory(sorted);
});


function toggleFav(city) {
  if (favorites.includes(city)) {
    favorites = favorites.filter(c => c !== city);
  } else {
    favorites.push(city);
  }

  localStorage.setItem("favCities", JSON.stringify(favorites));
  renderHistory(searchHistory);
}


const toggleBtn = document.getElementById("toggleTheme");

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});


if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}


renderHistory(searchHistory);