const currentlocation = document.getElementsByClassName('current-location');
const firstwrapper = document.getElementById('wrapper');
const secondwrapper = document.getElementById('second-wrapper');
const locationImage = document.getElementById('location-img');
const searchbox = document.getElementById('input-box');
const searchbtn = document.getElementById('search-btn');
const daytimeinfo = document.getElementById('day-time');
const tempdisplay = document.getElementById('temp-display');
const feeltemp = document.getElementById('feel-temp');
const weatherimg = document.getElementById('weather-img');
const daycondition = document.getElementById('day-condition');
const rainvalue = document.getElementById('rain-value');
const humidityvalue = document.getElementById('humidity-value');
const windvalue = document.getElementById('wind-value');
const secondWrapper = document.querySelector('.second-wrapper');
const loader = document.querySelector('.loader');
const errordisplay = document.getElementById('error-display');
const backgroundvideo = document.getElementById('background-video');
const backvideo = document.getElementById('back-video');

const selectTemp = document.getElementById('temp-option');
const selectWind = document.getElementById('wind-option');
const selectHumidity = document.getElementById('humidity-option');
const selectRain = document.getElementById('precipitation-option');


let start_date;
let end_date;
let weatherfile;
let selectedDay;
let lon, lat;
function disableMainWrapper() {
  document.querySelectorAll('.mainWrapper').forEach(el => {
    el.classList.add('disabled');
  });
  backvideo.classList.add('disable');
}
function showMainWrappers() {
  document.querySelectorAll('.mainWrapper').forEach(el => {
    el.classList.remove('disabled');
  });
  backvideo.classList.remove('disable');
  secondWrapper.classList.remove('active');
  loader.classList.remove('active');
}
function showErrorDisplay() {
  disableMainWrapper();
  loader.classList.remove('active');
  secondWrapper.classList.add('active');
}

function showLoader() {
  disableMainWrapper();
  secondWrapper.classList.remove('active');
  loader.classList.add('active');
}
function cleanInputTab() {
  searchbox.value = '';
}

function getWeatherCondition({
  temperature,
  apparent_temperature,
  dew_point_2m,
  precipitation_probability,
  relative_humidity,
  cloud_cover,
  wind_speed_10m,
}) {
  // let name = "Clear";
  // let image = "clear.png";
  let name, image;
  let video = '';
  const dew_gap = temperature - dew_point_2m;
  const feel_diff = apparent_temperature - temperature;

  switch (true) {
    case precipitation_probability >= 85 && cloud_cover >= 80 && wind_speed_10m >= 35 && dew_gap > 4:
      name = 'Thunderstorm';
      image = 'thunderstorm.png';
      video = 'Thunderstorm.mp4';
      break;
    case precipitation_probability >= 70 && cloud_cover >= 75 && wind_speed_10m < 35 && dew_gap <= 4:
      name = 'Rain';
      image = 'rain.png';
      video = 'Rain.mp4';
      break;
    case precipitation_probability >= 35 && precipitation_probability < 70 && cloud_cover >= 50 && wind_speed_10m < 25:
      name = 'Showers';
      image = 'showers.png';
      video = 'showers.mp4';
      break;
    case cloud_cover >= 90 && relative_humidity >= 98 && dew_gap <= 0.5 && precipitation_probability < 10:
      name = 'Fog';
      image = 'fog.png';
      video = 'fog.mp4';
      break;
    case cloud_cover >= 95 && precipitation_probability < 15 && wind_speed_10m < 20:
      name = 'Overcast';
      image = 'overcast.png';
      video = 'overcast.mp4';
      break;
    case cloud_cover >= 70 && cloud_cover < 95 && precipitation_probability < 20:
      name = 'Mostly Cloudy';
      image = 'mostly-cloudy.png';
      video = 'mostly-cloudy.mp4';
      break;
    case cloud_cover >= 30 && cloud_cover < 70 && precipitation_probability < 10:
      name = 'Partly Cloudy';
      image = 'partly-cloudy.png';
      video = 'partly-cloudy.mp4';
      break;
    case apparent_temperature >= 40 && relative_humidity < 30 && cloud_cover < 20 && wind_speed_10m < 30:
      name = 'Hot';
      image = 'hot.png';
      video = 'hot.mp4';
      break;
    case apparent_temperature >= 32 && relative_humidity >= 70 && wind_speed_10m < 30:
      name = 'Humid';
      image = 'humid.png';
      video = 'humid.mp4';
      break;
    case temperature <= 3 && dew_gap <= 1 && cloud_cover < 30 && precipitation_probability < 5:
      name = 'Cold & Frosty';
      image = 'cold-frost.png';
      video = 'cold-frost.mp4';
      break;
    case wind_speed_10m >= 45 && precipitation_probability < 80:
      name = 'Windy';
      image = 'windy.png';
      video = 'windy.mp4';
      break;
    default:
      name = 'Clear';
      image = 'clear.png';
      video = 'clear.mp4';
      // video = 'cold-frost.mp4';
      break;
  }
  return {
    name,
    image: `./assest/${image}`,
    video: `./assest/${video}`,
  };
}

const suggestionBox = document.getElementById('suggestions');

searchbox.addEventListener('input', async () => {
  const q = searchbox.value.trim();
  suggestionBox.style.opacity = q ? '1' : '0';
  suggestionBox.style.zIndex = q ? '1' : '-1';

  if (q.length < 3) return (suggestionBox.innerHTML = '');

  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&apiKey=341ca10b8e334714829cdb01225f2197&limit=15`,
      {
        headers: { 'Accept-Language': 'en' },
      }
    );
    const json = await res.json();

    suggestionBox.innerHTML = '';
    const unique = new Set();

    json.features.forEach(f => {
      const p = f.properties;
      const name = `${p.city || p.town || p.village || p.name}, ${p.state}, ${p.country}`;
      if (unique.has(name) || !p.lat || !p.lon) return;
      unique.add(name);

      const li = document.createElement('li');
      li.textContent = name;
      li.style.cssText = 'cursor:pointer;border-bottom:1px solid #ccc;padding:4px;';
      li.onclick = () => {
        searchbox.value = name;
        suggestionBox.innerHTML = '';
        console.log(`Lat: ${p.lat}, Lon: ${p.lon}`);
      };
      suggestionBox.appendChild(li);
    });
  } catch (e) {
    console.error('Geoapify error:', e);
    suggestionBox.innerHTML = '<li style="color:red;">Error fetching data</li>';
  }
});
searchbox.addEventListener('keydown', async function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchbtn.click();

  }
});
async function getLocation() {
  selectedDay = 0;
  let checkLocation = true;
  console.log('selectedDay= ', selectedDay);
  // Check if browser supports geolocation
  if (!navigator.geolocation) {
    errordisplay.innerHTML = "Geolocation is not supported by your browser.";
    showErrorDisplay();
    console.log('Geolocation is not supported by your browser.');
    return;
  }

  // Show loading text
  console.log('loadig location');

  async function getCurrentCoordinates() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error)
      );
    });
  }

  async function fetchUserLocation() {

    try {
      const position = await getCurrentCoordinates();
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      console.log('inside fetchuserLocation function  lat=', lat, '  lon=', lon);
      // Use the coordinates
      return { lat, lon };
    } catch (error) {
      showErrorDisplay();
      checkLocation = false;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errordisplay.innerHTML = 'Permission denied. Please allow location access.';
          return;
        case error.POSITION_UNAVAILABLE:
          errordisplay.innerHTML = 'Location information is unavailable.';
          return;
        case error.TIMEOUT:
          errordisplay.innerHTML = 'The request to get your location timed out.';
          return;
        default:
          errordisplay.innerHTML = 'An unknown error occurred.';
          return;
      }
    }
  }
  try {
    const coords = await fetchUserLocation();
    console.log('value of checkLocation.....', checkLocation);
    lat = coords.lat;
    lon = coords.lon;
    console.log('for getweather function in get location function lat=', lat, '  lon=', lon);
    console.log('getWeather function calling..');
    await getWeather(lat, lon);
    console.log('getWeather function called..');
  } catch (e) {
    errordisplay.innerHTML = ' Please allow location access.';
    showErrorDisplay();
    console.log('location not allowed...');
  }
}

async function getWeather(lat, lon) {
  console.log('in getweather function:-> lat=', lat, '  lon=', lon);
  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  var today = new Date();
  var sixthDay = new Date();
  sixthDay.setDate(today.getDate() + 6);

  start_date = formatDate(today);
  end_date = formatDate(sixthDay);
  console.log('start date=', start_date, '  end-date=', end_date);
  try {
    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,uv_index_max,temperature_2m_min,temperature_2m_max,daylight_duration,sunshine_duration,precipitation_probability_mean&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation_probability&models=ecmwf_ifs025&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure,dew_point_2m,precipitation_probability&minutely_15=temperature_2m,rain,visibility&timezone=auto&start_date=${start_date}&end_date=${end_date}&temporal_resolution=hourly_3`;
    // const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,uv_index_max,temperature_2m_min,temperature_2m_max,daylight_duration,sunshine_duration,precipitation_probability_mean,apparent_temperature,de_w_point_2m,relative_humidity_2m,cloud_cover,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation_probability&models=ecmwf_ifs025&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure,dew_point_2m,precipitation_probability&minutely_15=temperature_2m,rain,visibility&timezone=auto&start_date=${start_date}&end_date=${end_date}&temporal_resolution=hourly_3`;
    const weatherRes = await fetch(weatherURL);
    if (!weatherRes.ok) {
      throw new Error(`HTTP error! Status: ${weatherRes.status}`);
    }
    const weatherData = await weatherRes.json();
    weatherfile = weatherData;
    console.log(weatherfile);
  } catch (error) {
    errordisplay.innerHTML = 'Failed to fetch weather data! ';
    showErrorDisplay();
    console.error('Failed to fetch weather data:', error.message);
    weatherfile = null;
    return;
  }

  const getAddress = document.getElementById('get-address');
  const countryFlag = document.getElementById('country-flag');

  // const API_key = "96af94546e1ef5aa3da459704b73461f";
  // const getloc = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_key}`);
  // const getloc = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
  const getloc = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=en`
  );
  const locdata = await getloc.json();
  console.log('using new api...', locdata);
  // const loc = await JSON.parse(locdata);
  const address = locdata.address;
  const city = address.city || address.town || address.village || '';
  const tahsil = address.county || address.state_district || '';
  // const district = address.state_district || '';
  const state = address.state || '';
  const country = address.country || '';

  const shortAddress = `${city}, ${tahsil}, ${state}, ${country}`;
  // console.log("get location", locdata);

  var c_code = await address.country_code;
  countryFlag.src = `https://flagcdn.com/64x48/${c_code.toLowerCase()}.png`;

  console.log('address in get weather function...', shortAddress);
  getAddress.textContent = shortAddress;

  if (selectedDay == 0) {
    await currentDayData(0);
    console.log('calling curentDaydata function..');
  }
  await setHourlyData(0);
  await setWeeklyData();
}

async function getLat_Lon() {
  const city = document.getElementById('input-box').value;
  //  Geocoding to get lat/lon
  const geoURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
  const geoRes = await fetch(geoURL);
  const geoData = await geoRes.json();
  if (geoData.length <= 0) {
    errordisplay.textContent = 'City not found.';
    showErrorDisplay();
    return;
  }

  lat = parseFloat(geoData[0].lat);
  lon = parseFloat(geoData[0].lon);

  console.log(start_date);
  console.log(end_date);
  console.log('getWeather calling inside getLat_lon function.....');

  getWeather(lat, lon);
  console.log('getWeather called inside getLat_lon function.....');
  // const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index,temperature_2m,relative_humidity_2m,apparent_temperature,precipitation&minutely_15=temperature_2m,rain,visibility&timezone=auto&past_days=3&temporal_resolution=hourly_3&past_hours=6&forecast_hours=24`;

  // out.textContent = JSON.stringify(loc.name, null, 2);
  // out.textContent = JSON.stringify(weatherData.current.temperature_2m, null, 2);
}

function formatIndianDate(dateInput) {
  const date = new Date(dateInput);
  return date
    .toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      // year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/ /, ', ')
    .replace(/ at/, ',');

}
function formatShortDate(d) {
  let date = new Date(d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    weekday: 'short'
  }).replace(',', ' , ');
}
async function currentDayData(number = 0) {
  console.log('entered in crntDaydata function....', weatherfile);
  const daytimeinfo = document.getElementById('day-time');
  const tempdisplay = document.getElementById('temp-display');
  const feeltemp = document.getElementById('feel-temp');
  const weatherimg = document.getElementById('weather-img');
  const daycondition = document.getElementById('day-condition');
  const rainvalue = document.getElementById('rain-value');
  const humidityvalue = document.getElementById('humidity-value');
  const windvalue = document.getElementById('wind-value');
  const cloudvalue = document.getElementById('cloud-value');
  // const dewvalue = document.getElementById('dew-value');
  // const winddirvalue = document.getElementById('wind-dir-value');
  // const pressurevalue = document.getElementById('pressure-value');

  if (selectedDay == 0) {
    daytimeinfo.textContent = formatIndianDate(weatherfile.current.time);
    console.log("date.......", typeof (formatIndianDate(weatherfile.current.time)));
    const temperature = weatherfile.current.temperature_2m;
    const apparentTemperature = weatherfile.current.apparent_temperature;
    const dewPoint = weatherfile.current.dew_point_2m;
    const pop = weatherfile.current.precipitation_probability;
    const humidity = weatherfile.current.relative_humidity_2m;
    const cloudcover = weatherfile.current.cloud_cover;
    const windSpeed = weatherfile.current.wind_speed_10m;
    const weatherData = {
      temperature: temperature,
      apparent_temperature: apparentTemperature,
      dew_point_2m: dewPoint,
      precipitation_probability: pop,
      relative_humidity: humidity,
      cloud_cover: cloudcover,
      wind_speed_10m: windSpeed,
    };
    const { name: weatherName, image: weatherImage, video: weatherVideo } = getWeatherCondition(weatherData);
    tempdisplay.textContent = parseInt(temperature);
    feeltemp.textContent = 'Feels ' + apparentTemperature + '℃';

    weatherimg.src = weatherImage;
    daycondition.textContent = weatherName;
    backgroundvideo.src = weatherVideo;
    backvideo.load();
    backvideo.style.opacity = "0.6";
    rainvalue.textContent = 'precipitation:   ' + Math.round(pop) + ' %';
    humidityvalue.textContent = 'Humididy:   ' + Math.round(humidity) + ' %';
    windvalue.textContent = 'Wind Speed:   ' + Math.round(windSpeed) + ' km/h';
    cloudvalue.textContent = 'Clouds:   ' + Math.round(cloudcover) + ' %';
    // dewvalue.textContent = 'Dew Point:   ' + dewPoint + ' ℃';
    // winddirvalue.textContent = 'Wind Direction:   ' + weatherfile.current.wind_direction_10m + '⁰';
    // pressurevalue.textContent = 'Surface Pressure:   ' + weatherfile.current.surface_pressure + ' hPa';
  }
}
let hourlytemp = document.querySelector('.hourly_temp');
let hourlywind = document.querySelector('.hourly_wind');
let hourlyhumidity = document.querySelector('.hourly_humidity');
let hourlypop = document.querySelector('.hourly_pop');
let hourlyimg = document.querySelector('.weatherCondition');

async function setHourlyData(i) {
  const tempData = weatherfile.hourly.temperature_2m.slice(i, i + 8);
  console.log('tempData:..', tempData);
  hourlytemp.querySelectorAll('p').forEach((p, index) => {
    p.textContent = `${tempData[index]}°C`;
  });

  const windData = weatherfile.hourly.wind_speed_10m.slice(i, i + 8);
  console.log('windData:..', windData);
  hourlywind.querySelectorAll('p').forEach((p, index) => {
    p.textContent = `${windData[index]} km/h`;
  });

  const humidityData = weatherfile.hourly.relative_humidity_2m.slice(i, i + 8);
  console.log('humidityData:..', humidityData);
  hourlyhumidity.querySelectorAll('p').forEach((p, index) => {
    p.textContent = `${humidityData[index]}%`;
  });

  const popData = weatherfile.hourly.precipitation_probability.slice(i, i + 8);
  console.log('popData:..', popData);
  hourlypop.querySelectorAll('p').forEach((p, index) => {
    p.textContent = `${popData[index]}%`;
  });

  const apparentTempData = weatherfile.hourly.apparent_temperature.slice(i, i + 8);
  const dewPointData = weatherfile.hourly.dew_point_2m.slice(i, i + 8);
  const cloudcoverData = weatherfile.hourly.cloud_cover.slice(i, i + 8);

  hourlyimg.querySelectorAll('img').forEach((img, index) => {
    const weatherData = {
      temperature: tempData[index],
      apparent_temperature: apparentTempData[index],
      dew_point_2m: dewPointData[index],
      precipitation_probability: popData[index],
      relative_humidity: humidityData[index],
      cloud_cover: cloudcoverData[index],
      wind_speed_10m: windData[index],
    };
    img.src = getWeatherCondition(weatherData).image;
  });
}
function getMean(variable, arr) {
  for (let i = 0; i < arr.length; i += 8) {
    const chunk = arr.slice(i, i + 8);
    const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
    variable.push(avg);
  }
}
function setWeeklyData() {
  let avg_temp = [], avg_apparent = [], avg_dew = [], avg_humid = [], avg_cloud = [], avg_wind = [];
  console.log(weatherfile.hourly.temperature_2m);
  getMean(avg_temp, weatherfile.hourly.temperature_2m);
  getMean(avg_apparent, weatherfile.hourly.apparent_temperature);
  getMean(avg_dew, weatherfile.hourly.dew_point_2m);
  getMean(avg_humid, weatherfile.hourly.relative_humidity_2m);
  getMean(avg_cloud, weatherfile.hourly.cloud_cover);
  getMean(avg_wind, weatherfile.hourly.wind_speed_10m);
  let avg_pop = weatherfile.daily.precipitation_probability_mean;
  console.log('avg_temp..', avg_temp);
  console.log('avg_apparent..', avg_apparent);
  console.log('avg_dew..', avg_dew);
  console.log('avg_humid..', avg_humid);
  console.log('avg_cloud..', avg_cloud);
  console.log('avg_wind..', avg_wind);
  console.log('avg_pop..', avg_pop);
  let day_date, day_img, day_max_temp, day_min_temp, day_weather, day_rain, day_humid; let weeklyWeather;
  for (let i = 0; i < 7; i++) {
    day_date = document.getElementById(`day${i + 1}-date`);
    day_img = document.getElementById(`day${i + 1}-img`);
    day_max_temp = document.getElementById(`day${i + 1}-max-temp`);
    day_min_temp = document.getElementById(`day${i + 1}-min-temp`);
    day_weather = document.getElementById(`day${i + 1}-weather`);
    day_rain = document.getElementById(`day${i + 1}-rain`);
    day_humid = document.getElementById(`day${i + 1}-humidity`);
    weeklyWeather = {
      temperature: avg_temp[i],
      apparent_temperature: avg_apparent[i],
      dew_point_2m: avg_dew[i],
      precipitation_probability: avg_pop[i],
      relative_humidity: avg_humid[i],
      cloud_cover: avg_cloud[i],
      wind_speed_10m: avg_wind[i],
    };
    let { name: weatherName, image: weatherImage, video: weatherVideo } = getWeatherCondition(weeklyWeather);
    day_date.innerHTML = formatShortDate(weatherfile.daily.time[i]);
    day_img.src = weatherImage;
    day_max_temp.innerHTML = `${Math.round(weatherfile.daily.temperature_2m_max[i])}°`;
    day_min_temp.innerHTML = `${Math.round(weatherfile.daily.temperature_2m_min[i])}°`;
    day_weather.innerHTML = weatherName;
    day_rain.innerHTML = 'Precipitation: ' + `${Math.round(avg_pop[i])}%`;
    day_humid.innerHTML = 'Humididy: ' + `${Math.round(avg_humid[i])}%`;
  }
  showMainWrappers();
}

locationImage.addEventListener('click', async () => {
  console.log('get Location function call...');
  clearWeekDay();
  day1.style.borderTop = "3px solid rgb(182, 114, 238)";
  cleanInputTab();
  showLoader();
  await getLocation();
  console.log('function call completed..');
});

searchbtn.addEventListener('click', async () => {
  selectedDay = 0;
  console.log('getLat_Lon function call...');
  clearWeekDay();
  day1.style.borderTop = "3px solid rgb(182, 114, 238)";
  showLoader();
  await getLat_Lon();
  console.log('getLat_Lon  call completed..');
});
firstwrapper.addEventListener('click', async () => {
  suggestionBox.style.opacity = '0';
});

window.onload = async function () {
  showLoader();
  await getLocation();
  await setHourlyData(0);
  await setWeeklyData();
};
firstwrapper.addEventListener('click', () => {
  suggestionBox.innerHTML = '';
});

function switchOption(option) {
  document.querySelectorAll('[select-options]').forEach(el => {
    el.children[1].style.borderTop = "none";
  });
  document.querySelectorAll('[hourly-data]').forEach(ele => {
    ele.style.opacity = "0";
  });
  if (option == 'selectTemp') {
    selectTemp.children[1].style.borderTop = "2px solid rgba(255, 255, 255, 0.568)";
    hourlytemp.style.opacity = "1";
  } else if (option == 'selectWind') {
    selectWind.children[1].style.borderTop = "2px solid rgba(255, 255, 255, 0.568)";
    hourlywind.style.opacity = "1";
  } else if (option == 'selectHumidity') {
    selectHumidity.children[1].style.borderTop = "2px solid rgba(255, 255, 255, 0.568)";
    hourlyhumidity.style.opacity = "1";
  } else {
    selectRain.children[1].style.borderTop = "2px solid rgba(255, 255, 255, 0.568)";
    hourlypop.style.opacity = "1";
  }
}
function clearWeekDay() {
  document.querySelectorAll('[weekday]').forEach(el => {
    el.style.borderTop = "none";
  })
}
selectTemp.addEventListener('click', () => {
  switchOption('selectTemp');
});
selectWind.addEventListener('click', () => {
  switchOption('selectWind');
});
selectHumidity.addEventListener('click', () => {
  switchOption('selectHumidity');
});
selectRain.addEventListener('click', () => {
  switchOption('selectRain');
});

const day1 = document.querySelector('.day1');
const day2 = document.querySelector('.day2');
const day3 = document.querySelector('.day3');
const day4 = document.querySelector('.day4');
const day5 = document.querySelector('.day5');
const day6 = document.querySelector('.day6');
const day7 = document.querySelector('.day7');

day1.addEventListener('click', () => {
  clearWeekDay();
  day1.style.borderTop = "3px solid rgb(182, 114, 238)";
  setHourlyData(0);
});
day2.addEventListener('click', () => {
  clearWeekDay();
  day2.style.borderTop = "3px solid rgb(182, 114, 238)";
  setHourlyData(8);
});
day3.addEventListener('click', () => {
  clearWeekDay();
  day3.style.borderTop = "3px solid rgb(182, 114, 238)";
  setHourlyData(16);
});
day4.addEventListener('click', () => {
  clearWeekDay();
  day4.style.borderTop = "3px solid rgb(182, 114, 238)";
  setHourlyData(24);
});
day5.addEventListener('click', () => {
  clearWeekDay();
  day5.style.borderTop = "3px solid rgb(182, 114, 238)";
  setHourlyData(32);
});
day6.addEventListener('click', () => {
  clearWeekDay();
  day6.style.borderTop = "3px solid rgb(182, 114, 238)";
  setHourlyData(40);
});
day7.addEventListener('click', () => {
  clearWeekDay();
  day7.style.borderTop = "3px solid rgb(182, 114, 238)";
  setHourlyData(48);
});
