const form = document.getElementById('chat-form');
const chatbox = document.getElementById('chatbox');
const chatHistory = document.getElementById('chat-history');
const micButton = document.getElementById("mic-button");

let chatSessions = [];
let currentSession = [];

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const input = document.getElementById('user-input');
  const userText = input.value.trim();
  if (!userText) return;

  const blockedTopics = [
    "elon musk", "crypto", "bitcoin", "ethereum", "money", "invest",
    "chatgpt", "gpt", "openai", "ai model", "prompt injection",
    "software", "code", "politics", "government", "president",
    "israel", "gaza", "china", "trump", "biden", "hacking"
  ];

  if (blockedTopics.some(word => userText.toLowerCase().includes(word))) {
    addMessage("Sorry, I only respond to health, diet, and fitness-related questions. Let’s stay focused on your well-being 💪", "bot");
    return;
  }

  addMessage(userText, 'user');
  currentSession.push({ role: 'user', content: userText });

  input.value = '';

  const response = await getBotReply(userText);
  addMessage(response, 'bot');
  currentSession.push({ role: 'bot', content: response });
});

function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.innerText = text;
  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function getBotReply(userText) {
  // This will be replaced by real GPT API later
  return "Thanks! I'm FitlyAI, your personal AI fitness coach. I provide personalized workout plans, nutrition guidance, and 24/7 health support to help you achieve your fitness goals!";
}

function startNewChat() {
  if (currentSession.length > 0) {
    const chatTitle = `Chat ${chatSessions.length + 1}`;
    const sessionDiv = document.createElement('div');
    sessionDiv.textContent = chatTitle;
    sessionDiv.onclick = () => loadSession(chatSessions.length);
    chatHistory.appendChild(sessionDiv);
    chatSessions.push(currentSession);
  }

  currentSession = [];
  chatbox.innerHTML = `<div class="message bot">Welcome to your personal AI health coach. How can I help you today?</div>`;
}

function loadSession(index) {
  chatbox.innerHTML = '';
  const session = chatSessions[index];
  session.forEach(msg => {
    addMessage(msg.content, msg.role);
  });
}

// 🎤 Voice input (Mic button)
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  micButton.addEventListener("click", () => {
    recognition.start();
    micButton.disabled = true;
    micButton.innerText = "🎙️ Listening...";
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("user-input").value = transcript;
    document.getElementById("chat-form").dispatchEvent(new Event("submit"));
  };

  recognition.onend = () => {
    micButton.disabled = false;
    micButton.innerText = "🎤";
  };
} else {
  micButton.style.display = "none";
  console.warn("Speech recognition not supported in this browser.");
}
