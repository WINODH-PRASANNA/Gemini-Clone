const messageForm = document.querySelector(".prompt-form");
const chatHistoryContainer = document.querySelector(".chats");
const suggestionItems = document.querySelector(".suggests-item");


const themeToggleBtn = document.getElementById("themeToggle");
const clearChatBtn = document.getElementById("deletBtn");


let currentUserMessage = null;
let isGeneratingResponse = false;

const GOOGLE_API_KEY = "AIzaSyALlbjEqBnCPBG1Xd2j9-1Q0q4CkobgAoI";
// const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;
const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`;


const loadSavedChatHistory = () => {
    const savedConversation = JSON.parse(localStorage.getItem("saved-api-chats")) || [];
    const isLightTheme = localStorage.getItem("theme-color") === "light_mode";

    document.body.classList.toggle("light_mode", isLightTheme);
    themeToggleBtn.innerHTML = isLightTheme ? '< class="bx bx-moon"></i>' : '< class="bx bx-sun"></i>';

    chatHistoryContainer.innerHTML = '';

    savedConversation.forEach(conversation => {
        const userMessageHtml = `

            <div class="message-content">
                <img class="message-avatar" src="assets/imgs/profile.png" alt="User Avatar">
                <p class="message-text">${conversation.userMessage}</p>
            </div>
        
        `;

        const outgoingMessageElement = createChatMessageElement(userMessageHtml, "message-outgoing");
        chatHistoryContainer.appendChild(outgoingMessageElement);

        const responseText = conversation.apiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsedApiResponse = marked.parse(responseText);
        const rawApiResponse = responseText;

        const responseHtml = `
            <div class="message-content">
                <img class="message-avatar" src="assets/imgs/gemini.svg" alt="Gemini avatar">
                <p class="message-text"></p>
                <div class="message-loading-indicator hide">
                    <div class="message-loading-bar"></div>
                    <div class="message-loading-bar"></div>
                    <div class="message-loading-bar"></div>
                </div>
            </div>
            <span class="message-icon hide" onClick="copyMessageToClipboard(this)">
                <i class='bx bx-copy-alt'></i>
            </span>
        `
    })
};

// 28.55