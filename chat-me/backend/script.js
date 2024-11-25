// Base URL of the PHP API
const API_BASE_URL = "http://localhost/api.php";

// DOM Elements
const chatListElement = document.getElementById("chat-list");
const chatWindowElement = document.querySelector(".chat-window");
const chatBodyElement = document.querySelector(".chat-body");
const chatHeaderElement = document.querySelector(".chat-header-info");
const chatInputElement = document.querySelector(".chat-input input");
const chatSendButton = document.querySelector(".chat-input button");

// Currently opened chat ID
let currentChatId = null;

/**
 * Fetch and display all chats
 */
function loadChats() {
    fetch(`${API_BASE_URL}/chats`)
        .then((response) => response.json())
        .then((chats) => {
            chatListElement.innerHTML = ""; // Clear existing chats
            chats.forEach((chat) => {
                const chatItem = document.createElement("div");
                chatItem.classList.add("chat");
                chatItem.dataset.id = chat.id;
                chatItem.innerHTML = `
                    <div class="chat-pic"></div>
                    <div class="chat-info">
                        <h3>${chat.name}</h3>
                        <p>Click to view messages...</p>
                    </div>
                `;
                chatItem.addEventListener("click", () => openChat(chat.id, chat.name));
                chatListElement.appendChild(chatItem);
            });
        })
        .catch((error) => console.error("Error loading chats:", error));
}

/**
 * Open a specific chat and load its messages
 * @param {number} chatId - ID of the chat to open
 * @param {string} chatName - Name of the chat to display
 */
function openChat(chatId, chatName) {
    currentChatId = chatId;

    // Update the chat header
    chatHeaderElement.innerHTML = `
        <h3>${chatName}</h3>
        <p>Online</p>
    `;

    // Fetch messages for the selected chat
    fetch(`${API_BASE_URL}/messages/${chatId}`)
        .then((response) => response.json())
        .then((messages) => {
            chatBodyElement.innerHTML = ""; // Clear existing messages
            messages.forEach((message) => {
                const messageElement = document.createElement("div");
                messageElement.classList.add("message");
                messageElement.classList.add(message.sender === "Me" ? "sent" : "received");
                messageElement.innerHTML = `
                    <p>${message.content}</p>
                    <span class="time">${new Date(message.time).toLocaleTimeString()}</span>
                `;
                chatBodyElement.appendChild(messageElement);
            });
        })
        .catch((error) => console.error("Error loading messages:", error));
}

/**
 * Send a new message
 */
function sendMessage() {
    const messageContent = chatInputElement.value.trim();
    if (!messageContent || !currentChatId) return;

    const newMessage = {
        sender: "Me", // Sender is always 'Me' in this context
        content: messageContent,
    };

    fetch(`${API_BASE_URL}/messages/${currentChatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
    })
        .then((response) => response.json())
        .then((data) => {
            // Clear the input field
            chatInputElement.value = "";

            // Add the new message to the chat
            const messageElement = document.createElement("div");
            messageElement.classList.add("message", "sent");
            messageElement.innerHTML = `
                <p>${newMessage.content}</p>
                <span class="time">${new Date().toLocaleTimeString()}</span>
            `;
            chatBodyElement.appendChild(messageElement);

            // Scroll to the bottom of the chat
            chatBodyElement.scrollTop = chatBodyElement.scrollHeight;
        })
        .catch((error) => console.error("Error sending message:", error));
}

/**
 * Search chats by name
 * @param {string} query - The search query
 */
function searchChats(query) {
    fetch(`${API_BASE_URL}/search?q=${query}`)
        .then((response) => response.json())
        .then((results) => {
            chatListElement.innerHTML = ""; // Clear existing chats
            results.forEach((chat) => {
                const chatItem = document.createElement("div");
                chatItem.classList.add("chat");
                chatItem.dataset.id = chat.id;
                chatItem.innerHTML = `
                    <div class="chat-pic"></div>
                    <div class="chat-info">
                        <h3>${chat.name}</h3>
                        <p>Click to view messages...</p>
                    </div>
                `;
                chatItem.addEventListener("click", () => openChat(chat.id, chat.name));
                chatListElement.appendChild(chatItem);
            });
        })
        .catch((error) => console.error("Error searching chats:", error));
}

// Event Listeners
chatSendButton.addEventListener("click", sendMessage);
chatInputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendMessage();
});

// Search input event listener
document.getElementById("search-input").addEventListener("input", (event) => {
    const query = event.target.value.trim();
    if (query) {
        searchChats(query);
    } else {
        loadChats();
    }
});

// Load chats when the page is ready
document.addEventListener("DOMContentLoaded", loadChats);

