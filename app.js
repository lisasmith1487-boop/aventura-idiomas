function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

function saveProfile() {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message");

  if (!name) {
    message.textContent = "😊 Escribe tu nombre para continuar.";
    return;
  }

  localStorage.setItem("childName", name);
  document.getElementById("hello").textContent = `¡Hola, ${name}! 👋`;
  showScreen("next");
}
