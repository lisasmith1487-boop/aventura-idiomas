let childName="";
let selectedCharacter=null;
let selectedEmoji=null;
let selectedLanguage=null;
let redFound=0;
let adventureStep=0;

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
}

function saveProfile(){
  const name=document.getElementById("name").value.trim();
  const msg=document.getElementById("message");
  if(!name){msg.textContent="😊 Escribe tu nombre para continuar.";return;}
  childName=name;
  localStorage.setItem("childName",name);
  showScreen("character");
}

function chooseCharacter(button,emoji,character){
  document.querySelectorAll(".character").forEach(b=>b.classList.remove("selected"));
  button.classList.add("selected");
  selectedCharacter=character; selectedEmoji=emoji;
  localStorage.setItem("character",character);
  localStorage.setItem("characterEmoji",emoji);
  document.getElementById("characterMessage").textContent="¡Excelente elección! "+emoji;
  document.getElementById("finishButton").classList.remove("disabled");
}

function finishProfile(){
  if(!selectedCharacter)return;
  document.getElementById("chosenEmoji").textContent=selectedEmoji;
  document.getElementById("hello").textContent="¡Hola, "+childName+"! 👋";
  document.getElementById("readyText").textContent="Tu compañero "+selectedCharacter+" te acompañará en cada aventura.";
  showScreen("ready");
}

function selectLanguage(language){
  selectedLanguage=language;
  localStorage.setItem("language",language);
  const msg=document.getElementById("languageMessage");
  if(language!=="English"){
    msg.textContent="🌟 " + language + " está preparado para el futuro. En esta versión exploraremos English.";
    return;
  }
  msg.textContent="🌟 ¡Perfecto! Aprenderemos English en esta aventura.";
  setTimeout(()=>{
    document.getElementById("worldCharacter").textContent=selectedEmoji||"🤖";
    showScreen("world");
  },600);
}

function startColors(){
  adventureStep=0;
  document.getElementById("adventureCharacter").textContent=selectedEmoji||"🤖";
  document.getElementById("learnCharacter").textContent=selectedEmoji||"🤖";
  showScreen("adventure");
}

function nextAdventure(){
  adventureStep++;
  const text=document.getElementById("storyText");
  const obj=document.getElementById("object");
  if(adventureStep===1){
    text.textContent="Look! I found an apple! 🍎 What a beautiful color!";
    obj.textContent="🍎";
  }else if(adventureStep===2){
    text.textContent="Look! It's RED. Red, red, red! This is our magic color.";
    obj.textContent="🔴";
  }else{
    showScreen("learnRed");
  }
}

function speakRed(){
  if("speechSynthesis" in window){
    const u=new SpeechSynthesisUtterance("Red");
    u.lang="en-US";u.rate=.72;
    speechSynthesis.cancel();speechSynthesis.speak(u);
  }
}

function repeatRed(){
  speakRed();
  document.getElementById("repeatMessage").textContent="👏 Amazing! ¡Muy bien! Escuchaste y repetiste RED.";
  setTimeout(()=>showScreen("game"),900);
}

function pickColor(button,isRed){
  if(isRed){
    button.disabled=true;
    button.style.opacity=".5";
    redFound++;
    document.getElementById("gameMessage").textContent="🎉 ¡Sí! That's RED!";
    if(redFound>=3){
      document.getElementById("gameMessage").textContent="🌟 ¡Encontraste todos los objetos RED!";
      document.getElementById("gameContinue").classList.remove("disabled");
    }
  }else{
    document.getElementById("gameMessage").textContent="💡 Casi. Busca los objetos RED.";
  }
}

function answerColor(button,answer){
  const msg=document.getElementById("answerMessage");
  if(answer==="Red"){
    msg.textContent="🎉 Correct! RED. ¡Lo lograste!";
    localStorage.setItem("redMastery","learned");
    setTimeout(()=>{
      document.getElementById("rewardCharacter").textContent=selectedEmoji||"🤖";
      document.getElementById("rewardText").textContent="¡"+childName+" aprendió su primera palabra de colores en English!";
      showScreen("reward");
    },800);
  }else{
    msg.textContent="😊 Let's try again. Look at the apple: 🍎";
  }
}

window.addEventListener("DOMContentLoaded",()=>{
  childName=localStorage.getItem("childName")||"";
  selectedCharacter=localStorage.getItem("character");
  selectedEmoji=localStorage.getItem("characterEmoji");
  selectedLanguage=localStorage.getItem("language");
  if(childName)document.getElementById("name").value=childName;
});
