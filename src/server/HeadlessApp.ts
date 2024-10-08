import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { HeadlessGame } from "./HeadlessGame";
import express, { Request, Response } from 'express';
import { createServer } from 'node:http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server } from 'socket.io/dist/index';
import { pickRandomTetracube } from './randomizeTetracube';


export class HeadlessApp {
    private headlessGame: HeadlessGame;
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
        // Define the structure of a room
        interface Room {
            players: string[]; // List of player socket IDs
            currentPlayerIndex: number; // Index of the current player
        }

        // Define the structure of rooms, indexed by roomId
        const rooms: { [key: string]: Room } = {};

        this.io.on('connection', (socket) => {
            socket.on('joinRoom', (roomId: string) => {
                console.log(`Player ${socket.id} joined room ${roomId}`);
                socket.join(roomId);

                // Initialize room if not existing
                if (!rooms[roomId]) {
                    rooms[roomId] = { players: [], currentPlayerIndex: 0 };
                }

                rooms[roomId].players.push(socket.id);

                // Notify all players about new player joining
                this.io.to(roomId).emit('playerJoined', rooms[roomId].players);

                //const headlessApp = new HeadlessApp();

                const tetracube: string = pickRandomTetracube();
                const position = new BABYLON.Vector3(0, 20, 0); //= headlessApp.headlessGame.headlessTetracube.generatePosition();
                const rotation = new BABYLON.Vector3(0, 0, 0); //= headlessApp.headlessGame.headlessTetracube.generateRotation(position);
                console.log(`Generated tetracube: ${tetracube}`);
                console.log(`Generated position: ${position}`);
                console.log(`Generated rotation: ${rotation}`);

                this.io.to(roomId).emit('generateTetracube', [tetracube, position, rotation]);
            });

            socket.on('tetracubeGenerated', (roomId: string) => {
                const room = rooms[roomId];
                if (room) {
                    const currentPlayer = room.players[room.currentPlayerIndex];

                    // Notify the current player that they control the tetracube
                    this.io.to(currentPlayer).emit('controlTetracube');

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
        this.server.listen(this.port, () => {
            console.log(`Server is running at http://localhost:${this.port}`);
        });

        const engine = new BABYLON.NullEngine();
        const scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(-1.5, 9.5, 4.5), scene);
        camera.setPosition(new BABYLON.Vector3(-1.5, 9.5, 35));

        this.headlessGame = new HeadlessGame(scene);

        //engine.runRenderLoop(() => {
        //    scene.render();
        //    engine.resize();
        //    this.headlessGame.update();
        //});
    }
}


new HeadlessApp();
