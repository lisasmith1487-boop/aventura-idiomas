const speechBox=document.getElementById('speech');
const robot=document.getElementById('robot');
const nameInput=document.getElementById('name');
const cont=document.getElementById('continue');
const voice=document.getElementById('voice');
const micState=document.getElementById('micState');
const audioBtn=document.getElementById('audioBtn');
const langBtn=document.getElementById('lang');
const nameCard=document.getElementById('nameCard');
const flow=document.getElementById('flow');
const flowStep=document.getElementById('flowStep');
const flowTitle=document.getElementById('flowTitle');
const flowText=document.getElementById('flowText');
const choices=document.getElementById('choices');
const flowNext=document.getElementById('flowNext');
const flowBack=document.getElementById('flowBack');
const menu={juega:document.getElementById('juega'),aprende:document.getElementById('aprende'),explora:document.getElementById('explora'),crece:document.getElementById('crece')};
let speaking=false,audioUnlocked=false,welcomePlayed=false;
let profile={name:'',companion:null,language:null,topic:null};
let flowIndex=0;
const steps=[
 {key:'companion',title:'Elige tu compañero',text:'Tu amiguito te acompañará durante la aventura.',items:[['girl','👧','Niña'],['boy','👦','Niño'],['animal','🐶','Animal'],['robot','🤖','Robot'],['fantasy','🧚','Fantasía'],['pet','🐱','Mascota']]},
 {key:'language',title:'Elige el idioma',text:'En cada aventura aprenderemos un solo idioma.',items:[['en','🇬🇧','English'],['fr','🇫🇷','Français'],['de','🇩🇪','Deutsch'],['it','🇮🇹','Italiano'],['pt','🇵🇹','Português'],['ja','🇯🇵','日本語']]},
 {key:'topic',title:'Elige tu aventura',text:'Comenzaremos con una aventura divertida.',items:[['colors','🎨','Colores'],['animals','🐾','Animales'],['numbers','🔢','Números'],['food','🍎','Comida'],['family','👨‍👩‍👧','Familia'],['stories','📖','Historias']]}
];
try{speechSynthesis.addEventListener('voiceschanged',()=>speechSynthesis.getVoices())}catch(e){}
const allButtons=[cont,voice,audioBtn,langBtn,...Object.values(menu)];
function robotState(s=''){robot.className='robot '+s}
function lockButtons(lock){allButtons.forEach(b=>{b.disabled=lock;b.classList.toggle('disabled',lock)})}
function setSpeech(title,body){speechBox.innerHTML=`<strong>${title}</strong><span>${body}</span>`}
function say(text,lang='es-MX',rate=.9){return new Promise(resolve=>{
 if(!('speechSynthesis' in window)){resolve(false);return}
 speaking=true;lockButtons(true);robotState('talking');
 try{speechSynthesis.cancel();speechSynthesis.resume()}catch(e){}
 let done=false;let timer;
 const finish=(ok=true)=>{if(done)return;done=true;clearTimeout(timer);speaking=false;robotState('');lockButtons(false);resolve(ok)};
 const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate;u.pitch=.82;
 const voices=speechSynthesis.getVoices();const base=lang.toLowerCase().split('-')[0];
 const pool=voices.filter(v=>v.lang&&v.lang.toLowerCase().startsWith(base));
 const preferred=['jorge','juan','carlos','diego','daniel','miguel','pablo','alex','male','hombre','masculine'];
 const v=pool.find(x=>preferred.some(k=>x.name.toLowerCase().includes(k)))||pool[0];if(v)u.voice=v;
 u.onstart=()=>{micState.textContent='🔊 El robot está hablando…'};u.onend=()=>{micState.textContent='';finish(true)};
 u.onerror=()=>{micState.textContent='🔊 Toca “Escuchar al robot” para activar la voz.';finish(false)};
 timer=setTimeout(()=>{micState.textContent='';finish(false)},Math.min(10000,Math.max(2200,text.length*78/rate)));
 setTimeout(()=>{try{speechSynthesis.resume();speechSynthesis.speak(u)}catch(e){finish(false)}},80);
})}
function welcome(){setSpeech('¡Hola! 👋','Vamos a tener una gran aventura.<br>¿Cómo te llamas?');return say('¡Hola! Vamos a tener una gran aventura! ¡Qué emoción! Vamos a explorar y aprender juntos. ¿Cómo te llamas?')}
async function unlockAudio(){if(welcomePlayed)return;welcomePlayed=true;audioUnlocked=true;await welcome()}
function firstInteraction(e){if(welcomePlayed)return;const target=e.target.closest('button,input,select,a');if(target&&target.id==='audioBtn')return;unlockAudio()}
document.addEventListener('pointerdown',firstInteraction,true);
async function menuAction(id){if(speaking)return;const texts={juega:['🎮 ¡Sí!','Vamos a jugar y divertirnos juntos.'],aprende:['📚 ¡Sí!','Vamos a aprender cosas nuevas.'],explora:['🧭 ¡Vamos!','Vamos a explorar este mundo mágico.'],crece:['🌱 ¡Eso es!','Vamos a crecer, descubrir y aprender cada día.']};const [t,b]=texts[id];setSpeech(t,b);await say(b)}
Object.keys(menu).forEach(id=>menu[id].onclick=()=>menuAction(id));
langBtn.onclick=async()=>{if(speaking)return;setSpeech('🌎 Idiomas','Aquí podrás elegir el idioma de tu aventura.');await say('Aquí podrás elegir el idioma que quieres aprender. En cada aventura usaremos un solo idioma.')};
function openFlow(){nameCard.classList.add('hidden');flow.classList.remove('hidden');flowIndex=0;renderStep()}
function renderStep(){const s=steps[flowIndex];flowStep.textContent=`${flowIndex+1} de ${steps.length}`;flowTitle.textContent=s.title;flowText.textContent=s.text;flowNext.disabled=!profile[s.key];flowNext.classList.toggle('ready',!!profile[s.key]);choices.innerHTML='';s.items.forEach(([value,emoji,label])=>{const b=document.createElement('button');b.className='choice'+(profile[s.key]===value?' selected':'');b.innerHTML=`<span class="emoji">${emoji}</span><span class="label">${label}</span>`;b.onclick=()=>selectChoice(value,label);choices.appendChild(b)});flowBack.style.visibility=flowIndex===0?'hidden':'visible';flowNext.textContent=flowIndex===steps.length-1?'Comenzar aventura →':'Continuar →'}
async function selectChoice(value,label){if(speaking)return;const s=steps[flowIndex];profile[s.key]=value;renderStep();setSpeech(`✨ ${label}`,`¡Excelente elección, ${profile.name}!`);await say(`¡Excelente elección, ${profile.name}! Has elegido ${label}.`)}
cont.onclick=async()=>{if(speaking)return;const n=nameInput.value.trim();if(!n){setSpeech('👋 ¡Cuéntame tu nombre!','Escribe tu nombre o usa el botón del micrófono.');await say('¿Cómo te llamas? Puedes escribir tu nombre o decírmelo con el micrófono.');return}profile.name=n;setSpeech(`¡Guau, ${n}! 🤩`,'¡Qué alegría conocerte!');await say(`¡Guau, ${n}! ¡Qué alegría conocerte! Ahora vamos a elegir a tu compañero de aventura.`);openFlow()};
audioBtn.onclick=async()=>{if(speaking)return;welcomePlayed=true;audioUnlocked=true;await welcome()};
voice.onclick=()=>{if(speaking)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){micState.textContent='🎙️ Este navegador no permite reconocer la voz. Puedes escribir tu nombre.';return}const r=new SR();r.lang='es-MX';r.continuous=false;r.interimResults=false;r.maxAlternatives=5;micState.textContent='🟢 Micrófono activado. ¡Ahora puedes hablar!';voice.disabled=true;robotState('listening');r.onresult=e=>{const t=e.results[0][0].transcript.trim();nameInput.value=t;micState.textContent='';profile.name=t;setSpeech(`¡Guau, ${t}! 🤩`,'¡Qué alegría conocerte!');say(`¡Guau, ${t}! ¡Qué alegría conocerte! Ahora vamos a elegir a tu compañero de aventura.`).then(()=>openFlow())};r.onerror=e=>{robotState('');voice.disabled=false;micState.textContent=e.error==='not-allowed'?'🎙️ Permite el micrófono en Safari.':'No pude escucharte. Puedes intentarlo otra vez.'};r.onend=()=>{robotState('');voice.disabled=false};try{r.start()}catch(e){robotState('');voice.disabled=false;micState.textContent='Puedes intentarlo otra vez.'}};
flowBack.onclick=()=>{if(speaking)return;if(flowIndex===0){flow.classList.add('hidden');nameCard.classList.remove('hidden');return}flowIndex--;renderStep()};
flowNext.onclick=async()=>{if(speaking||flowNext.disabled)return;if(flowIndex<steps.length-1){flowIndex++;renderStep();const s=steps[flowIndex];setSpeech(`🌟 ${s.title}`,s.text);await say(s.key==='language'?'Ahora elige el idioma que quieres aprender. Recuerda: una aventura, un idioma.':'Ahora elige tu próxima aventura.');return}setSpeech('🎨 ¡Comienza la aventura!','Nuestro primer tema será Colores.');await say(`¡Perfecto, ${profile.name}! Comenzaremos con Colores. Vamos a descubrir nuestra primera palabra juntos.`);flowTitle.textContent='🎨 Primera aventura: Colores';flowText.textContent='Próximo paso: descubrir RED con tu compañero.';flowStep.textContent='¡Listos!';choices.innerHTML='<div class="first-lesson"><span>🍎</span><b>RED</b><small>Escuchar · Repetir · Jugar</small></div>';flowNext.textContent='Empezar Colores →';flowNext.disabled=false;flowNext.onclick=()=>{setSpeech('🍎 ¡Vamos!','En la próxima pantalla conoceremos nuestra primera palabra.');say(`¡Vamos, ${profile.name}! Nuestra aventura de Colores está por comenzar.`)};flowBack.style.visibility='visible'};
