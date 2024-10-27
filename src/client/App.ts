import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { Menu } from "./Menu";
import { Game } from "./Game";
import { GameOver } from "./GameOver";
import { io, Socket } from 'socket.io-client/build/esm/index';
import { on as socketOn } from "socket.io-client/build/esm/on";


class App {
    private socket: Socket = io("http://localhost:3000");
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    private canvas: HTMLCanvasElement;
    private Menu!: Menu;
    private Game!: Game;
    private GameOver!: GameOver;
    private gameIsOver!: boolean;
    private score = 0;
    private maxScore = 0;
    private isNewMaxScore = false;

    /**
     * Initializes the game engine and the scene.
     * Adds event listeners for the `keydown` event to be able to capture the key presses and forward them to the current game.
     * Adds event listener for the `resize` event to be able to resize the engine when the window is resized.
     * Runs the render loop of the engine.
     * When the game is over, it disposes the current scene and creates a new one, and resets the camera position.
     */
    constructor() {
        this.canvas = (document.getElementById("renderCanvas") as unknown) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas);
        this.scene = new BABYLON.Scene(this.engine);

        window.addEventListener("resize", () => {
            this.engine.resize();

            if (this.gameIsOver) {
                this.scene.render();
            }
        });

        window.addEventListener("keydown", (event) => {
            if (!this.Game) {
                return;
            }

            if (event.shiftKey && event.ctrlKey && event.altKey && event.key === "D") {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }

            this.Game.keyDown(event);
        });

        this.createScene(this.scene);

        this.registerRenderLoop();
    }

    /**
     * Creates a scene with the game, including the camera, light, and game itself.
     * If the game is over, it creates a GameOver object and waits for a pointer down event before
     * creating a new Game object, otherwise it creates a Menu object and waits for a pointer down
     * event before creating a new Game object.
     * @param scene The scene to create the game in.
     */
    private createScene(scene: BABYLON.Scene): void {
        const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(4.5, 9.5, 4.5), this.scene);
        camera.setPosition(new BABYLON.Vector3(4.5, 9.5, 35));
        camera.attachControl(this.canvas, true);

        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        if (this.gameIsOver) {
            this.GameOver = new GameOver(this.score, this.maxScore, this.isNewMaxScore);

            this.engine.stopRenderLoop();

            const pointerDown = scene.onPointerObservable.add((pointerInfo) => {
                if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                    scene.onPointerObservable.remove(pointerDown);
                    this.GameOver.hide();

                    this.gameIsOver = false;
                    this.Menu = new Menu(this.socket);

                    this.onGameStarting(scene);

                    this.registerRenderLoop();
                }
            });
        } else {
            this.Menu = new Menu(this.socket);

            this.onGameStarting(scene);
        }
    }

    /**
     * Registers the render loop of the engine.
     * When the game is not over, it renders the current scene.
     * When the game is over, it disposes the current scene, creates a new one, and resets the camera position.
     */
    private registerRenderLoop(): void {
        this.engine.runRenderLoop(() => {
            if (!this.gameIsOver) {
                this.scene.render();
            } else {
                this.changeScene();
            }
        });
    }

    /**
     * Changes the current scene by disposing of the existing one and creating a new scene.
     * Sets up the camera and light for the new scene and renders it.
     * The camera is positioned and attached to the canvas for user control.
     * The new scene is initialized through the createScene function.
     */
    private changeScene() {
        this.scene.dispose();

        const nextScene = new BABYLON.Scene(this.engine);
        this.createScene(nextScene);
        this.scene = nextScene;

        const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(4.5, 9.5, 4.5), this.scene);
        camera.setPosition(new BABYLON.Vector3(4.5, 9.5, 35));
        camera.attachControl(this.canvas, true);

        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        nextScene.render();
    }

    /**
     * Handles the "gameStarting" socket event.
     * Initializes the game when the event is triggered and hides the menu.
     * Sets up the scene to check if the game is over before each render.
     * Updates the game state and score, and checks for a new max score.
     *
     * @param scene - The Babylon.js scene to be used for the game.
     */
    private onGameStarting(scene: BABYLON.Scene) {
        socketOn(this.socket, "gameStarting", () => {
            console.log("Game starting...");
            this.Menu.hide();
            this.Game = new Game(this.socket, this.Menu.roomId, scene, this.maxScore);

            scene.registerBeforeRender(() => {
                if (this.Game.gameIsOver) {
                    this.gameIsOver = true;
                    this.score = this.Game.score;

                    if (this.maxScore < this.Game.score) {
                        this.maxScore = this.Game.score;
                        this.isNewMaxScore = true;
                    } else {
                        this.isNewMaxScore = false;
                    }
                }
            });
        });
    }
}


new App();
