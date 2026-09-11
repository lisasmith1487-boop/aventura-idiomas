let childName = "";
let selectedCharacter = null;
let selectedEmoji = null;
let selectedLanguage = null;

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

function saveProfile() {
  const input = document.getElementById("name");
  const message = document.getElementById("message");
  const name = input.value.trim();

  if (!name) {
    message.textContent = "😊 Escribe tu nombre para continuar.";
    return;
  }

  childName = name;
  localStorage.setItem("childName", childName);
  showScreen("character");
}

function chooseCharacter(button, emoji, character) {
  document.querySelectorAll(".character").forEach(item => {
    item.classList.remove("selected");
  });

  button.classList.add("selected");
  selectedCharacter = character;
  selectedEmoji = emoji;

  localStorage.setItem("character", selectedCharacter);
  localStorage.setItem("characterEmoji", selectedEmoji);

  document.getElementById("characterMessage").textContent =
    "¡Excelente elección! " + emoji;
  document.getElementById("finishButton").classList.remove("disabled");
}

function finishProfile() {
  if (!selectedCharacter) return;

  document.getElementById("chosenEmoji").textContent = selectedEmoji;
  document.getElementById("hello").textContent = "¡Hola, " + childName + "! 👋";
  document.getElementById("readyText").textContent =
    "Tu compañero " + selectedCharacter + " te acompañará en cada aventura.";

  showScreen("ready");
}

function selectLanguage(language) {
  selectedLanguage = language;
  localStorage.setItem("language", selectedLanguage);

  document.getElementById("languageMessage").textContent =
    "🌟 ¡Perfecto! Aprenderemos " + language + " en esta aventura.";
}

window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("childName");
  const savedCharacter = localStorage.getItem("character");
  const savedEmoji = localStorage.getItem("characterEmoji");

  if (savedName) {
    childName = savedName;
    document.getElementById("name").value = savedName;
  }

  if (savedCharacter && savedEmoji) {
    selectedCharacter = savedCharacter;
    selectedEmoji = savedEmoji;
  }
});
