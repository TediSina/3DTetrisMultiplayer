import express, { Request, Response } from 'express';
import { createServer } from 'node:http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server } from 'socket.io/dist/index';
import { HeadlessApp } from './HeadlessApp';
import { pickRandomTetracube } from './randomizeTetracube';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const io = new Server(server, {
    connectionStateRecovery: {
        // The backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        // Whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    }
});

// Serve static files (e.g., Webpack bundle)
app.use(express.static(path.join(__dirname, '../../dist')));

// Serve index.html
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});


// Define the structure of a room
interface Room {
    players: string[]; // List of player socket IDs
    currentPlayerIndex: number; // Index of the current player
}

// Define the structure of rooms, indexed by roomId
const rooms: { [key: string]: Room } = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId: string) => {
        console.log(`Player ${socket.id} joined room ${roomId}`);
        socket.join(roomId);

        // Initialize room if not existing
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], currentPlayerIndex: 0 };
        }

        rooms[roomId].players.push(socket.id);

        // Notify all players about new player joining
        io.to(roomId).emit('playerJoined', rooms[roomId].players);
    });

    //const headlessApp = new HeadlessApp();

    //const tetracube: string = pickRandomTetracube();
    //const position = headlessApp.headlessGame.headlessTetracube.generatePosition();
    //const rotation = headlessApp.headlessGame.headlessTetracube.generateRotation(position);

    socket.emit('generateTetracube', 'roomId123', /* tetracube, position, rotation */);

    socket.on('tetracubeGenerated', (roomId: string) => {
        const room = rooms[roomId];
        if (room) {
            const currentPlayer = room.players[room.currentPlayerIndex];

            // Notify the current player that they control the tetracube
            io.to(currentPlayer).emit('controlTetracube');

            // Move to the next player in the list for the next tetracube
            room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        }
    });

    socket.on('disconnect', () => {
        // Handle player disconnection and update the room
        console.log(`Player ${socket.id} disconnected`);
    });
});


// Start the server
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
