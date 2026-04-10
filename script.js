
let searchHistory = JSON.parse(localStorage.getItem("history")) || [];
let favorites = JSON.parse(localStorage.getItem("favCities")) || [];

const apiKey = "3c265094d6f4720092510fc575e1015e";

const loading = document.getElementById("loading");
const weatherDiv = document.getElementById("weather");
const forecastDiv = document.getElementById("forecast");


async function getWeather() {
    const city = document.getElementById("city").value.trim();

    if (city === "") {
        weatherDiv.innerHTML = " Please enter a city name";
        return;
    }

    loading.innerText = "Loading...";
    weatherDiv.innerHTML = "";
    forecastDiv.innerHTML = "";

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

        const advice = getWearAdvice(temp, main);

        weatherDiv.innerHTML = `
      <h2>${name}</h2>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
      <p>Temperature: ${temp} °C</p>
      <p>Weather: ${main}</p>
      <p> Humidity: ${humidity}%</p>
      <p><strong>Advice:</strong> ${advice}</p>
    `;


        renderHistory(searchHistory);

        // Fetch and display 5-day forecast
        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (forecastRes.ok) {
            const forecastData = await forecastRes.json();
            let forecastHTML = `<h3>5-Day Forecast</h3><div style="display:flex; overflow-x:auto; gap:10px; padding-bottom:10px; align-items:center;">`;
            for (let i = 0; i < forecastData.list.length; i += 8) {
                const item = forecastData.list[i];
                const date = new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                forecastHTML += `
                    <div style="border:1px solid #ccc; border-radius:8px; padding:10px; min-width:80px; flex-shrink:0;">
                        <div style="font-size:0.9em;"><strong>${date}</strong></div>
                        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon" style="width:40px;height:40px;" />
                        <div style="font-weight:bold;">${Math.round(item.main.temp)}°C</div>
                        <div style="font-size:0.8em; color:#666; text-transform:capitalize;">${item.weather[0].description}</div>
                    </div>
                `;
            }
            forecastHTML += `</div>`;
            forecastDiv.innerHTML = forecastHTML;
        }

    } catch (error) {
        loading.innerText = "";
        weatherDiv.innerHTML = " Network error, try again!";
        forecastDiv.innerHTML = "";
        console.log(error);
    }
}

function getWearAdvice(temp, condition) {
    let advice = "Enjoy the day!";
    const cond = condition.toLowerCase();
    
    if (cond.includes("rain") || cond.includes("drizzle")) {
        advice = "Bring an umbrella!";
    } else if (temp <= 10) {
        advice = "Wear a heavy jacket!";
    } else if (temp > 10 && temp <= 20) {
        advice = "A light sweater or jacket is recommended.";
    } else if (temp > 20 && temp <= 30) {
        advice = "Perfect weather for a t-shirt!";
    } else if (temp > 30) {
        advice = "It's so hot! Wear light clothing and stay hydrated.";
    }
    
    if (cond.includes("snow")) {
        advice = "Snow is expected! Wear a thick coat and boots.";
    }
    
    return advice;
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