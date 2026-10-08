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
let flowIndex=0, lessonReady=false;
const steps=[
 {key:'companion',title:'Elige a tu amigo',text:'Elige a tu amigo para esta aventura. Él te acompañará durante todo el camino.',items:[['girl','👧','Niña'],['boy','👦','Niño'],['animal','🐶','Animal'],['robot','🤖','Robot'],['fantasy','🧚','Fantasía'],['pet','🐱','Mascota']]},
 {key:'language',title:'Elige el idioma',text:'En cada aventura aprenderemos un solo idioma.',items:[['en','🇬🇧','English'],['fr','🇫🇷','Français'],['de','🇩🇪','Deutsch'],['it','🇮🇹','Italiano'],['pt','🇵🇹','Português'],['ja','🇯🇵','日本語']]},
 {key:'topic',title:'Elige tu aventura',text:'Comenzaremos con una aventura divertida.',items:[['colors','🎨','Colores'],['animals','🐾','Animales'],['numbers','🔢','Números'],['food','🍎','Comida'],['family','👨‍👩‍👧','Familia'],['stories','📖','Historias']]}
];
try{speechSynthesis.addEventListener('voiceschanged',()=>speechSynthesis.getVoices())}catch(e){}
const allButtons=[cont,voice,audioBtn,langBtn,flowNext,flowBack,...Object.values(menu)];
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
async function openFlow(){nameCard.classList.add('hidden');flow.classList.remove('hidden');flowIndex=0;lessonReady=false;renderStep();setSpeech('🤝 Elige a tu amigo',`Elige a tu amigo, ${profile.name}. Él te acompañará durante la aventura.`);await say(`Ahora, ${profile.name}, elige a tu amigo. Puede ser una niña, un niño, un animal, un robot, un personaje de fantasía o una mascota. Tu amigo te acompañará durante toda la aventura.`)}
function renderStep(){lessonReady=false;flow.classList.remove('lesson-mode');const s=steps[flowIndex];flowStep.textContent=`${flowIndex+1} de ${steps.length}`;flowTitle.textContent=s.title;flowText.textContent=s.text;flowNext.disabled=!Boolean(profile[s.key]);flowNext.classList.toggle('ready',Boolean(profile[s.key]));flowNext.removeAttribute('aria-disabled');choices.innerHTML='';s.items.forEach(([value,emoji,label])=>{const b=document.createElement('button');b.className='choice'+(profile[s.key]===value?' selected':'');b.innerHTML=`<span class="emoji">${emoji}</span><span class="label">${label}</span>`;b.onclick=()=>selectChoice(value,label);choices.appendChild(b)});flowBack.style.visibility=flowIndex===0?'hidden':'visible';flowNext.textContent=flowIndex===steps.length-1?'Comenzar aventura →':'Continuar →'}
async function selectChoice(value,label){if(speaking)return;const s=steps[flowIndex];profile[s.key]=value;renderStep();let spoken='';if(s.key==='companion'){spoken=`¡Excelente elección, ${profile.name}! Has elegido a tu amigo ${label}. Será tu compañero durante esta aventura.`;setSpeech(`🤝 Tu amigo: ${label}`,`¡Excelente elección, ${profile.name}!`)}else if(s.key==='language'){spoken=`¡Excelente! Has elegido ${label}. Este será el único idioma que usaremos en esta aventura.`;setSpeech(`🌎 ${label}`,`Este será el idioma de tu aventura.`)}else{spoken=`¡Excelente! Has elegido ${label}. Esta será nuestra aventura.`;setSpeech(`✨ ${label}`,`¡Vamos a descubrirla juntos!`)}await say(spoken)}
cont.onclick=async()=>{if(speaking)return;const n=nameInput.value.trim();if(!n){setSpeech('👋 ¡Cuéntame tu nombre!','Escribe tu nombre o usa el botón del micrófono.');await say('¿Cómo te llamas? Puedes escribir tu nombre o decírmelo con el micrófono.');return}profile.name=n;setSpeech(`¡Guau, ${n}! 🤩`,'¡Qué alegría conocerte!');await say(`¡Guau, ${n}! ¡Qué alegría conocerte! Ahora vamos a elegir a tu amigo de aventura.`);await openFlow()};
audioBtn.onclick=async()=>{if(speaking)return;welcomePlayed=true;audioUnlocked=true;await welcome()};
voice.onclick=()=>{if(speaking)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){micState.textContent='🎙️ Este navegador no permite reconocer la voz. Puedes escribir tu nombre.';return}const r=new SR();r.lang='es-MX';r.continuous=false;r.interimResults=false;r.maxAlternatives=5;micState.textContent='🟢 Micrófono activado. ¡Ahora puedes hablar!';voice.disabled=true;robotState('listening');r.onresult=e=>{const t=e.results[0][0].transcript.trim();nameInput.value=t;micState.textContent='';profile.name=t;setSpeech(`¡Guau, ${t}! 🤩`,'¡Qué alegría conocerte!');say(`¡Guau, ${t}! ¡Qué alegría conocerte! Ahora vamos a elegir a tu amigo de aventura.`).then(()=>openFlow())};r.onerror=e=>{robotState('');voice.disabled=false;micState.textContent=e.error==='not-allowed'?'🎙️ Permite el micrófono en Safari.':'No pude escucharte. Puedes intentarlo otra vez.'};r.onend=()=>{robotState('');voice.disabled=false};try{r.start()}catch(e){robotState('');voice.disabled=false;micState.textContent='Puedes intentarlo otra vez.'}};
flowBack.onclick=()=>{if(speaking)return;if(flowIndex===0){flow.classList.add('hidden');nameCard.classList.remove('hidden');cont.disabled=false;cont.classList.remove('disabled');voice.disabled=false;return}flowIndex--;renderStep();flowNext.disabled=!profile[steps[flowIndex].key];flowNext.classList.toggle('ready',!!profile[steps[flowIndex].key]);};
async function handleFlowNext(){
 if(speaking||flowNext.disabled)return;
 if(flowIndex<steps.length-1){
   flowIndex++;
   renderStep();
   const s=steps[flowIndex];
   setSpeech(`🌟 ${s.title}`,s.text);
   await say(s.key==='language'?'Ahora elige el idioma que quieres aprender. Recuerda: una aventura, un idioma.':'Ahora elige tu próxima aventura.');
   return;
 }
 if(!lessonReady){
   lessonReady=true;
   setSpeech('🎨 ¡Comienza la aventura!','Nuestro primer tema será Colores.');
   await say(`¡Perfecto, ${profile.name}! Comenzaremos con Colores. Vamos a descubrir nuestra primera palabra juntos.`);
   flowTitle.textContent='🎨 Primera aventura: Colores';
   flowText.textContent='Próximo paso: descubrir RED con tu compañero.';
   flowStep.textContent='¡Listos!';
   choices.innerHTML='<div class="first-lesson"><span>🍎</span><b>RED</b><small>Escuchar · Repetir · Jugar</small></div>';
   flowNext.textContent='Empezar Colores →';
   flowNext.disabled=false;
   flowBack.style.visibility='visible';
   return;
 }
 showColorLesson();
}
flowNext.onclick=handleFlowNext;


let redAttempts=0;
async function showColorLesson(){
  lessonReady=false;
  flow.classList.add('lesson-mode');
  flowStep.textContent='Lección 1 · Colores';
  flowTitle.textContent='🍎 ¡Mira lo que encontré!';
  flowText.textContent=`${profile.name}, encontré una manzana. Vamos a descubrir su color.`;
  choices.innerHTML=`
    <div class="color-lesson">
      <div class="lesson-scene"><div class="lesson-apple" aria-label="Manzana roja">🍎</div><div class="sparkle">✨</div></div>
      <div class="lesson-label">Nueva palabra</div>
      <div class="lesson-word">RED</div>
      <div class="lesson-meaning">rojo</div>
      <div class="lesson-actions">
        <button class="lesson-btn listen-red" id="listenRed">🔊 Escuchar RED</button>
        <button class="lesson-btn repeat-red" id="repeatRed">🎙️ Repetir RED</button>
      </div>
      <div id="redStatus" class="red-status">Primero escucha. Después lo dices tú.</div>
    </div>`;
  flowNext.textContent='🎮 Ir al juego →';
  flowNext.disabled=false;
  flowNext.classList.add('ready');
  flowBack.style.visibility='visible';
  document.getElementById('listenRed').onclick=()=>playRed();
  document.getElementById('repeatRed').onclick=()=>listenRed();
  setSpeech('🍎 ¡Mira, '+profile.name+'!','Encontré una manzana. ¡Es roja!');
  await playIntroColor();
}
async function playIntroColor(){
  if(speaking)return;
  setSpeech('🍎 ¡Guau, '+profile.name+'!','¡Mira lo que encontré! ¡Una manzana!');
  await say(`¡Guau, ${profile.name}! ¡Mira lo que encontré! ¡Una manzana!`);
  setSpeech('🔴 ¡Es roja!','Rojo en español.');
  await say('La manzana es roja. Rojo es el color que vamos a aprender.');
  setSpeech('🇬🇧 En inglés…','Rojo se dice RED. Escucha: RED.');
  await say('En inglés, rojo se dice RED. Escucha: RED.','es-MX',.9);
  setSpeech('🔊 RED','Ahora tú. ¡Dilo conmigo!');
  await say('RED','en-US',.82);
  const st=document.getElementById('redStatus');
  if(st) st.textContent='🎙️ Ahora tú: toca “Repetir RED” y dilo conmigo.';
}
async function playRed(){
  if(speaking)return;
  setSpeech('🔊 Escucha','RED');
  await say('RED','en-US',0.82);
  setSpeech('🎙️ Ahora tú','¡Dilo conmigo!');
}
async function primeSafariMicrophone(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){return true}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    stream.getTracks().forEach(t=>t.stop());
    return true;
  }catch(e){
    const status=document.getElementById('redStatus');
    if(status){
      if(e && (e.name==='NotAllowedError'||e.name==='PermissionDeniedError')){
        status.textContent='🎙️ Safari bloqueó el micrófono. Permítelo para este sitio y vuelve a tocar “Repetir RED”.';
      }else{
        status.textContent='🎙️ No se pudo activar el micrófono. Inténtalo nuevamente.';
      }
    }
    return false;
  }
}

async function listenRed(){
  if(speaking)return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const status=document.getElementById('redStatus');
  if(!SR){if(status)status.textContent='🎙️ Safari no permite reconocimiento de voz en este momento. Puedes continuar sin repetir.';return}

  if(status)status.textContent='🎙️ Activando el micrófono…';
  const micOK=await primeSafariMicrophone();
  if(!micOK)return;

  // iOS Safari can leave an old SpeechRecognition session unusable after TTS.
  // Always create a fresh recognizer for each attempt and start it after the
  // microphone permission has been granted by this user gesture.
  await new Promise(r=>setTimeout(r,350));

  const r=new SR();
  r.lang='en-US';
  r.continuous=false;
  r.interimResults=false;
  r.maxAlternatives=10;
  let gotResult=false;
  let finished=false;
  const finish=()=>{if(finished)return;finished=true;robotState('');};

  if(status)status.textContent='🟢 Micrófono activado. ¡Ahora di RED!';
  robotState('listening');

  r.onstart=()=>{if(status)status.textContent='👂 Te escucho… di RED';};
  r.onresult=e=>{
    gotResult=true;
    const texts=[];
    for(let i=0;i<e.results.length;i++){
      const res=e.results[i];
      for(let j=0;j<res.length;j++)texts.push((res[j].transcript||'').toLowerCase().trim());
    }
    const ok=texts.some(t=>/\bred\b|\bread\b|\breed\b|\bret\b|\bre\b/.test(t));
    if(ok){
      status.textContent='⭐ ¡Excelente! Lo dijiste muy bien.';
      setSpeech('⭐ ¡Excelente!','¡Lo dijiste! RED.');
      robotState('excited');
      say(`¡Excelente, ${profile.name}! Lo dijiste muy bien. RED.`).finally(finish);
    }else{
      redAttempts++;
      const again=redAttempts<2;
      status.textContent=again?'💪 No lo reconocí todavía. Toca “Repetir RED” y vuelve a intentarlo.':'🌟 ¡Muy bien por intentarlo! Podemos continuar.';
      setSpeech(again?'💪 ¡Vamos otra vez!':'🌟 ¡Muy bien!','Seguimos con la aventura.');
      say(again?'Vamos a intentarlo una vez más. Dilo conmigo: RED.':'¡Muy bien por intentarlo! Ahora vamos a jugar.').finally(finish);
    }
  };
  r.onerror=e=>{
    finish();
    if(e && e.error==='not-allowed'){
      status.textContent='🎙️ Safari no dio permiso al micrófono. Revisa el permiso de este sitio y vuelve a intentarlo.';
    }else if(e && e.error==='no-speech'){
      status.textContent='👂 No escuché una palabra. Toca “Repetir RED” y dilo después de que aparezca “Te escucho”.';
    }else{
      status.textContent='🎙️ El micrófono no respondió. Toca “Repetir RED” para intentarlo otra vez.';
    }
  };
  r.onend=()=>{if(!gotResult && !speaking)finish();};

  try{
    r.start();
    // Safety net for iOS cases where the recognizer appears active but never fires events.
    setTimeout(()=>{if(!gotResult && !finished){try{r.abort()}catch(e){};finish();if(status)status.textContent='👂 No recibí la respuesta. Toca “Repetir RED” para intentarlo otra vez.';}},8000);
  }catch(e){
    finish();
    if(status)status.textContent='🎙️ Safari no pudo iniciar el micrófono. Toca “Repetir RED” nuevamente.';
  }
}
