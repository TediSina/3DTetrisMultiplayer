import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import {Game} from "./Game";
import { io } from 'socket.io-client/build/esm/index';


const socket = io();


class App {
    private Game: Game;

    /**
     * Initializes the application.
     *
     * This function sets up the render canvas, the engine, the scene, the camera, and the light.
     * It also sets up the event listeners for keyboard input and the render loop.
     *
     * @remarks
     * This function is called automatically when the application is started.
     */
    constructor() {
        const canvas = (document.getElementById("renderCanvas") as unknown) as HTMLCanvasElement;
        const engine = new BABYLON.Engine(canvas);
        const scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(-1.5, 9.5, 4.5), scene);
        camera.setPosition(new BABYLON.Vector3(-1.5, 9.5, 35));
        camera.attachControl(canvas, true);
        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        this.Game = new Game(scene);

        window.addEventListener("keydown", (event) => {
            if (event.shiftKey && event.ctrlKey && event.altKey && event.key === "D") {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }

            this.Game.keyDown(event);
        });

        engine.runRenderLoop(() => {
            scene.render();
            engine.resize();
            this.Game.update();
        });
    }
}


new App();
