import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { createBoundaryMesh } from "./createBoundaryMesh";
import * as Tetracubes from "./createTetracubes";
import { positionTetracube, rotateTetracube } from "./generateTetracube";
import { checkTetracubePosition, calculateTetracubeCubePosition } from "./checkTetracubePosition";
import { checkTetracubeRotation } from "./checkTetracubeRotation";
import { Tetracube } from "./Tetracube";
import { io, Socket } from 'socket.io-client/build/esm/index';
import { on as socketOn } from "socket.io-client/build/esm/on";


export class Game {
    private socket: Socket = io();
    private scene: BABYLON.Scene;
    public Tetracube: Tetracube;
    private timeStep: number = 0;
    private timeCheck: number = 60;
    private matrixMap: number[][][] = [];

    /**
     * Constructor for Game.
     * @param scene - The scene to create the game in.
     */
    constructor(scene: BABYLON.Scene) {
        this.socket.emit('joinRoom', 'roomId123');
        this.scene = scene;
        this.Tetracube = new Tetracube(this.socket, this.scene);

        this.initializeMatrixMap(10, 22, 10);

        const boundary: BABYLON.Mesh = createBoundaryMesh(scene, 10, 20, 10, [0, 4, 2]);
        boundary.position.x = -1.5;
        boundary.position.y = 9.5;
        boundary.position.z = 4.5;

        const I_tetracube = Tetracubes.createI_Tetracube(scene);
        positionTetracube(I_tetracube, new BABYLON.Vector3(-20, 0, -5));

        const LJ_tetracube = Tetracubes.createLJ_Tetracube(scene);
        positionTetracube(LJ_tetracube, new BABYLON.Vector3(-15, 0, -5));

        const SZ_tetracube = Tetracubes.createSZ_Tetracube(scene);
        positionTetracube(SZ_tetracube, new BABYLON.Vector3(-10, 0, -5));

        const O_tetracube = Tetracubes.createO_Tetracube(scene);
        positionTetracube(O_tetracube, new BABYLON.Vector3(-5, 0, -5));

        const T_tetracube = Tetracubes.createT_Tetracube(scene);
        positionTetracube(T_tetracube, new BABYLON.Vector3(0, 0, -5));

        const Tower1_Tetracube = Tetracubes.createTower1_Tetracube(scene);
        positionTetracube(Tower1_Tetracube, new BABYLON.Vector3(5, 0, -5));

        const Tower2_Tetracube = Tetracubes.createTower2_Tetracube(scene);
        positionTetracube(Tower2_Tetracube, new BABYLON.Vector3(10, 0, -5));

        const Tower3_Tetracube = Tetracubes.createTower3_Tetracube(scene);
        positionTetracube(Tower3_Tetracube, new BABYLON.Vector3(15, 0, -5));

        // TODO: Fix this
        //socketOn(this.socket, 'generateTetracube', (data) => {
        //    switch (data.tetracube) {
        //        case 'I':
        //            this.Tetracube.cubes = Tetracubes.createI_Tetracube(scene);
        //            break;
        //        case 'LJ':
        //            this.Tetracube.cubes = Tetracubes.createLJ_Tetracube(scene);
        //            break;
        //        case 'SZ':
        //            this.Tetracube.cubes = Tetracubes.createSZ_Tetracube(scene);
        //            break;
        //        case 'O':
        //            this.Tetracube.cubes = Tetracubes.createO_Tetracube(scene);
        //            break;
        //        case 'T':
        //            this.Tetracube.cubes = Tetracubes.createT_Tetracube(scene);
        //            break;
        //        case 'Tower1':
        //            this.Tetracube.cubes = Tetracubes.createTower1_Tetracube(scene);
        //            break;
        //        case 'Tower2':
        //            this.Tetracube.cubes = Tetracubes.createTower2_Tetracube(scene);
        //            break;
        //        case 'Tower3':
        //            this.Tetracube.cubes = Tetracubes.createTower3_Tetracube(scene);
        //            break;
        //    }
        //    this.Tetracube.positionTetracube(data.position);
        //    this.Tetracube.rotateTetracube(data.rotation);
        //});
        this.Tetracube.generateTetracube();
    }

    private initializeMatrixMap(width: number, height: number, depth: number) {
        this.matrixMap = Array.from({ length: width }, () =>
            Array.from({ length: height }, () =>
                Array(depth).fill(0)
            )
        );
    }

    private updateMatrixMap(cubes: BABYLON.Mesh[], value: number) {
        for (const cube of cubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
            
            if (
                x >= -6 && x <= 3 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                this.matrixMap[x + 6][y][z] = value;
            } else {
                console.warn(`Position out of bounds: (${x}, ${y}, ${z})`);
            }
        }
    }

    private moveTetracubeDown() {
        this.updateMatrixMap(this.Tetracube.getCubes(), 0);

        positionTetracube(this.Tetracube.getCubes(), new BABYLON.Vector3(0, -1, 0));

        this.updateMatrixMap(this.Tetracube.getCubes(), 1);
    }

    private tetracubeHasReachedBottom(): boolean {
        if (this.Tetracube.getCubes().some(cube => cube.position.y <= 0)) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 1);
            return true;
        }
        return false;
    }

    private cubesHaveCollided(): boolean {
        // TODO: Fix this and other matrix functions.
        const tetracubeCubes = this.Tetracube.getCubes();
        const occupiedPositions = new Set();
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
            occupiedPositions.add(`${x},${y},${z}`);
        }
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
    
            if (
                x >= -6 && x <= 3 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                if (!occupiedPositions.has(`${x},${y},${z}`) && this.matrixMap[x + 6][y][z] === 1) {
                    return true;
                }
            }
        }
    
        return false;
    }

    public update(): void {
        if (this.timeStep >= this.timeCheck) {
            if (this.Tetracube && (this.tetracubeHasReachedBottom() || this.cubesHaveCollided())) {
                this.Tetracube.generateTetracube();

                // Listen for tetracube control event
                socketOn(this.socket, 'controlTetracube', () => {
                    console.log("You control the tetracube now!");
                
                    // Activate tetracube movement and controls here
                    // E.g., enable keyboard inputs to control the current tetracube
                });
            }
            
            const positionIsValid = checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, -1, 0));

            if (positionIsValid) {
                this.moveTetracubeDown();
            }

            this.timeStep = 0;
        }

        this.timeStep++;
    }

    public keyDown(event: KeyboardEvent): void {
        // TODO: Fix Tetracube rotation.
        if (event.key === "g" || event.key === "G") {
            this.Tetracube.generateTetracube();
        } else if (event.shiftKey) {
            this.timeStep += 10; 
        } else if (event.key === "w" || event.key === "W") {
            if (checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, -1))) {
                this.Tetracube.getCubes().forEach(cube => {
                    cube.position = new BABYLON.Vector3(cube.position.x, cube.position.y, cube.position.z - 1);
                })
            }
        } else if (event.key === "s" || event.key === "S") {
            if (checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 1))) {
                this.Tetracube.getCubes().forEach(cube => {
                    cube.position = new BABYLON.Vector3(cube.position.x, cube.position.y, cube.position.z + 1);
                })
            }
        } else if (event.key === "a" || event.key === "A") {
            if (checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(1, 0, 0))) {
                this.Tetracube.getCubes().forEach(cube => {
                    cube.position = new BABYLON.Vector3(cube.position.x + 1, cube.position.y, cube.position.z);
                })
            }
        } else if (event.key === "d" || event.key === "D") {
            if (checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(-1, 0, 0))) {
                this.Tetracube.getCubes().forEach(cube => {
                    cube.position = new BABYLON.Vector3(cube.position.x - 1, cube.position.y, cube.position.z);
                })
            }
        } else if (event.key === "q" || event.key === "Q") {
            const rotationX = Math.PI / 2;
            const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 0));

            if (checkTetracubeRotation(cubePositions, new BABYLON.Vector3(rotationX, 0, 0))) {
                rotateTetracube(this.Tetracube.getCubes(), new BABYLON.Vector3(rotationX, 0, 0));
            }
        } else if (event.key === "e" || event.key === "E") {
            const rotationY = Math.PI / 2;
            const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 0));

            if (checkTetracubeRotation(cubePositions, new BABYLON.Vector3(0, rotationY, 0))) {  
                rotateTetracube(this.Tetracube.getCubes(), new BABYLON.Vector3(0, rotationY, 0));
            }
        } else if (event.key === "r" || event.key === "R") {
            const rotationZ = Math.PI / 2;
            const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 0));

            if (checkTetracubeRotation(cubePositions, new BABYLON.Vector3(0, 0, rotationZ))) {
                rotateTetracube(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, rotationZ));
            }
        }
    }
}
