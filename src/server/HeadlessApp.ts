import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { HeadlessGame } from "./HeadlessGame";
import express, { Request, Response } from 'express';
import { createServer } from 'node:http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server } from 'socket.io/dist/index';
import { pickRandomTetracube } from './randomizeTetracube';
import * as Matrices from "../client/rotationMatrices";


// Define the structure of a room
interface Room {
    players: string[]; // List of player socket IDs
    currentPlayerIndex: number; // Index of the current player
    maxPlayers: number; // The total number of players expected to join the room
    gameStarted: boolean; // Flag to indicate if the game has started
}


export class HeadlessApp {
    private Game!: HeadlessGame;
    private __filename = fileURLToPath(import.meta.url);
    private __dirname = dirname(this.__filename);
    private app = express();
    private server = createServer(this.app);
    private port = process.env.PORT || 3000;
    private io = new Server(this.server, {
        connectionStateRecovery: {
            // The backup duration of the sessions and the packets
            maxDisconnectionDuration: 2 * 60 * 1000,
            // Whether to skip middlewares upon successful recovery
            skipMiddlewares: true,
        }
    });
    private rooms: { [key: string]: Room } = {};

    /**
     * Initializes the application.
     *
     * This function sets up the headless engine and the scene.
     * It also sets up the event listeners for keyboard input and the render loop.
     */
    constructor() {
        // Serve static files (e.g., Webpack bundle)
        this.app.use(express.static(path.join(this.__dirname, '../../dist')));

        // Serve index.html
        this.app.get('/', (req: Request, res: Response) => {
            res.sendFile(path.join(this.__dirname, '../../public/index.html'));
        });

        const engine = new BABYLON.NullEngine();
        const scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(-1.5, 9.5, 4.5), scene);
        camera.setPosition(new BABYLON.Vector3(-1.5, 9.5, 35));

        //this.Game = new HeadlessGame(scene);
        //scene.render();
        //engine.resize();
        //this.Game.update();

        //engine.runRenderLoop(() => {
        //    scene.render();
        //    engine.resize();
        //    this.Game.update();
        //});

        // Set the maximum number of players required to start the game
        const maxPlayers = 2;

        this.io.on('connection', (socket) => {
            socket.on('joinRoom', (roomId: string) => {
                console.log(`Player ${socket.id} joined room ${roomId}`);
                socket.join(roomId);

                // Initialize room if not existing
                if (!this.rooms[roomId]) {
                    this.rooms[roomId] = { players: [], currentPlayerIndex: 0, maxPlayers, gameStarted: false };
                }

                const room = this.rooms[roomId];

                // Add player to the room if they haven't already joined
                if (!room.players.includes(socket.id)) {
                    room.players.push(socket.id);
                    console.log(`Player ${socket.id} joined room ${roomId}`);
                }

                // Notify all players about the new player joining
                this.io.to(roomId).emit('playerJoined', room.players);

                // Check if the number of players matches the maxPlayers
                if (room.players.length === room.maxPlayers && !room.gameStarted) {
                    // Start the game only when all players have joined
                    room.gameStarted = true;

                    // Notify players the game is starting
                    this.io.to(roomId).emit('gameStarting');
                    console.log(`Game started in room ${roomId}`);

                    // Trigger tetracube generation for the first time
                    this.generateTetracube(roomId);
                }
            });

            socket.on('tetracubeGenerated', (roomId: string) => {
                const room = this.rooms[roomId];
                if (room) {
                    // Generate the next tetracube after the current one is placed
                    this.generateTetracube(roomId);
                }
            });

            socket.on('disconnect', () => {
                // Handle player disconnection and update the room
                console.log(`Player ${socket.id} disconnected`);
                for (const roomId in this.rooms) {
                    const room = this.rooms[roomId];
                    if (room.players.includes(socket.id)) {
                        room.players = room.players.filter(player => player !== socket.id);
                        this.io.to(roomId).emit('playerLeft', socket.id);
                        break;
                    }
                }
            });
        });

        // Start the server
        this.server.listen(this.port, () => {
            console.log(`Server is running at http://localhost:${this.port}`);
        });
    }

    // Generate a new tetracube for the current room
    private generateTetracube(roomId: string) {
        const room = this.rooms[roomId];
        if (!room) return;

        const tetracube: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3" = pickRandomTetracube();
        const position = new BABYLON.Vector3(0, 5, 0); // Placeholder for generating position
        const rotation = Matrices.rotationMatrixX90; // Placeholder for generating rotation
        console.log(`Generated tetracube: ${tetracube}`);
        console.log(`Generated position: ${position}`);
        console.log(`Generated rotation: ${rotation}`);

        // Emit tetracube generation event to all players
        this.io.to(roomId).emit('generateTetracube', [tetracube, position, rotation]);
        //this.io.to(roomId).emit('update');

        // After generating a tetracube, notify the current player to control it
        const currentPlayer = room.players[room.currentPlayerIndex];
        this.io.to(currentPlayer).emit('controlTetracube');

        // Move to the next player in the list for the next tetracube
        // room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
    }
}


new HeadlessApp();
