import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { HeadlessGame } from "./HeadlessGame";
import express, { Request, Response } from 'express';
import { createServer } from 'node:http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server } from 'socket.io/dist/index';


// Define the structure of a room
export interface Room {
    roomId: string; // Unique identifier for the room
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
        this.app.use(express.static(path.join(this.__dirname, '../../dist')));

        this.app.get('/', (req: Request, res: Response) => {
            res.sendFile(path.join(this.__dirname, '../../public/index.html'));
        });

        const engine = new BABYLON.NullEngine();
        const scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(-1.5, 9.5, 4.5), scene);
        camera.setPosition(new BABYLON.Vector3(-1.5, 9.5, 35));

        const maxPlayers = 2;

        this.io.on('connection', (socket) => {
            console.log(`Player ${socket.id} connected`);
            socket.on('joinRoom', (roomId: string) => {
                console.log(`Player ${socket.id} joined room ${roomId}`);
                socket.join(roomId);

                if (!this.rooms[roomId]) {
                    this.rooms[roomId] = { roomId: roomId, players: [], currentPlayerIndex: 0, maxPlayers, gameStarted: false };

                    console.log(`Room ${roomId} created`);
                }

                const room = this.rooms[roomId];

                if (!room.players.includes(socket.id)) {
                    room.players.push(socket.id);
                    console.log(`Player ${socket.id} joined room ${roomId}`);
                }

                this.io.to(roomId).emit('playerJoined', room.players);

                console.log(`Players in room ${roomId}: ${room.players.join(', ')}`);

                if (room.players.length === room.maxPlayers && !room.gameStarted) {
                    room.gameStarted = true;

                    this.io.to(roomId).emit('gameStarting');
                    console.log(`Game started in room ${roomId}`);

                    this.io.to(room.players[room.currentPlayerIndex]).emit("tetracubeControl");

                    this.Game = new HeadlessGame(this.io, room, scene);

                    engine.runRenderLoop(() => {
                        if (this.Game.gameIsOver === false || room.players.length > 0) {
                            this.Game.update();
                        } else {
                            this.Game.gameIsOver = true;
                            engine.stopRenderLoop();
                        }
                    });
                }

                socket.on("gameStarting", () => {
                    engine.runRenderLoop(() => {
                        if (this.Game.gameIsOver === false || room.players.length > 0) {
                            this.Game.update();
                        } else {
                            this.Game.gameIsOver = true;
                            engine.stopRenderLoop();
                        }
                    });
                });

                socket.on("wKeyPressed", () => {
                    if (socket.id === room.players[room.currentPlayerIndex]) {
                        this.Game.keyDown("w");
                    }
                });

                socket.on("aKeyPressed", () => {
                    if (socket.id === room.players[room.currentPlayerIndex]) {
                        this.Game.keyDown("a");
                    }
                });

                socket.on("sKeyPressed", () => {
                    if (socket.id === room.players[room.currentPlayerIndex]) {
                        this.Game.keyDown("s");
                    }
                });

                socket.on("dKeyPressed", () => {
                    if (socket.id === room.players[room.currentPlayerIndex]) {
                        this.Game.keyDown("d");
                    }
                });

                socket.on("eKeyPressed", () => {
                    if (socket.id === room.players[room.currentPlayerIndex]) {
                        this.Game.keyDown("e");
                    }
                });
                
                socket.on("qKeyPressed", () => {
                    if (socket.id === room.players[room.currentPlayerIndex]) {
                        this.Game.keyDown("q");
                    }
                });

                socket.on("rKeyPressed", () => {
                    if (socket.id === room.players[room.currentPlayerIndex]) {
                        this.Game.keyDown("r");
                    }
                });

                socket.on("shiftKeyPressed", () => {
                    if (socket.id === room.players[room.currentPlayerIndex]) {
                        this.Game.timeStep += 10;
                    }
                });

                socket.on("leaveRoom" , (roomId: string) => {
                    if (!(roomId in this.rooms)) {
                        console.log(`Room ${roomId} not found`);
                        return;
                    }

                    console.log(`Player ${socket.id} left room ${roomId}`);
                    socket.leave(roomId);
                    this.rooms[roomId].players = this.rooms[roomId].players.filter(player => player !== socket.id);
                    this.io.to(roomId).emit('playerLeft', socket.id);
                    console.log(`Room ${roomId} has ${this.rooms[roomId].players.length} players`);

                    if (this.rooms[roomId].players.length === 0) {
                        delete this.rooms[roomId];
                        console.log(`Room ${roomId} deleted`);
                        this.Game.gameIsOver = true;
                        engine.stopRenderLoop();
                    }
                });
            });

            socket.on('disconnect', () => {
                console.log(`Player ${socket.id} disconnected`);
                for (const roomId in this.rooms) {
                    const room = this.rooms[roomId];

                    if (room.players.includes(socket.id)) {
                        room.players = room.players.filter(player => player !== socket.id);
                        this.io.to(roomId).emit('playerLeft', socket.id);
                        console.log(`Player ${socket.id} left room ${roomId}`);
                        console.log(`Room ${roomId} has ${room.players.length} players`);

                        if (room.players.length === 0) {
                            delete this.rooms[roomId];
                            console.log(`Room ${roomId} deleted`);
                            if (this.Game) {
                                this.Game.gameIsOver = true;
                            }
                            engine.stopRenderLoop();
                        }

                        break;
                    }
                }
            });
        });

        this.server.listen(this.port, () => {
            console.log(`Server is running at http://localhost:${this.port}`);
        });
    }
}


new HeadlessApp();
