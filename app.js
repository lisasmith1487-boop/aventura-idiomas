const robot=document.getElementById("robot");
const nameInput=document.getElementById("name");
const live=document.getElementById("live");
let speaking=false;

function robotState(s){robot.className="robot "+(s||"")}
function say(text,lang="es-MX",rate=.92){
 return new Promise(resolve=>{
  live.textContent=text;
  if(!("speechSynthesis" in window)){resolve();return}
  speaking=true;robotState("talking");speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate;u.pitch=1.08;
  let done=false;
  const finish=()=>{if(done)return;done=true;speaking=false;robotState("");resolve()};
  u.onend=finish;u.onerror=finish;speechSynthesis.speak(u);
  setTimeout(finish,Math.min(9000,Math.max(1800,text.length*70/rate)));
 });
}
setTimeout(()=>say("¡Hola! Vamos a tener una gran aventura. ¡Qué emoción! Vamos a explorar un mundo lleno de aventuras y aprender idiomas juntos. ¿Cómo te llamas?"),300);

document.getElementById("continue").onclick=async()=>{
 if(speaking)return;
 const n=nameInput.value.trim();
 if(!n){robotState("excited");await say("¡Hola, pequeño explorador! ¿Cómo te llamas?");nameInput.focus();return}
 robotState("excited");await say("¡Guau, "+n+"! ¡Qué alegría conocerte! Vamos a comenzar nuestra aventura.");
};
document.getElementById("voice").onclick=()=>{
 if(speaking)return;
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){say("Puedes escribir tu nombre en el recuadro.");return}
 const r=new SR();r.lang="es-MX";r.continuous=false;r.interimResults=false;r.maxAlternatives=5;
 r.onresult=e=>{const t=e.results[0][0].transcript.trim();nameInput.value=t;say("¡Guau, "+t+"! ¡Qué alegría conocerte! Vamos a comenzar nuestra aventura.")};
 r.onend=()=>robotState("");r.onerror=()=>robotState("");robotState("listening");try{r.start()}catch(e){robotState("")}
};
document.getElementById("juega").onclick=()=>say("¡Sí! Vamos a jugar.");
document.getElementById("aprende").onclick=()=>say("¡Sí! Vamos a aprender.");
document.getElementById("explora").onclick=()=>say("¡Sí! Vamos a explorar.");
document.getElementById("crece").onclick=()=>say("¡Sí! Vamos a crecer y descubrir cosas nuevas.");
document.getElementById("lang").onclick=()=>say("Aquí elegiremos el idioma de nuestra aventura.");
