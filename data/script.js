const apiKey = '0fc34377c3d4d58c829a0907b8a6d7ed';
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=La Paz,BO&appid=${apiKey}&units=metric`;
const timeUrl = 'https://worldtimeapi.org/api/ip';

const calentar = document.getElementById("calentar");
const enfriar = document.getElementById("enfriar");

window.onload = function() {
  modoManual();
};

enfriar.addEventListener("click", () => {
  let paths = enfriar.getElementsByTagName("path");
  let color = paths[0].getAttribute("stroke") == "#0000aa" ? "#000000" : "#0000aa";
  for (let i = 0; i < paths.length; i++) {
    paths[i].setAttribute("stroke", color);
  }
  //Encender o apagar el horno llamando al servidor ESP32
  enfriar_horno();
});

calentar.addEventListener("click", () => {
  let paths = horno.getElementsByTagName("path");
  let color = paths[0].getAttribute("fill") == "#ff1200" ? "#000000" : "#ff1200";
  for (let i = 0; i < paths.length; i++) {
    paths[i].setAttribute("fill", color);
  }
  //Encender o apagar el horno llamando al servidor ESP32
  calentar_horno();
});

function enfriar_horno() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/switch_enfriar_horno", true);
  xhttp.send(); 
}

function calentar_horno() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/switch_calentar_horno", true);
  xhttp.send();
}

async function getWeatherData() {
  const response = await fetch(weatherUrl);
  const data = await response.json();
  const temp = Math.round(data.main.temp);
  const desc = data.weather[0].description;
  const weatherElement = document.querySelector('.weather');
  const tempElement = weatherElement.querySelector('.temp');
  const descElement = weatherElement.querySelector('.desc');
  tempElement.textContent = `${temp}°C`;
  descElement.textContent = desc;
}

async function getTimeData() {
    const response = await fetch(timeUrl);
    const data = await response.json();
    const currentTime = new Date(); // Obtiene la hora actual del usuario
    const utcOffset = data.utc_offset; // Obtiene el offset UTC de la ubicación del usuario en segundos
    const localTime = new Date(currentTime.getTime()); // Obtiene la hora local del usuario
    const date = localTime.toISOString().split('T')[0]; // Obtiene la fecha local en formato ISO y la separa del tiempo
    const time = localTime.toLocaleTimeString(); // Obtiene la hora local en formato local
    const timeElement = document.querySelector('.time');
    const dateElement = timeElement.querySelector('.date');
    const clockElement = timeElement.querySelector('.clock');
    dateElement.textContent = date;
    clockElement.textContent = time;

    // muestra la hora minutos y segundos por separado
    const hours = localTime.getHours();
    const minutes = localTime.getMinutes();
    const seconds = localTime.getSeconds();

    // obtener la hora del input horaEncendido
    const horaEncendido = document.getElementById("horaEncendido").value;

    // ontener la hora del input horaApagado
    const horaApagado = document.getElementById("horaApagado").value;

    // split horaEncendido
    const horaEncendidoSplit = horaEncendido.split(":");
    let enHours = parseInt(horaEncendidoSplit[0]);
    let enMinutes = parseInt(horaEncendidoSplit[1]);

    // split horaApagado
    const horaApagadoSplit = horaApagado.split(":");
    let apHours = parseInt(horaApagadoSplit[0]);
    let apMinutes = parseInt(horaApagadoSplit[1]);

    if (seconds === 0) {
      const foco = document.getElementById("focoAutomatico");

      const paths = foco.getElementsByTagName("path");

      if (enHours === hours && enMinutes === minutes) {
        switch_horno();
        console.log("Encendiendo foco");
        for (let i = 0; i < paths.length; i++) {
          paths[i].setAttribute("fill", "#fff200");
        }
      } else if (apHours === hours && apMinutes === minutes) {
        switch_horno();
        console.log("Apagando foco");
        for (let i = 0; i < paths.length; i++) {
          paths[i].setAttribute("fill", "#000000");
          if(i >= 0 && i <= 6){
            paths[i].setAttribute("fill", "#fff20000");
          }
        }
      }
    }
}

getWeatherData();
/* call getTimeData every second */
setInterval(getTimeData, 1000);

function update(val) {
  const foco = document.getElementById("foco");
  const paths = foco.getElementsByTagName("path");
  const hexValue = Math.floor((val / 100) * 255).toString(16).padStart(2, '0');
  if(paths[0].getAttribute("fill").substring(0, 7) === "#fff200" ) {
    for (let i = 0; i < paths.length; i++) {
      if(i >= 0 && i <= 6){
        paths[i].setAttribute("fill", "#fff200"+hexValue);
      }
    }
  }
  console.log(val);
  document.getElementById('pwmInput').value = val; 
  document.getElementById('textInput').value = val; 
}

function updateE(val) {
  document.getElementById('pwmInputE').value = val ; 
  document.getElementById('textInputE').value = val; 
}
function updateA(val) {
  document.getElementById('pwmInputA').value = val ; 
  document.getElementById('textInputA').value = val; 
}
// Get current sensor readings when the page loads  
window.addEventListener('load', getReadings);

// Create Temperature Gauge
var gaugeTemp = new LinearGauge({
  renderTo: 'gauge-temperature',
  width: 120,
  height: 400,
  units: "Dato 1",
  minValue: 0,
  startAngle: 90,
  ticksAngle: 180,
  maxValue: 40,
  colorValueBoxRect: "#049faa",
  colorValueBoxRectEnd: "#049faa",
  colorValueBoxBackground: "#f1fbfc",
  valueDec: 2,
  valueInt: 2,
  majorTicks: [
      "0",
      "5",
      "10",
      "15",
      "20",
      "25",
      "30",
      "35",
      "40"
  ],
  minorTicks: 4,
  strokeTicks: true,
  highlights: [
      {
          "from": 30,
          "to": 40,
          "color": "rgba(200, 50, 50, .75)"
      }
  ],
  colorPlate: "#fff",
  colorBarProgress: "#CC2936",
  colorBarProgressEnd: "#049faa",
  borderShadowWidth: 0,
  borders: false,
  needleType: "arrow",
  needleWidth: 2,
  needleCircleSize: 7,
  needleCircleOuter: true,
  needleCircleInner: false,
  animationDuration: 1500,
  animationRule: "linear",
  barWidth: 10,
}).draw();
  
// Create Humidity Gauge
/* var gaugeHum = new RadialGauge({
  renderTo: 'gauge-humidity',
  width: 300,
  height: 300,
  units: "Dato 2 (%)",
  minValue: 0,
  maxValue: 100,
  colorValueBoxRect: "#049faa",
  colorValueBoxRectEnd: "#049faa",
  colorValueBoxBackground: "#f1fbfc",
  valueInt: 2,
  majorTicks: [
      "0",
      "20",
      "40",
      "60",
      "80",
      "100"

  ],
  minorTicks: 4,
  strokeTicks: true,
  highlights: [
      {
          "from": 80,
          "to": 100,
          "color": "#03C0C1"
      }
  ],
  colorPlate: "#fff",
  borderShadowWidth: 0,
  borders: false,
  needleType: "line",
  colorNeedle: "#007F80",
  colorNeedleEnd: "#007F80",
  needleWidth: 2,
  needleCircleSize: 3,
  colorNeedleCircleOuter: "#007F80",
  needleCircleOuter: true,
  needleCircleInner: false,
  animationDuration: 1500,
  animationRule: "linear"
}).draw(); */

// Function to get current readings on the webpage when it loads for the first time
function getReadings(){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var myObj = JSON.parse(this.responseText);
      console.log(myObj);
      var temp = myObj.temperature;
      var hum = myObj.humidity;
      gaugeTemp.value = temp;
      gaugeHum.value = hum;
    }
  }; 
  xhr.open("GET", "/readings", true);
  xhr.send();
}

/* if (!!window.EventSource) {
  var source = new EventSource('/events');
  
  source.addEventListener('open', function(e) {
    console.log("Events Connected");
  }, false);

  source.addEventListener('error', function(e) {
    if (e.target.readyState != EventSource.OPEN) {
      console.log("Events Disconnected");
    }
  }, false);
  
  source.addEventListener('message', function(e) {
    console.log("message", e.data);
  }, false);
  
  source.addEventListener('new_readings', function(e) {
    console.log("new_readings", e.data);
    var myObj = JSON.parse(e.data);
    console.log(myObj);
    gaugeTemp.value = myObj.temperature;
    gaugeHum.value = myObj.humidity;
  }, false);
} */

function updateV(val) {
  console.log(val);
  document.getElementById('pwmInputV').value = val ; 
  document.getElementById('textInputV').value = val; 
}

function modoManual(){
  document.getElementById("manual").style.display = "block";
  document.getElementById("automatico").style.display = "none";

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/modoManual", true);
  xhttp.send();
}

function modoAutomaticoHorario(){
  document.getElementById("automatico").style.display = "block";
  document.getElementById("automaticoHorario").style.display = "block";
  document.getElementById("automaticoIntensidad").style.display = "none";
  document.getElementById("manual").style.display = "none";

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/modoAutomaticoHorario", true);
  xhttp.send();
}

function modoAutomaticoIntensidad(){
  document.getElementById("automatico").style.display = "block";
  document.getElementById("automaticoHorario").style.display = "none";
  document.getElementById("automaticoIntensidad").style.display = "block";
  document.getElementById("manual").style.display = "none";

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/modoAutomaticoIntensidad", true);
  xhttp.send();
}

function modoConjunto(){
  document.getElementById("automatico").style.display = "block";
  document.getElementById("automaticoHorario").style.display = "block";
  document.getElementById("automaticoIntensidad").style.display = "block";
  document.getElementById("manual").style.display = "block";

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/modoConjunto", true);
  xhttp.send();
}

function modoShutdown(){
  var flag = document.getElementById("onoff").innerText;
  console.log(flag);
  if(flag === "Apagar"){
    document.getElementById("nav").style.position = "fixed";
    document.getElementById("nav").style.backdropFilter = "blur(5px)";
    document.getElementById("nav").style.backgroundColor = "#fa640080";
    document.getElementById("ucb").width = 500;
    document.getElementById("ucb").src = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flpz.ucb.edu.bo%2Fwp-content%2Fuploads%2F2021%2F04%2Flogo-ucb-colores-2.png&f=1&nofb=1&ipt=daab04e4fa3363ed24d046e7087fb7d1ac4f56b36bc7d6ced8be707364cb9e32&ipo=images";
    document.getElementById("onoff").textContent = "Encender";
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/modoApagado", true);
    xhttp.send();
  }else{
    document.getElementById("nav").style.position = "relative";
    document.getElementById("nav").style.backdropFilter = "blur(0px)";
    document.getElementById("nav").style.backgroundColor = "var(--primary-color)";
    document.getElementById("ucb").width = 275;
    document.getElementById("ucb").src = "https://secrad.lpz.ucb.edu.bo/wp-content/uploads/2019/05/logo1-e1617112271575.png";
    document.getElementById("onoff").textContent = "Apagar";
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/modoEncendido", true);
    xhttp.send();
  }
}

function test(){
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/test", true);
  xhttp.send();
}
