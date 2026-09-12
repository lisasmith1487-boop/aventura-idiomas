const nameInput=document.getElementById("name");
const cont=document.getElementById("continue");
const voice=document.getElementById("voice");
const speechLive=document.getElementById("speechLive");
const micState=document.getElementById("micState");

let speaking=false;

function say(text,lang="es-MX",rate=.92){
  return new Promise(resolve=>{
    speechLive.textContent=text;
    if(!("speechSynthesis" in window)){resolve();return}
    speaking=true;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=lang;u.rate=rate;u.pitch=1.08;
    let done=false;
    const finish=()=>{if(done)return;done=true;speaking=false;resolve()};
    u.onend=finish;u.onerror=finish;
    speechSynthesis.speak(u);
    setTimeout(finish,Math.min(9000,Math.max(1800,text.length*70/rate)));
  });
}

window.addEventListener("load",()=>setTimeout(()=>{
  say("¡Hola! Vamos a tener una gran aventura. ¡Qué emoción! Vamos a explorar un mundo lleno de aventuras y aprender idiomas juntos. ¿Cómo te llamas?");
},250));

cont.addEventListener("click",async()=>{
  if(speaking)return;
  const n=nameInput.value.trim();
  if(!n){
    await say("¡Hola, pequeño explorador! ¿Cómo te llamas?");
    nameInput.focus();
    return;
  }
  await say("¡Guau, "+n+"! ¡Qué alegría conocerte! Vamos a comenzar nuestra aventura.");
});

voice.addEventListener("click",()=>{
  if(speaking)return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    micState.textContent="El navegador no permite reconocimiento de voz. Puedes escribir tu nombre.";
    return;
  }
  const r=new SR();
  r.lang="es-MX";r.continuous=false;r.interimResults=false;r.maxAlternatives=5;
  micState.textContent="Micrófono activado. Ahora puedes hablar.";
  voice.disabled=true;
  r.onresult=e=>{
    const t=e.results[0][0].transcript.trim();
    nameInput.value=t;
    say("¡Guau, "+t+"! ¡Qué alegría conocerte! Vamos a comenzar nuestra aventura.");
  };
  r.onerror=e=>{
    micState.textContent=e.error==="not-allowed"
      ?"El micrófono está bloqueado. Permite el micrófono en Safari."
      :"No pude escucharte. Puedes intentarlo otra vez.";
    voice.disabled=false;
  };
  r.onend=()=>{voice.disabled=false};
  try{r.start()}catch(e){voice.disabled=false}
});

// Los menús quedan preparados para las siguientes pantallas.
document.getElementById("playHotspot").onclick=()=>say("¡Vamos a jugar!");
document.getElementById("learnHotspot").onclick=()=>say("¡Vamos a aprender!");
document.getElementById("exploreHotspot").onclick=()=>say("¡Vamos a explorar!");
document.getElementById("growHotspot").onclick=()=>say("¡Vamos a crecer y descubrir cosas nuevas!");
document.getElementById("languageHotspot").onclick=()=>say("Aquí podremos elegir el idioma de nuestra aventura.");
