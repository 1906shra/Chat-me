const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load mock data
const chatsFile = "./data/chats.json";

// Default route for root URL
app.get("/", (req, res) => {
    res.send("Welcome to the Chat API!");
});

// Get all chats
app.get("/api/chats", (req, res) => {
    fs.readFile(chatsFile, "utf8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Failed to load chats" });
        } else {
            res.json(JSON.parse(data).chats);
        }
    });
});

// Get messages for a specific chat
app.get("/api/chats/:chatId/messages", (req, res) => {
    const chatId = req.params.chatId;
    fs.readFile(chatsFile, "utf8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Failed to load messages" });
        } else {
            const chats = JSON.parse(data).chats;
            const chat = chats.find((c) => c.id === parseInt(chatId));
            if (chat) {
                res.json(chat.messages);
            } else {
                res.status(404).json({ error: "Chat not found" });
            }
        }
    });
});

// Send a new message
app.post("/api/chats/:chatId/messages", (req, res) => {
    const chatId = req.params.chatId;
    const newMessage = req.body;
    fs.readFile(chatsFile, "utf8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Failed to save message" });
        } else {
            const chats = JSON.parse(data).chats;
            const chat = chats.find((c) => c.id === parseInt(chatId));
            if (chat) {
                chat.messages.push(newMessage);
                fs.writeFile(chatsFile, JSON.stringify({ chats }), (err) => {
                    if (err) {
                        res.status(500).json({ error: "Failed to update chat" });
                    } else {
                        res.status(201).json({ message: "Message sent" });
                    }
                });
            } else {
                res.status(404).json({ error: "Chat not found" });
            }
        }
    });
});

// Search chats by name
app.get("/api/search", (req, res) => {
    const query = req.query.q?.toLowerCase();
    fs.readFile(chatsFile, "utf8", (err, data) => {
        if (err) {
            res.status(500).json({ error: "Failed to load chats" });
        } else {
            const chats = JSON.parse(data).chats;
            const results = chats.filter((chat) =>
                chat.name.toLowerCase().includes(query)
            );
            res.json(results);
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
