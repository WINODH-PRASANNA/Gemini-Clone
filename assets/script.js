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
    const savedConversations = JSON.parse(localStorage.getItem("saved-api-chats")) || [];
    const isLightTheme = localStorage.getItem("theme-color") === "light_mode";

    document.body.classList.toggle("light_mode", isLightTheme);
    themeToggleBtn.innerHTML = isLightTheme ? '< class="bx bx-moon"></i>' : '< class="bx bx-sun"></i>';

    chatHistoryContainer.innerHTML = '';

    savedConversations.forEach(conversation => {
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
        `;

        const incomingMessageElement = createChatMessageElement(responseHtml, "message-incoming");

        const messageTextElement = incomingMessageElement.querySelector(".message-text");

        showTypingEffect(rawApiResponse, parsedApiResponse, messageTextElement, incomingMessageElement, true);
    });

    document.body.classList.toggle("hide-header", savedConversations.length > 0);
};


const createChatMessageElement = (htmlContent, ...cssClasses) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", ...cssClasses);
    messageElement.innerHTML = htmlContent;
    return messageElement;
}

const showTypingEffect = (rawText, htmlText, messageElement, incomingMessageElement, skipEffect = false) => {
    const copyIconElement = incomingMessageElement.querySelector(".message-icon");
    copyIconElement.classList.add("hide");

    if (skipEffect) {
        messageElement.innerHTML = htmlText;
        hljs.highlightAll();
        addCopyButtonToCodeBlocks();
        copyIconElement.classList.remove("hide");
        isGeneratingResponse = false;
        return;
    }

    const wordsArray = rawText.split(' ');
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
        messageElement.innerText += (wordIndex === 0 ? '' : ' ') + wordsArray[wordIndex++];
        if (wordIndex === wordsArray.length) {
            clearInterval(typingInterval);
            isGeneratingResponse = false;
            messageElement.innerHTML = htmlText;
            hljs.highlightAll();
            addCopyButtonToCodeBlocks();
            copyIconElement.classList.remove("hide");
        }
    }, 75);
};

const requestApiResponse = async (incomingMessageElement) => {
    const Messageelement = incomingMessageElement.querySelector(".message-text");

    try {
        const response = await fetch(API_REQUEST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: currentUserMessage }] }]
            }),
        });

        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.error.message);

        const responseText = responseData?.conditates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("Invalid API Response");

        const parsedApiResponse = marked.parse(responseText);
        const rawApiResponse = responseText;

        showTypingEffect(rawApiResponse, parsedApiResponse, messageTextElement, incomingMessageElement);

        let savedConversations = JSON.parse(localStorage.getItem("saved-api-chats")) || [];
        savedConversations.push({
            userMessage: currentUserMessage,
            apiResponse: responseData
        });
        localStorage.setItem("saved-api-chats", JSON.stringify(savedConversations));
    } catch (error) {
        isGeneratingResponse = false;
        messageTextElement.innerText = error.message;
        messageTextElement.closest(".message-loading").classList.add("message-error");
    } finally {
        incomingMessageElement.classList.remove("message-loading");
    }
};
