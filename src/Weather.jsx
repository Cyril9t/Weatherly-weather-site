import PuffLoader from "react-spinners/PuffLoader"
import RingLoader from "react-spinners/RingLoader"
import { useState, useEffect } from "react";

export function Weather() {
    const [weatherData, setWeatherData] = useState([]);
    const [search, setSearch] = useState("");
    const [debounceSearch, setDebounceSearch] = useState("");
    const [centi, setCenti] = useState("");
    const [loading, setLoading] = useState("")
    const [isFah, setIsFah] = useState(false);
    const [err0r, setErr0r] = useState(null);
    const [ringLoder, setRingLoder] = useState(true)
    const [backDrop, setBackDrop] = useState("")

    useEffect(() => {
        const delay = setTimeout(() => {
            setRingLoder(false)
        }, 3000)

        return () => clearTimeout(delay);
    }, [])





    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceSearch(search);
        }, 3000)

        return () => {
            clearTimeout(timer);
        }
    }, [search])

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetchWeather(lat, lon);
        }, (error) => {
            console.log("location err:", error);
        }
        );

    }, []);




    const fetchWeather = async (lat, lon) => {

        try {
            const apiKey = import.meta.env.VITE_API_KEY;
            let query = lon ? `${lat},${lon}` : debounceSearch;
            const resp = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5`);
            const data = await resp.json();
            if (!resp.ok || data.error) {
                throw new Error(data.error?.message || "City not found")
            }
            setWeatherData(data);

        } catch (error) {
            console.log("Error Say", error);
            setErr0r(error.message)
        }
    };


    useEffect(() => {
        const weatherTemperature = isFah ? `${weatherData.current?.temp_f}°F` : `${weatherData.current?.temp_c}°C`;

        if (centi === "") {
            setCenti(<PuffLoader size={100} color="#fff" />);
            setLoading("loader");
        } else {
            setCenti(weatherTemperature);
            setLoading("temp");
        }




    }, [weatherData, isFah]);

    if (err0r) {
        alert(err0r);

        window.location.reload();
    }


    let action = ""


    if (weatherData.current?.condition?.text.toLowerCase().includes("sunny")) {
        action = "sunny"
    } else if (weatherData.current?.condition?.text.toLowerCase().includes("mist")) {
        action = "cloud"
    } else if (weatherData.current?.condition?.text.toLowerCase().includes("partly cloudy")) {
        action = "cloudy"
    } else if (weatherData.current?.condition?.text.toLowerCase().includes("cloud")) {
        action = "cloud"
    } else if (weatherData.current?.condition?.text.toLowerCase().includes("rain")) {
        action = "rain"
    } else {
        action = ""
    }




    return (
        <>
            {!ringLoder ? "" : <div className="overLay"> <RingLoader size={160} color="#024025" /> </div>}
            <div className={action}>
                <div className="app">

                    <header className="header">
                        <h1 className="logo">Weatherly ☁</h1>
                        <button className="toggle"
                            onClick={() => setIsFah((prev) => !prev)}
                        >°C / °F</button>
                    </header>

                    <section className="search-section">
                        <input type="text"
                            placeholder="Enter city globaly..."
                            className="search-input"
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                        />
                        <button onClick={() => {
                            if (!debounceSearch) return;
                            fetchWeather();
                            if (weatherData) {
                                setCenti(<PuffLoader size={100} color="#fff" />);
                                setLoading("loader");
                            } else {
                                setCenti(weatherTemperature);
                                setLoading("temp");
                            }
                        }} className="search-btn"
                        >Search</button>
                    </section>


                    <section className="current-weather">
                        <div className="weather-card">
                            <h2 className="city">{weatherData.location?.name}, <small>{weatherData.location?.country}</small></h2>
                            <p className={loading}>{centi}</p>
                            <p className="condition">{weatherData.current?.condition?.text}<img src={`https:${weatherData?.current?.condition?.icon}`} alt={weatherData.current?.condition?.text} className="icon" /></p>
                            <div className="details">
                                <p>Humidity: {weatherData.current?.humidity}%</p>
                                <small>{weatherData.location?.tz_id}</small>
                                <p>Wind: {weatherData.current?.wind_kph} km/h</p>
                            </div><br />
                            Date/time: <small>{weatherData.location?.localtime}</small>

                        </div>

                    </section>


                    <section className="forecast">
                        {weatherData?.forecast?.forecastday.map((day, index) => {
                            const dayLabel = (date_epoch) => {
                                const date = new Date(date_epoch * 1000);
                                const today = new Date();

                                if (date.toDateString() === today.toDateString()) return "Today";

                                const tomrr = new Date();

                                tomrr.setDate(today.getDate() + 1);

                                if (date.toDateString() === tomrr.toDateString()) return "Tomorrow";

                                return date.toLocaleDateString("en-US", { weekday: "short" });
                            }
                            return (
                                <div className="forecast-card" key={index}>
                                    <p>{dayLabel(day.date_epoch)}</p>
                                    <p>{day.day.mintemp_c}°C</p>
                                    <p>{day.day.condition.text}<img src={`https:${day.day.condition.icon}`} alt={day.day.condition.text} /></p>
                                </div>
                            )
                        })}

                        {/* <div className="forecast-card">
                        <p>Tue</p>
                        <p>30°C</p>
                        <p>⛅</p>
                    </div>
                    <div className="forecast-card">
                        <p>Wed</p>
                        <p>27°C</p>
                        <p>🌧️</p>
                    </div>
                    <div className="forecast-card">
                        <p>Thu</p>
                        <p>29°C</p>
                        <p>☁</p>
                    </div>
                    <div className="forecast-card">
                        <p>Fri</p>
                        <p>31°C</p>
                        <p>☀️</p>
                    </div> */}
                    </section>


                    <footer className="footer">
                        <p>Weatherly &copy; 2026</p>
                    </footer>
                </div>
            </div>



        </>
    )
}