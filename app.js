const speechBox=document.getElementById('speech');
const robot=document.getElementById('robot');
const nameInput=document.getElementById('name');
const cont=document.getElementById('continue');
const voice=document.getElementById('voice');
const micState=document.getElementById('micState');
const langBtn=document.getElementById('lang');
const menu={juega:document.getElementById('juega'),aprende:document.getElementById('aprende'),explora:document.getElementById('explora'),crece:document.getElementById('crece')};
let speaking=false;
const allButtons=[cont,voice,langBtn,...Object.values(menu)];
function robotState(s=''){robot.className='robot '+s}
function lockButtons(lock){allButtons.forEach(b=>{b.disabled=lock;b.classList.toggle('disabled',lock)})}
function setSpeech(title,body){speechBox.innerHTML=`<strong>${title}</strong><span>${body}</span>`}
function say(text,lang='es-MX',rate=.9){return new Promise(resolve=>{if(!('speechSynthesis'in window)){resolve();return} speaking=true;lockButtons(true);robotState('talking');speechSynthesis.cancel();let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);speaking=false;robotState('');lockButtons(false);resolve()};const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate;u.pitch=1.08;u.onend=finish;u.onerror=finish;speechSynthesis.speak(u);const timer=setTimeout(finish,Math.min(8500,Math.max(1800,text.length*72/rate)))})}
function welcome(){setSpeech('¡Hola! 👋','Vamos a tener una gran aventura.<br>¿Cómo te llamas?');say('¡Hola! Vamos a tener una gran aventura! ¡Qué emoción! Vamos a explorar y aprender juntos. ¿Cómo te llamas?')}
async function menuAction(id){if(speaking)return;const texts={juega:['🎮 ¡Sí!','Vamos a jugar y divertirnos juntos.'],aprende:['📚 ¡Sí!','Vamos a aprender cosas nuevas.'],explora:['🧭 ¡Vamos!','Vamos a explorar este mundo mágico.'],crece:['🌱 ¡Eso es!','Vamos a crecer, descubrir y aprender cada día.']};const [t,b]=texts[id];setSpeech(t,b);await say(b.replace(/<br>/g,' '))}
Object.keys(menu).forEach(id=>menu[id].onclick=()=>menuAction(id));
langBtn.onclick=async()=>{if(speaking)return;setSpeech('🌎 Idiomas','Pronto podrás elegir tu idioma de aventura.');await say('Aquí podrás elegir el idioma que quieres aprender. ¡Pronto tendremos muchos idiomas!')}
cont.onclick=async()=>{if(speaking)return;const n=nameInput.value.trim();if(!n){setSpeech('👋 ¡Cuéntame tu nombre!','Escribe tu nombre o usa el botón del micrófono.');await say('¿Cómo te llamas? Puedes escribir tu nombre o decírmelo con el micrófono.');return}setSpeech(`¡Guau, ${n}! 🤩`,'¡Qué alegría conocerte!');await say(`¡Guau, ${n}! ¡Qué alegría conocerte! Vamos a comenzar nuestra aventura.`)};
voice.onclick=()=>{if(speaking)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){micState.textContent='🎙️ Este navegador no permite reconocer la voz. Puedes escribir tu nombre.';return}const r=new SR();r.lang='es-MX';r.continuous=false;r.interimResults=false;r.maxAlternatives=5;micState.textContent='🟢 Micrófono activado. ¡Ahora puedes hablar!';voice.disabled=true;robotState('listening');r.onresult=e=>{const t=e.results[0][0].transcript.trim();nameInput.value=t;micState.textContent='';setSpeech(`¡Guau, ${t}! 🤩`,'¡Qué alegría conocerte!');robotState('excited');say(`¡Guau, ${t}! ¡Qué alegría conocerte! Vamos a comenzar nuestra aventura.`)};r.onerror=e=>{robotState('');voice.disabled=false;micState.textContent=e.error==='not-allowed'?'🎙️ Permite el micrófono en Safari.':'No pude escucharte. Puedes intentarlo otra vez.'};r.onend=()=>{robotState('');voice.disabled=false};try{r.start()}catch(e){robotState('');voice.disabled=false;micState.textContent='Puedes intentarlo otra vez.'}};
welcome();
