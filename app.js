const speechBox=document.getElementById('speech');
const robot=document.getElementById('robot');
const nameInput=document.getElementById('name');
const cont=document.getElementById('continue');
const voice=document.getElementById('voice');
const micState=document.getElementById('micState');
const audioBtn=document.getElementById('audioBtn');
const langBtn=document.getElementById('lang');
const menu={juega:document.getElementById('juega'),aprende:document.getElementById('aprende'),explora:document.getElementById('explora'),crece:document.getElementById('crece')};
let speaking=false;
let audioUnlocked=false;
let welcomePlayed=false;
try{speechSynthesis.addEventListener('voiceschanged',()=>speechSynthesis.getVoices())}catch(e){}
const allButtons=[cont,voice,audioBtn,langBtn,...Object.values(menu)];
function robotState(s=''){robot.className='robot '+s}
function lockButtons(lock){allButtons.forEach(b=>{b.disabled=lock;b.classList.toggle('disabled',lock)})}
function setSpeech(title,body){speechBox.innerHTML=`<strong>${title}</strong><span>${body}</span>`}
function pickRobotVoice(lang){const voices=speechSynthesis.getVoices();if(!voices.length)return null;const base=lang.toLowerCase().split('-')[0];const pool=voices.filter(v=>v.lang&&v.lang.toLowerCase().startsWith(base));const preferred=['jorge','juan','carlos','diego','daniel','miguel','pablo','alex','male','hombre','masculine'];const hit=pool.find(v=>preferred.some(k=>v.name.toLowerCase().includes(k)));return hit||pool[0]||null}
function say(text,lang='es-MX',rate=.9){return new Promise(resolve=>{
  if(!('speechSynthesis' in window)){resolve(false);return}
  speaking=true;lockButtons(true);robotState('talking');
  try{speechSynthesis.cancel();speechSynthesis.resume()}catch(e){}
  let done=false;
  const finish=(ok=true)=>{if(done)return;done=true;clearTimeout(timer);speaking=false;robotState('');lockButtons(false);resolve(ok)};
  const u=new SpeechSynthesisUtterance(text);
  u.lang=lang; u.rate=rate; u.pitch=.82;
  const voices=speechSynthesis.getVoices();
  const base=lang.toLowerCase().split('-')[0];
  const pool=voices.filter(v=>v.lang&&v.lang.toLowerCase().startsWith(base));
  const preferred=['jorge','juan','carlos','diego','daniel','miguel','pablo','alex','male','hombre','masculine'];
  const v=pool.find(x=>preferred.some(k=>x.name.toLowerCase().includes(k))) || pool[0];
  if(v)u.voice=v;
  u.onstart=()=>{micState.textContent='🔊 El robot está hablando…'};
  u.onend=()=>{micState.textContent='';finish(true)};
  u.onerror=()=>{micState.textContent='🔊 Toca “Escuchar al robot” para activar la voz.';finish(false)};
  const timer=setTimeout(()=>{micState.textContent='';finish(false)},Math.min(10000,Math.max(2200,text.length*78/rate)));
  // Safari/iPhone puede ignorar speak() inmediatamente después de cancel(); un pequeño retraso hace la reproducción más fiable.
  setTimeout(()=>{try{speechSynthesis.resume();speechSynthesis.speak(u)}catch(e){finish(false)}},80);
})}
function welcome(){setSpeech('¡Hola! 👋','Vamos a tener una gran aventura.<br>¿Cómo te llamas?');return say('¡Hola! Vamos a tener una gran aventura! ¡Qué emoción! Vamos a explorar y aprender juntos. ¿Cómo te llamas?')}

async function unlockAudio(){
  if(welcomePlayed) return;
  welcomePlayed=true; audioUnlocked=true;
  await welcome();
}

// En iPhone/Safari el audio necesita un gesto del usuario. El primer toque hace el intento;
// además dejamos un botón explícito para volver a reproducirlo si Safari lo bloquea.
function firstInteraction(e){
  if(welcomePlayed) return;
  const target=e.target.closest('button,input,select,a');
  if(target && target.id==='audioBtn') return;
  unlockAudio();
}
document.addEventListener('pointerdown', firstInteraction, true);

async function menuAction(id){if(speaking)return;const texts={juega:['🎮 ¡Sí!','Vamos a jugar y divertirnos juntos.'],aprende:['📚 ¡Sí!','Vamos a aprender cosas nuevas.'],explora:['🧭 ¡Vamos!','Vamos a explorar este mundo mágico.'],crece:['🌱 ¡Eso es!','Vamos a crecer, descubrir y aprender cada día.']};const [t,b]=texts[id];setSpeech(t,b);await say(b.replace(/<br>/g,' '))}
Object.keys(menu).forEach(id=>menu[id].onclick=()=>menuAction(id));
langBtn.onclick=async()=>{if(speaking)return;setSpeech('🌎 Idiomas','Pronto podrás elegir tu idioma de aventura.');await say('Aquí podrás elegir el idioma que quieres aprender. ¡Pronto tendremos muchos idiomas!')}
cont.onclick=async()=>{if(speaking)return;const n=nameInput.value.trim();if(!n){setSpeech('👋 ¡Cuéntame tu nombre!','Escribe tu nombre o usa el botón del micrófono.');await say('¿Cómo te llamas? Puedes escribir tu nombre o decírmelo con el micrófono.');return}setSpeech(`¡Guau, ${n}! 🤩`,'¡Qué alegría conocerte!');await say(`¡Guau, ${n}! ¡Qué alegría conocerte! Vamos a comenzar nuestra aventura.`)};
audioBtn.onclick=async()=>{if(speaking)return;welcomePlayed=true;audioUnlocked=true;await welcome()};
voice.onclick=()=>{if(speaking)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){micState.textContent='🎙️ Este navegador no permite reconocer la voz. Puedes escribir tu nombre.';return}const r=new SR();r.lang='es-MX';r.continuous=false;r.interimResults=false;r.maxAlternatives=5;micState.textContent='🟢 Micrófono activado. ¡Ahora puedes hablar!';voice.disabled=true;robotState('listening');r.onresult=e=>{const t=e.results[0][0].transcript.trim();nameInput.value=t;micState.textContent='';setSpeech(`¡Guau, ${t}! 🤩`,'¡Qué alegría conocerte!');robotState('excited');say(`¡Guau, ${t}! ¡Qué alegría conocerte! Vamos a comenzar nuestra aventura.`)};r.onerror=e=>{robotState('');voice.disabled=false;micState.textContent=e.error==='not-allowed'?'🎙️ Permite el micrófono en Safari.':'No pude escucharte. Puedes intentarlo otra vez.'};r.onend=()=>{robotState('');voice.disabled=false};try{r.start()}catch(e){robotState('');voice.disabled=false;micState.textContent='Puedes intentarlo otra vez.'}};
// No intentamos reproducir audio automáticamente aquí: Safari/iPhone puede bloquearlo.
// La bienvenida se reproduce con el primer toque del usuario mediante unlockAudio().
