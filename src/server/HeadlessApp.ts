import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import {HeadlessGame} from "./HeadlessGame";


export class HeadlessApp {
    public headlessGame: HeadlessGame;

    /**
     * Initializes the application.
     *
     * This function sets up the headless engine and the scene.
     * It also sets up the event listeners for keyboard input and the render loop.
     */
    constructor() {
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
