const apiKey = '0fc34377c3d4d58c829a0907b8a6d7ed';
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=La Paz,BO&appid=${apiKey}&units=metric`;
const timeUrl = 'https://worldtimeapi.org/api/ip';

const calentar = document.getElementById("calentar");
const enfriar = document.getElementById("enfriar");

window.onload = function() {
  modoManual();
};

function intensidad_senal(intensidad){
  let wifi = document.getElementById("wifi");
  let paths = wifi.getElementsByTagName("path");
  if (intensidad > -40){
    for (let i = 0; i < paths.length; i++) {
      paths[i].setAttribute("fill", "#000000");
    }
  }else if(intensidad > -53 && intensidad <= -40){
    for (let i = 0; i < paths.length; i++) {
      if(parseInt(paths[i].getAttribute("id")) <= 66){
        paths[i].setAttribute("fill", "#000000");
      }else{
        paths[i].setAttribute("fill", "#f16023");
      }
    }
  }else if(intensidad <= -53 ){
    for (let i = 0; i < paths.length; i++) {
      if(parseInt(paths[i].getAttribute("id")) <= 33){
        paths[i].setAttribute("fill", "#000000");
      }else{
        paths[i].setAttribute("fill", "#f16023");
      }
    }
  }
}

function switch_calentar(){
  let paths = horno.getElementsByTagName("path");
  let color = paths[0].getAttribute("fill") == "#ff1200" ? "#000000" : "#ff1200";
  for (let i = 0; i < paths.length; i++) {
    paths[i].setAttribute("fill", color);
  }
  //Encender o apagar el horno llamando al servidor ESP32
  calentar_horno();
}

function switch_enfriar(){
  let paths = enfriar.getElementsByTagName("path");
  let color = paths[0].getAttribute("stroke") == "#0000aa" ? "#000000" : "#0000aa";
  for (let i = 0; i < paths.length; i++) {
    paths[i].setAttribute("stroke", color);
  }
  //Encender o apagar el horno llamando al servidor ESP32
  enfriar_horno();
}

function apagar_horno(){
  let paths = calentar.getElementsByTagName("path");
  for (let i = 0; i < paths.length; i++) {
    paths[i].setAttribute("fill", "#000000");
  }
}

function encender_horno(){
  let paths = calentar.getElementsByTagName("path");
  for (let i = 0; i < paths.length; i++) {
    paths[i].setAttribute("fill", "#ff1200");
  }
}

function apagar_ventilador(){
  let paths = enfriar.getElementsByTagName("path");
  for (let i = 0; i < paths.length; i++) {
    paths[i].setAttribute("stroke", "#000000");
  }
}

function encender_ventilador(){
  let paths = enfriar.getElementsByTagName("path");
  for (let i = 0; i < paths.length; i++) {
    paths[i].setAttribute("stroke", "#0000aa");
  }
}

enfriar.addEventListener("click", switch_enfriar);

calentar.addEventListener("click", switch_calentar);

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

function encender_horno_servidor(){
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/encender_horno", true);
  xhttp.send();
}

function apagar_horno_servidor(){
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/apagar_horno", true);
  xhttp.send();
}

async function encender_por_tiempo(){
  value = document.getElementById("tiempo").value;
  encender_horno_servidor();
  encender_horno();
  await new Promise(resolve => setTimeout(resolve, value*1000*60));
  apagar_horno_servidor();
  apagar_horno();
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

      if (enHours === hours && enMinutes === minutes) {
        encender_horno_servidor();
        console.log("Encendiendo foco");
        encender_horno();
      } else if (apHours === hours && apMinutes === minutes) {
        apagar_horno_servidor();
        console.log("Apagando foco");
        apagar_horno();
      }
    }
}

getWeatherData();
/* call getTimeData every second */
setInterval(getTimeData, 1000);

var chartADC = new Highcharts.Chart({
  chart:{ renderTo:'chart-Temperatura' },
  title: { text: 'Temperatura' },
  series: [{
    showInLegend: false,
    data: []
  }],
  plotOptions: {
    line: { animation: false,
      dataLabels: { enabled: true }
    },
    series: { color: '#18009c' }
  },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: { second:'%S' }
  },
  yAxis: {
    title: { text: 'Datos del sensor LM35' }
  },
  credits: { enabled: false }
});

var chartHorno = new Highcharts.Chart({
  chart:{ renderTo:'chart-Horno' },
  title: { text: 'Horno' },
  series: [{
    showInLegend: false,
    data: []
  }],
  plotOptions: {
    line: { animation: false,
      dataLabels: { enabled: true }
    },
    series: { color: '#18009c' }
  },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: { second:'%S' }
  },
  yAxis: {
    title: { text: 'Estado del horno' }
  },
  credits: { enabled: false }
});

var chartVentilador = new Highcharts.Chart({
  chart:{ renderTo:'chart-Ventilador' },
  title: { text: 'Ventilador' },
  series: [{
    showInLegend: false,
    data: []
  }],
  plotOptions: {
    line: { animation: false,
      dataLabels: { enabled: true }
    },
    series: { color: '#18009c' }
  },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: { second:'%S' }
  },
  yAxis: {
    title: { text: 'Estado del ventilador' }
  },
  credits: { enabled: false }
});

async function getServerStatus(){
  await fetch('/get_status')
  .then(response => response.json())
  .then(data => {
    // si el valor de 'ventilador' es 'ON' se pinta el svg con id enfriar de color azul
    if(data.ventilador === 'ON'){
      encender_ventilador();
    }else{
      apagar_ventilador();
    }

    if(data.horno === 'ON'){
      encender_horno();
    }else{
      apagar_horno();
    }

    intensidad_senal(data.rssi);

    var xh = (new Date()).getTime(), // current time
    yh = data.horno === "ON"? 1: 0;

    var xv = (new Date()).getTime(), // current time
    yv = data.ventilador === "ON"? 1: 0;

    var x = (new Date()).getTime(), // current time
    y = parseInt(data.temperatura);

    if(chartADC.series[0].data.length > 40) {
      chartADC.series[0].addPoint([x, y], true, true, true);
    } else {
      chartADC.series[0].addPoint([x, y], true, false, true);
    }

    if(chartHorno.series[0].data.length > 40) {
      chartHorno.series[0].addPoint([xh, yh], true, true, true);
    } else {
      chartHorno.series[0].addPoint([xh, yh], true, false, true);
    }

    if(chartVentilador.series[0].data.length > 40) {
      chartVentilador.series[0].addPoint([xv, yv], true, true, true);
    }else {
      chartVentilador.series[0].addPoint([xv, yv], true, false, true);
    }

  })
  .catch(error => {
    console.error('Error:', error);
  });
}

setInterval(getServerStatus, 500);

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

  /*var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/modoAutomaticoHorario", true);
  xhttp.send();*/
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
    document.getElementById("charts").style.display = "none";
    
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
    document.getElementById("charts").style.display = "block";

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