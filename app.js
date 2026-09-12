const screen=document.getElementById("screen"),step=document.getElementById("step"),replay=document.getElementById("replay"),talking=document.getElementById("talking"),toast=document.getElementById("toast");
const state={name:localStorage.getItem("name")||"",age:localStorage.getItem("age")||"",character:localStorage.getItem("character")||"",language:localStorage.getItem("language")||""};
const chars=[["👧","Niña","girl"],["👦","Niño","boy"],["🐶","Perrito","dog"],["🤖","Robot","robot"],["🧚","Fantasía","fairy"],["🐱","Gatito","cat"]];
let lastSpeech={text:"",lang:"es-MX"},speechQueue=Promise.resolve(),speaking=false,activeButtons=[],speechToken=0;
function save(){Object.entries(state).forEach(([k,v])=>localStorage.setItem(k,v))}
function setBuddyState(state){
 document.body.dataset.buddyState=state||"idle";
}
function companion(){
 const c=chars.find(x=>x[2]===state.character)||chars[3];
 if(c[2]==="robot"){
   return `<div class="buddy robot-buddy" aria-label="Robot compañero">
     <div class="buddy-shadow"></div>
     <div class="robot-antenna"><i></i></div>
     <div class="robot-head">
       <div class="robot-ear left"></div><div class="robot-ear right"></div>
       <div class="robot-face">
         <span class="robot-eye"></span><span class="robot-eye"></span>
         <span class="robot-nose"></span>
         <span class="robot-mouth"><i></i><i></i><i></i></span>
       </div>
     </div>
     <div class="robot-body"><span class="robot-light"></span><span class="robot-panel">♥</span></div>
   </div>`;
 }
 return `<div class="buddy emoji-buddy" aria-label="${c[1]}">${c[0]}</div>`;
}
function header(t){step.textContent=t}
function toastMsg(t){toast.textContent=t;toast.style.display="block";setTimeout(()=>toast.style.display="none",2500)}
function registerButtons(){activeButtons=[...screen.querySelectorAll("button")].filter(b=>b.id!=="replay");activeButtons.forEach(b=>b.disabled=true);return activeButtons}
function unlockButtons(){activeButtons.forEach(b=>b.disabled=false);activeButtons=[]}
function speak(text,lang="es-MX",rate=.88){
 lastSpeech={text,lang};
 const myToken=++speechToken;
 speechQueue=speechQueue.then(()=>new Promise(resolve=>{
   speaking=true;talking.classList.add("on");setBuddyState("talking");document.body.classList.add("buddy-speaking");
   if(!("speechSynthesis"in window)){speaking=false;talking.classList.remove("on");document.body.classList.remove("buddy-speaking");resolve();return}
   speechSynthesis.cancel();
   let finished=false;
   const finish=()=>{if(finished)return;finished=true;if(myToken===speechToken){speaking=false;talking.classList.remove("on");document.body.classList.remove("buddy-speaking")}resolve()};
   const u=new SpeechSynthesisUtterance(text);
   u.lang=lang;u.rate=rate;u.pitch=state.character==="robot"?1.28:1.12;
   const vs=speechSynthesis.getVoices();
   const v=vs.find(x=>x.lang.toLowerCase()===lang.toLowerCase())||vs.find(x=>x.lang.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));
   if(v)u.voice=v;
   u.onend=()=>setTimeout(finish,180);
   u.onerror=()=>finish();
   // iPhone/Safari can occasionally fail to fire onend. This safety timer
   // prevents the child from being trapped with every button disabled.
   const estimated=Math.min(10000,Math.max(1800,text.length*75/rate));
   setTimeout(finish,estimated);
   try{speechSynthesis.speak(u)}catch(e){finish()}
 }));
 return speechQueue;
}
replay.onclick=()=>{if(!speaking&&lastSpeech.text){speechQueue=Promise.resolve();speak(lastSpeech.text,lastSpeech.lang,.88)}};
function listen(cb,lang="es-MX",options={}){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 const status=document.getElementById("micStatus");
 const sayBtn=document.getElementById("say");
 if(!SR){
   if(status)status.innerHTML="⚠️ Este navegador no puede usar el micrófono para reconocer palabras.";
   return false;
 }

 const r=new SR();
 r.lang=lang;
 r.continuous=false;
 r.interimResults=true;
 r.maxAlternatives=10;

 // Si el navegador lo permite, damos prioridad a la palabra que estamos practicando.
 try{
   if("phrases" in r && "SpeechRecognitionPhrase" in window){
     r.phrases=[new SpeechRecognitionPhrase("red",10)];
   }
 }catch(e){}

 let finished=false;
 let heard="";
 let timer=null;
 let speechStarted=false;

 const setStatus=(html,cls="")=>{
   if(status){
     status.className="micStatus "+cls;
     status.innerHTML=html;
   }
 };

 const finish=()=>{
   if(finished)return;
   finished=true;
   if(timer)clearTimeout(timer);
   if(sayBtn)sayBtn.disabled=false;
   try{r.stop()}catch(e){}
 };

 r.onstart=()=>{
   setStatus("🟢 <strong>Micrófono activado</strong><br><span>¡Ahora puedes hablar! Di <b>RED</b>.</span>","active");
 };

 r.onspeechstart=()=>{
   speechStarted=true;
   setStatus("👂 <strong>Te estoy escuchando…</strong><br><span>Di <b>RED</b> con calma.</span>","listening");
 };

 r.onresult=e=>{
   let best="";
   for(let i=0;i<e.results.length;i++){
     const result=e.results[i];
     for(let j=0;j<result.length;j++){
       const t=result[j].transcript.trim();
       if(t && !best)best=t;
       // Para una palabra objetivo, si alguna alternativa contiene RED,
       // la entregamos inmediatamente para que el niño no tenga que repetir.
       if(options.accept && options.accept(t)){
         heard=t;
         finish();
         cb(t);
         return;
       }
     }
   }
   if(best)heard=best;
   setStatus(`👂 <strong>Te escuché…</strong><br><span>“${heard||"…" }”</span>`,"listening");
 };

 r.onspeechend=()=>{
   setStatus("⏳ <strong>Procesando lo que dijiste…</strong>","processing");
 };

 r.onnomatch=()=>{
   if(!finished){
     setStatus("🙂 <strong>No reconocí la palabra todavía.</strong><br><span>Vamos a intentarlo otra vez.</span>","retry");
     finish();
     if(options.onFail)options.onFail("nomatch");
   }
 };

 r.onerror=e=>{
   if(finished)return;
   let msg="No pude escucharte. Vamos otra vez.";
   if(e.error==="not-allowed"||e.error==="service-not-allowed"){
     msg="🎙️ El micrófono está bloqueado.<br><span>Permite el micrófono en el navegador.</span>";
   }else if(e.error==="no-speech"){
     msg="👂 No escuché una palabra.<br><span>Di RED cuando aparezca “Micrófono activado”.</span>";
   }else if(e.error==="network"){
     msg="🌐 El reconocimiento de voz no está disponible ahora.";
   }
   setStatus(msg,"error");
   finish();
   if(options.onFail)options.onFail(e.error||"error");
 };

 r.onend=()=>{
   if(finished)return;
   finish();
   if(heard){
     if(options.accept && options.accept(heard)){
       cb(heard);
     }else if(options.onFail){
       options.onFail("not-recognized",heard);
     }
   }else if(options.onFail){
     options.onFail(speechStarted?"not-recognized":"no-speech");
   }
 };

 if(sayBtn)sayBtn.disabled=true;
 setStatus("🎙️ <strong>Activando micrófono…</strong><br><span>Si aparece una ventana, toca “Permitir”.</span>","starting");

 // Safety timeout: never leave the child waiting forever.
 timer=setTimeout(()=>{
   if(finished)return;
   setStatus("⏱️ <strong>Se terminó el tiempo de escucha.</strong><br><span>Vamos a intentarlo otra vez.</span>","retry");
   finish();
   if(options.onFail)options.onFail("timeout");
 },7000);

 try{
   r.start();
   return true;
 }catch(e){
   finish();
   setStatus("⚠️ <strong>No pude activar el micrófono.</strong><br><span>Prueba otra vez.</span>","error");
   return false;
 }
}

function intro(){header("🌎 Mi aventura");screen.innerHTML=`<div class="card"><div class="world"><div class="planet">🌎</div><div class="companion">${companion()}</div></div><div class="bubble">¡Hola! 👋 Soy tu amiguito. Vamos a explorar un mundo lleno de aventuras y aprender idiomas juntos.</div><button class="btn primary" id="start">✨ ¡Comenzar aventura!</button></div>`;const b=registerButtons();speak("¡Hola! Soy tu amiguito. Vamos a explorar un mundo lleno de aventuras y aprender idiomas juntos. ¿Listo para comenzar?").then(unlockButtons);b[0].onclick=nameScreen}
function nameScreen(){header("👤 Tu nombre");screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¿Cómo te llamas?</div><button class="btn primary" id="mic">🎙️ Decírmelo</button><input class="input" id="nameInput" placeholder="O escribe tu nombre"><button class="btn" id="next">Continuar</button><div class="hint">La voz es opcional si el navegador no la permite.</div></div>`;const b=registerButtons();speak("¿Cómo te llamas?").then(unlockButtons);b.find(x=>x.id==="mic").onclick=()=>listen(t=>{state.name=t.trim();document.getElementById("nameInput").value=state.name;welcomeName()});b.find(x=>x.id==="next").onclick=()=>{let v=document.getElementById("nameInput").value.trim();if(v){state.name=v;welcomeName()}else toastMsg("Dime tu nombre primero 😊")}}
function welcomeName(){save();speak(`¡Excelente, ${state.name}! Qué bonito nombre.`).then(ageScreen)}
function ageScreen(){header("🎂 Tu edad");screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¿Cuántos años tienes?</div><button class="btn primary" id="micAge">🎙️ Decírmelo</button><input class="input" id="ageInput" inputmode="numeric" placeholder="3, 4, 5..."><button class="btn" id="ageNext">Continuar</button></div>`;const b=registerButtons();speak("¿Cuántos años tienes?").then(unlockButtons);const accept=v=>{let m=String(v).match(/10|[1-9]/);if(m){state.age=m[0];save();speak(`¡Excelente, ${state.name}! Tienes ${state.age} años.`).then(characterScreen)}else toastMsg("Dime un número del 1 al 10.")};b.find(x=>x.id==="micAge").onclick=()=>listen(accept);b.find(x=>x.id==="ageNext").onclick=()=>accept(document.getElementById("ageInput").value)}
function characterScreen(){header("🧸 Tu compañero");screen.innerHTML=`<div class="card"><div class="bubble">Elige a tu amiguito para la aventura</div><div class="grid">${chars.map(c=>`<button class="btn choice" data-c="${c[2]}">${c[0]}<br>${c[1]}</button>`).join("")}</div></div>`;const b=registerButtons();speak("Ahora elige a tu compañero. Él te acompañará durante toda la aventura.").then(unlockButtons);b.forEach(x=>x.onclick=()=>{state.character=x.dataset.c;save();speak("¡Excelente elección! Ahora vamos a elegir nuestro idioma.").then(languageScreen)})}
function languageScreen(){header("🌐 Elige un idioma");const ls=[["🇺🇸","English"],["🇫🇷","Français"],["🇩🇪","Deutsch"],["🇮🇹","Italiano"],["🇵🇹","Português"]];screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¿En qué idioma quieres vivir tu aventura?</div><div class="grid">${ls.map(l=>`<button class="btn choice" data-l="${l[1]}">${l[0]}<br>${l[1]}</button>`).join("")}</div></div>`;const b=registerButtons();speak("¿En qué idioma quieres vivir tu aventura? Elige uno.").then(unlockButtons);b.forEach(x=>x.onclick=()=>{state.language=x.dataset.l;save();state.language==="English"?topicScreen():unsupportedLanguage()})}
function unsupportedLanguage(){screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¡Muy bien! Elegiste ${state.language}. 🌎</div><p>Esta aventura de prueba está preparada en English. Después podremos añadir cada idioma con su propia aventura.</p><button class="btn primary" id="english">Probar English 🇺🇸</button></div>`;const b=registerButtons();speak(`¡Muy bien! Elegiste ${state.language}. Esta aventura de prueba está preparada en English.`).then(unlockButtons);b[0].onclick=()=>{state.language="English";save();topicScreen()}}
function topicScreen(){header("📚 Tu aventura");screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¡Vamos a aprender colores en English!</div><div class="world"><div class="planet">🌎</div><div class="companion">${companion()}</div></div><button class="btn primary" id="go">🚪 Entrar a la aventura</button></div>`;const b=registerButtons();speak("¡Vamos a aprender colores en English! Prepárate para nuestra aventura.").then(unlockButtons);b[0].onclick=forestScreen}
function forestScreen(){header("🌲 El bosque mágico");screen.innerHTML=`<div class="card"><div class="world"><div class="planet">🌎</div><div class="companion">${companion()}</div><div class="bubble">🌳 ✨ 🚪 ✨ 🌳</div></div><div class="bubble">Hay algo especial detrás de esa puerta...</div><button class="btn primary" id="door">🚪 ¡Vamos!</button></div>`;const b=registerButtons();speak(`¡Mira, ${state.name}! Llegamos al bosque mágico. Hay una puerta misteriosa. ¿Entramos?`).then(unlockButtons);b[0].onclick=appleScreen}
function appleScreen(){
 header("🍎 Descubrimos RED");
 screen.innerHTML=`<div class="card adventure-card">
   <div class="scene-stage">
     <div class="sparkles">✦ ✨ ✦</div>
     <div class="scene-companion">${companion()}</div>
     <div class="apple-object" id="appleObject">🍎</div>
   </div>
   <div class="bubble" id="appleBubble">¡Mira lo que encontré! 👀</div>
   <button class="btn primary" id="hear">🔊 Escuchar RED</button>
   <div class="bubble">En inglés, rojo se dice...</div>
   <button class="btn" id="continue">➡️ Continuar</button>
 </div>`;
 const b=registerButtons();
 const apple=document.getElementById("appleObject");
 const bubble=document.getElementById("appleBubble");
 const setBubble=t=>{if(bubble)bubble.textContent=t};

 const run=async()=>{
   setBuddyState("explore");
   await new Promise(r=>setTimeout(r,700));
   setBuddyState("surprise");
   if(apple)apple.classList.add("found");
   setBubble("¡Guau! ¡Mira eso! 😮");
   await new Promise(r=>setTimeout(r,550));
   setBuddyState("point");
   setBubble("¡Encontré una manzana! 🍎");
   await speak(`¡Guau, ${state.name}!`,"es-MX",.92);
   await speak("¡Mira lo que encontré!","es-MX",.94);
   await speak("¡Una manzana!","es-MX",.92);
   await speak("¡Y es roja!","es-MX",.92);
   await speak("En inglés, rojo se dice...","es-MX",.88);
   await speak("RED!","en-US",.78);
   setBuddyState("celebrate");
   setBubble("¡RED! 🎉");
   await new Promise(r=>setTimeout(r,750));
   setBuddyState("idle");
   unlockButtons();
 };
 run();

 b.find(x=>x.id==="hear").onclick=()=>{
   if(speaking)return;
   setBuddyState("excited");
   speak("RED!","en-US",.78).then(()=>setBuddyState("idle"));
 };
 b.find(x=>x.id==="continue").onclick=repeatScreen;
}

function norm(t){return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z\\s]/g," ").replace(/\\s+/g," ").trim()}
function isRed(t){let s=norm(t),c=s.replace(/\\s/g,"");return s==="red"||s.includes(" red ")||s.startsWith("red ")||s.endsWith(" red")||["red","read","reed","ret","re"].includes(c)}
function repeatScreen(){
 header("🗣️ Ahora tú");
 screen.innerHTML=`<div class="card">
   <span class="companion">${companion()}</span>
   <div class="bubble">Ahora tú. ¡Dilo conmigo!</div>
   <div class="red">RED</div>
   <div id="micStatus" class="micStatus ready">🎙️ <strong>El micrófono está listo.</strong><br><span>Toca “Decir RED” y espera a que diga “Micrófono activado”.</span></div>
   <button class="btn primary" id="say">🎙️ Decir RED</button>
   <button class="btn" id="keyboard">⌨️ Escribir respuesta</button>
   <p id="result" class="hint">No tienes que decirlo perfecto. Lo importante es practicar.</p>
 </div>`;

 const b=registerButtons();
 let attempts=0;
 let waiting=false;

 speak("Ahora tú. ¡Dilo conmigo!")
   .then(()=>speak("Red","en-US",.82))
   .then(unlockButtons);

 const finishPractice=()=>{
   waiting=false;
   document.querySelectorAll("button").forEach(x=>x.disabled=true);
   const st=document.getElementById("micStatus");
   if(st)st.innerHTML="🎉 <strong>¡Muy bien!</strong><br><span>Vamos a seguir con la aventura.</span>";
   speak("¡Muy bien! Estás practicando RED. ¡Vamos a jugar!")
     .then(gameScreen);
 };

 const check=t=>{
   waiting=false;
   const r=document.getElementById("result");
   if(isRed(t)){
     if(r)r.textContent=`¡Sí! Te escuché decir “${t}”. 🎉`;
     finishPractice();
   }else{
     attempts++;
     if(r)r.textContent=`Te escuché: “${t||"…" }”.`;
     // Nunca atrapamos al niño en un bucle de pronunciación.
     if(attempts>=2){
       if(r)r.textContent="¡Muy bien! Ya practicamos RED. Ahora vamos a jugar. ⭐";
       finishPractice();
       return;
     }
     const st=document.getElementById("micStatus");
     if(st)st.innerHTML="🙂 <strong>Vamos otra vez.</strong><br><span>Escucha RED y después toca el micrófono.</span>";
     speak("¡Muy bien! Vamos otra vez. Escucha: Red.")
       .then(()=>speak("Red","en-US",.82))
       .then(()=>unlockButtons());
   }
 };

 const startListening=()=>{
   if(waiting||speaking)return;
   waiting=true;
   const ok=listen(check,"en-US",{
     accept:isRed,
     onFail:()=>{
       waiting=false;
       const st=document.getElementById("micStatus");
       if(st)st.innerHTML="🙂 <strong>No pasa nada.</strong><br><span>Toca el micrófono otra vez y di RED.</span>";
     }
   });
   if(!ok){
     waiting=false;
     toastMsg("No pude activar el micrófono. Puedes escribir “Red”.");
   }
 };

 b.find(x=>x.id==="say").onclick=startListening;
 b.find(x=>x.id==="keyboard").onclick=()=>{
   if(speaking||waiting)return;
   const v=prompt("Escribe lo que dijiste:");
   if(v)check(v);
 };
}

function gameScreen(){header("🎮 ¡A jugar!");const o=[["🍎",1],["❤️",1],["🍓",1],["🦋",0],["🍌",0],["🌳",0]];screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¡Busca 3 cosas RED! Tócalas.</div><div class="objectgrid">${o.map(x=>`<button class="btn object" data-red="${x[1]}">${x[0]}</button>`).join("")}</div><p id="count" class="tag">0 / 3</p></div>`;const b=registerButtons();speak("¡A jugar! Busca tres cosas que sean RED y tócalas.").then(unlockButtons);let n=0;b.forEach(x=>x.onclick=()=>{if(x.dataset.red==="1"&&!x.disabled){x.disabled=true;x.textContent="⭐";n++;document.getElementById("count").textContent=`${n} / 3`;speak(n===3?"¡Lo lograste! Ahora viene tu desafío.":"¡Sí! Eso es RED.");if(n===3)setTimeout(challengeScreen,900)}else speak("Ese no es RED. Busca otra cosa.")})}
function challengeScreen(){header("🧠 Tu desafío");screen.innerHTML=`<div class="card"><span class="companion">${companion()}</span><div class="bubble">¿De qué color es la manzana?</div><div class="grid"><button class="btn choice" data-a="Blue">🔵<br>Blue</button><button class="btn choice" data-a="Red">🔴<br>Red</button><button class="btn choice" data-a="Yellow">🟡<br>Yellow</button></div></div>`;const b=registerButtons();speak(`Último desafío, ${state.name}. ¿De qué color es la manzana?`).then(unlockButtons);b.forEach(x=>x.onclick=()=>x.dataset.a==="Red"?(document.querySelectorAll("button").forEach(y=>y.disabled=true),speak("¡Correcto! La manzana es RED.").then(rewardScreen)):speak("Mmm, inténtalo otra vez. Mira la manzana."))}
function rewardScreen(){header("⭐ ¡Aventura completada!");screen.innerHTML=`<div class="card"><div class="success">🏆</div><span class="companion">${companion()}</span><div class="bubble">¡Aventura completada, ${state.name}!</div><div class="red">RED</div><p class="tag">⭐ ¡Aprendido!</p><br><button class="btn primary" id="again">🔁 Jugar otra vez</button></div>`;const b=registerButtons();speak(`¡Aventura completada, ${state.name}! ¡Aprendiste RED! Estoy muy orgulloso de ti.`).then(unlockButtons);b[0].onclick=appleScreen}
intro();