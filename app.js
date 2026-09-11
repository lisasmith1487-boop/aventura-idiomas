
const screen = document.getElementById("screen");
const step = document.getElementById("step");
const toast = document.getElementById("toast");
const replay = document.getElementById("replay");

const state = {
  name: localStorage.getItem("name") || "",
  age: localStorage.getItem("age") || "",
  character: localStorage.getItem("character") || "",
  language: localStorage.getItem("language") || ""
};

const chars = [
  ["👧","Niña","girl"],["👦","Niño","boy"],["🐶","Perrito","dog"],
  ["🤖","Robot","robot"],["🧚","Fantasía","fairy"],["🐱","Gatito","cat"]
];

function toastMsg(t){toast.textContent=t;toast.style.display="block";setTimeout(()=>toast.style.display="none",2600)}

let lastSpeech = {text:"",lang:"es-MX"};
let speechQueue = Promise.resolve();

function speak(text, lang="es-MX", rate=.88){
  lastSpeech={text,lang};
  speechQueue = speechQueue.then(()=>new Promise(resolve=>{
    if(!("speechSynthesis" in window)){resolve();return}
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=lang; u.rate=rate; u.pitch=(state.character==="robot"?1.28:1.12);
    const voices=speechSynthesis.getVoices();
    const exact=voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase());
    const family=voices.find(v=>v.lang.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));
    if(exact)u.voice=exact; else if(family)u.voice=family;
    u.onend=()=>setTimeout(resolve,220); u.onerror=()=>resolve();
    speechSynthesis.speak(u);
  }));
  return speechQueue;
}
replay.onclick=()=>{if(lastSpeech.text){speechQueue=Promise.resolve();speak(lastSpeech.text,lastSpeech.lang,.88)}};

function companion(){
  return (chars.find(c=>c[2]===state.character)||chars[3])[0];
}
function header(t){step.textContent=t}
function save(){localStorage.setItem("name",state.name);localStorage.setItem("age",state.age);localStorage.setItem("character",state.character);localStorage.setItem("language",state.language)}

function listen(onResult, lang="es-MX"){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return false;
  const r=new SR(); r.lang=lang;r.interimResults=false;r.maxAlternatives=3;
  let done=false;
  r.onresult=e=>{done=true;onResult(Array.from(e.results[0]).map(x=>x.transcript).join(" "))}
  r.onerror=()=>{if(!done)toastMsg("No pude escucharte. Inténtalo otra vez o usa el teclado.");}
  r.onend=()=>{};
  try{r.start();return true}catch(e){return false}
}

function intro(){
  header("🌎 Bienvenido");
  screen.innerHTML=`<div class="card"><div class="world"><div class="planet">🌎</div><div class="companion">${companion()}</div></div>
    <div class="bubble">¡Hola! 👋 Soy tu amiguito. Vamos a explorar un mundo lleno de aventuras y aprender idiomas juntos.</div>
    <button class="btn primary" id="start">✨ ¡Comenzar aventura!</button></div>`;
  speak(`¡Hola! Soy tu amiguito. Vamos a explorar un mundo lleno de aventuras y aprender idiomas juntos. ¿Listo para comenzar?`);
  document.getElementById("start").onclick=()=>nameScreen();
}

function nameScreen(){
  header("👤 Tu nombre");
  screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span>
    <div class="bubble">¿Cómo te llamas?</div><button class="btn primary" id="mic">🎙️ Decírmelo</button>
    <input class="input" id="nameInput" placeholder="O escribe tu nombre">
    <button class="btn" id="next">Continuar</button><div class="hint">La voz es opcional si tu navegador no la permite.</div></div>`;
  speak("¿Cómo te llamas?");
  document.getElementById("mic").onclick=()=>listen(t=>{state.name=t.trim();document.getElementById("nameInput").value=state.name;welcomeName()}, "es-MX");
  document.getElementById("next").onclick=()=>{const v=document.getElementById("nameInput").value.trim();if(v){state.name=v;welcomeName()}else toastMsg("Dime tu nombre primero 😊")};
}
function welcomeName(){
  save(); speak(`¡Excelente, ${state.name}! Qué bonito nombre.`).then(()=>ageScreen());
}
function ageScreen(){
  header("🎂 Tu edad");
  screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span>
  <div class="bubble">¿Cuántos años tienes?</div><button class="btn primary" id="micAge">🎙️ Decírmelo</button>
  <input class="input" id="ageInput" inputmode="numeric" placeholder="3, 4, 5...">
  <button class="btn" id="ageNext">Continuar</button></div>`;
  speak("¿Cuántos años tienes?");
  const accept=v=>{const m=String(v).match(/[1-9]|10/);if(m){state.age=m[0];save();speak(`¡Excelente, ${state.name}! Tienes ${state.age} años.`).then(characterScreen)}else toastMsg("Dime un número del 1 al 10.")};
  document.getElementById("micAge").onclick=()=>listen(accept,"es-MX");
  document.getElementById("ageNext").onclick=()=>accept(document.getElementById("ageInput").value);
}
function characterScreen(){
  header("🧸 Tu compañero");
  screen.innerHTML=`<div class="card"><div class="bubble">Elige a tu amiguito para la aventura</div><div class="grid">${
    chars.map(c=>`<button class="btn choice" data-c="${c[2]}">${c[0]}<br>${c[1]}</button>`).join("")
  }</div></div>`;
  speak(`Ahora elige a tu compañero. Él te acompañará durante toda la aventura.`);
  document.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{state.character=b.dataset.c;save();speak(`¡Excelente elección! Ahora vamos a elegir nuestro idioma.`).then(languageScreen)});
}
function languageScreen(){
  header("🌐 Elige un idioma");
  const langs=[["🇺🇸","English","en"],["🇫🇷","Français","fr"],["🇩🇪","Deutsch","de"],["🇮🇹","Italiano","it"],["🇵🇹","Português","pt"]];
  screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¿En qué idioma quieres vivir tu aventura?</div><div class="grid">${
    langs.map(l=>`<button class="btn choice" data-l="${l[1]}">${l[0]}<br>${l[1]}</button>`).join("")
  }</div></div>`;
  speak("¿En qué idioma quieres vivir tu aventura? Elige uno.");
  document.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{state.language=b.dataset.l;save(); if(state.language==="English")topicScreen(); else unsupportedLanguage()});
}
function unsupportedLanguage(){
  screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¡Muy bien! Elegiste ${state.language}. 🌎</div>
  <p>Esta primera aventura de prueba está preparada en English. Pronto podremos añadir este idioma con su propia aventura.</p>
  <button class="btn primary" id="english">Probar English 🇺🇸</button></div>`;
  speak(`¡Muy bien! Elegiste ${state.language}. Esta primera aventura está preparada en English. Pronto podremos añadir este idioma con su propia aventura.`);
  document.getElementById("english").onclick=()=>{state.language="English";save();topicScreen()};
}
function topicScreen(){
  header("📚 Tu aventura");
  screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¡Vamos a aprender colores en English!</div><div class="world"><div class="planet">🌎</div><div class="companion">${companion()}</div></div><button class="btn primary" id="go">🚪 Entrar a la aventura</button></div>`;
  speak("¡Vamos a aprender colores en English! Prepárate para nuestra aventura.");
  document.getElementById("go").onclick=forestScreen;
}
function forestScreen(){
  header("🌲 El bosque mágico");
  screen.innerHTML=`<div class="card"><div class="world"><div class="planet">🌎</div><div class="companion">${companion()}</div><div class="bubble">🌳 ✨ 🚪 ✨ 🌳</div></div>
  <div class="bubble">Hay algo especial detrás de esa puerta...</div><button class="btn primary" id="door">🚪 ¡Vamos!</button></div>`;
  speak(`¡Mira, ${state.name}! Llegamos al bosque mágico. Hay una puerta misteriosa. ¿Entramos?`);
  document.getElementById("door").onclick=appleScreen;
}
function appleScreen(){
  header("🍎 Descubrimos una palabra");
  screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="red">🍎</div>
  <div class="bubble">¡Mira, ${state.name}! Encontré una manzana. La manzana es roja.</div>
  <button class="btn primary" id="hear">🔊 Escuchar RED</button><div id="lesson" class="bubble">En inglés, rojo se dice...</div></div>`;
  speak(`¡Mira, ${state.name}! Encontré una manzana. La manzana es roja. En inglés, rojo se dice...`)
    .then(()=>speak("Red","en-US",.82));
  document.getElementById("hear").onclick=()=>speak("Red","en-US",.82);
  setTimeout(()=>{const b=document.createElement("button");b.className="btn";b.textContent="➡️ Seguir";b.onclick=repeatScreen;document.querySelector(".card").appendChild(b)},1200);
}
function repeatScreen(){
  header("🗣️ Ahora tú");
  screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">Ahora tú. ¡Dilo conmigo!</div><div class="red">RED</div>
  <button class="btn primary" id="say">🎙️ Decir RED</button><button class="btn" id="keyboard">⌨️ Escribir respuesta</button>
  <p id="result" class="hint">Toca el micrófono y di “Red”.</p></div>`;
  speak("Ahora tú. ¡Dilo conmigo! Red.", "es-MX", .88).then(()=>speak("Red","en-US",.82));
  const check=t=>{
    const clean=t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    if(clean.includes("red")){document.getElementById("result").textContent="¡Sí! Dijiste RED. 🎉";speak("¡Sííí! ¡RED! ¡Lo dijiste muy bien!").then(gameScreen)}
    else{document.getElementById("result").textContent=`Escuché: ${t}. Vamos otra vez.`;speak("¡Casi! Vamos otra vez. Escucha: Red.", "es-MX").then(()=>speak("Red","en-US",.82))}
  };
  document.getElementById("say").onclick=()=>{const ok=listen(check,"en-US");if(!ok)toastMsg("El reconocimiento de voz no está disponible aquí. Puedes usar “Escribir respuesta”.")};
  document.getElementById("keyboard").onclick=()=>{const v=prompt("Escribe lo que dijiste:");if(v)check(v)};
}
function gameScreen(){
  header("🎮 ¡A jugar!");
  const objs=[["🍎",1],["❤️",1],["🍓",1],["🦋",0],["🍌",0],["🌳",0]];
  screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¡Busca 3 cosas RED! Tócalas.</div><div class="objectgrid">${
    objs.map((o,i)=>`<button class="btn object" data-red="${o[1]}" data-i="${i}">${o[0]}</button>`).join("")
  }</div><p id="count" class="tag">0 / 3</p></div>`;
  speak("¡A jugar! Busca tres cosas que sean RED y tócalas.");
  let count=0;
  document.querySelectorAll(".object").forEach(b=>b.onclick=()=>{
    if(b.dataset.red==="1"&&!b.disabled){b.disabled=true;b.textContent="⭐";count++;document.getElementById("count").textContent=`${count} / 3`;speak(count===3?"¡Lo lograste! Ahora viene tu desafío.":"¡Sí! Eso es RED.");if(count===3)setTimeout(challengeScreen,800)}
    else speak("Ese no es RED. Busca otra cosa.");
  });
}
function challengeScreen(){
  header("🧠 Tu desafío");
  screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¿De qué color es la manzana?</div><div class="grid">
  <button class="btn choice" data-a="Blue">🔵<br>Blue</button><button class="btn choice" data-a="Red">🔴<br>Red</button><button class="btn choice" data-a="Yellow">🟡<br>Yellow</button></div></div>`;
  speak(`Último desafío, ${state.name}. ¿De qué color es la manzana?`);
  document.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{if(b.dataset.a==="Red"){speak("¡Correcto! La manzana es RED.").then(rewardScreen)}else speak("Mmm, inténtalo otra vez. Mira la manzana.")});
}
function rewardScreen(){
  header("⭐ ¡Aventura completada!");
  screen.innerHTML=`<div class="card"><div class="success">🏆</div><span class="companion">${companion()}</span>
  <div class="bubble">¡Aventura completada, ${state.name}!</div><div class="red">RED</div><p class="tag">⭐ ¡Aprendido!</p><br><button class="btn primary" id="again">🔁 Jugar otra vez</button></div>`;
  speak(`¡Aventura completada, ${state.name}! ¡Aprendiste RED! Estoy muy orgulloso de ti.`);
  document.getElementById("again").onclick=appleScreen;
}

intro();
