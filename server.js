import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const hostname = '127.0.0.1';

// Create the HTTP server
const server = http.createServer((req, res) => {
    // Set the response HTTP header with HTTP status and Content Type
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    // Send the response body "Hello World"
    res.end('Hello, World!\n');
});

const wss = new WebSocketServer({
    server
});

wss.on('connection', (socket, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const username = url.searchParams.get("username") || "Anonymous";

    const broadcast = (message) => {
        const payload = JSON.stringify(message);

        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(payload);
            }
        });
    };

    broadcast({
        type: "system",
        text: `${username} has joined the chat.`,
    });

    socket.on('message', (data) => {
        const { username, text } = JSON.parse(data.toString());

        broadcast({
            type: 'chat',
            username,
            text
        })
    })

    socket.on('close', () => {
        broadcast({
            type: 'system',
            text: `${username} left`
        })
    })

    socket.on('error', (err) => {
        console.error(err);
    })
})


server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
});