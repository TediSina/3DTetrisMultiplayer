import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { createBoundaryMesh } from "../client/createBoundaryMesh";
import * as Tetracubes from "../client/createTetracubes";
import { positionTetracube, rotateTetracube } from "../client/generateTetracube";
import { checkTetracubePosition, calculateTetracubeCubePosition } from "../client/checkTetracubePosition";
import { checkTetracubeRotation } from "../client/checkTetracubeRotation";
import { HeadlessTetracube } from "./HeadlessTetracube";
import { io, Socket } from 'socket.io-client/build/esm/index';
import { on as socketOn } from "socket.io-client/build/esm/on";


export class HeadlessGame {
    private scene: BABYLON.Scene;
    private Tetracube: HeadlessTetracube;
    private timeStep = 0;
    private timeCheck = 60;
    private matrixMap: number[][][] = [];

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.Tetracube = new HeadlessTetracube(this.scene);

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

        this.Tetracube.generateTetracube();
        this.updateMatrixMap(this.Tetracube.getCubes(), 1);
    }

    private initializeMatrixMap(width: number, height: number, depth: number) {
        this.matrixMap = Array.from({ length: width }, () =>
            Array.from({ length: height }, () =>
                Array(depth).fill(0)
            )
        );

        console.log(this.matrixMap);
    }

    private updateMatrixMap(cubes: BABYLON.Mesh[], value: number) {
        for (const cube of cubes) {
            const x = cube.position.x;
            const y = cube.position.y;
            const z = cube.position.z;
            
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
        const tetracubeCubes = this.Tetracube.getCubes();
        const occupiedPositions = new Set();
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
            occupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(occupiedPositions);
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
    
            if (
                x >= -6 && x <= 3 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                if (!occupiedPositions.has(`${x},${y - 1},${z}`) && this.matrixMap[x + 6][y - 1][z] === 1) {
                    console.log("Collided", x, y - 1, z);
                    return true;
                }
            }
        }
    
        return false;
    }

    public update(): void {
        if (this.timeStep >= this.timeCheck) {
            if (this.tetracubeHasReachedBottom()) {
                this.Tetracube.generateTetracube();
            }
            
            const positionIsValid = checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, -1, 0));

            if (positionIsValid && !this.cubesHaveCollided()) {
                this.moveTetracubeDown();
            } else {
                this.Tetracube.generateTetracube();
            }

            this.timeStep = 0;
        }

        this.timeStep++;
    }

    /**
     * Checks if the Tetracube can move west.
     * @returns If the Tetracube can move west.
     */
    public checkW(): boolean {
        const tetracubeCubes = this.Tetracube.getCubes();
        const occupiedPositions = new Set();
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
            occupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(occupiedPositions);
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
    
            if (
                x >= -6 && x <= 3 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!occupiedPositions.has(`${x},${y},${z - 1}`) && this.matrixMap[x + 6][y][z - 1] === 1) {
                        console.log("Collided", x, y, z - 1);
                        return true;
                    }
                } catch (error) {
                    console.log("Movement out of bounds");
                }
            }
        }
    
        return false;
    }

    /**
     * Moves the current tetracube one unit to the west (i.e. decreases its z position by 1)
     * if the resulting position is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public moveW(): void {
        if (!this.checkW() && checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, -1))) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);

            this.Tetracube.getCubes().forEach(cube => {
                cube.position = new BABYLON.Vector3(cube.position.x, cube.position.y, cube.position.z - 1);
            });

            this.updateMatrixMap(this.Tetracube.getCubes(), 1);
        }
    }

    /**
     * Checks if the Tetracube can move east.
     * @returns If the Tetracube can move east.
     */
    public checkS(): boolean {
        const tetracubeCubes = this.Tetracube.getCubes();
        const occupiedPositions = new Set();
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
            occupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(occupiedPositions);
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
    
            if (
                x >= -6 && x <= 3 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!occupiedPositions.has(`${x},${y},${z + 1}`) && this.matrixMap[x + 6][y][z + 1] === 1) {
                        console.log("Collided", x, y, z + 1);
                        return true;
                    }
                } catch (error) {
                    console.log("Movement out of bounds");
                }
            }
        }
    
        return false;
    }

    /**
     * Moves the current tetracube one unit to the south (i.e. increases its z position by 1)
     * if the resulting position is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public moveS(): void {
        if (!this.checkS() && checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 1))) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);

            this.Tetracube.getCubes().forEach(cube => {
                cube.position = new BABYLON.Vector3(cube.position.x, cube.position.y, cube.position.z + 1);
            });

            this.updateMatrixMap(this.Tetracube.getCubes(), 1);
        }
    }

    /**
     * Checks if the Tetracube can move east.
     * @returns If the Tetracube can move east.
     */
    public checkA(): boolean {
        const tetracubeCubes = this.Tetracube.getCubes();
        const occupiedPositions = new Set();
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
            occupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(occupiedPositions);
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
    
            if (
                x >= -6 && x <= 3 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!occupiedPositions.has(`${x + 1},${y},${z}`) && this.matrixMap[x + 7][y][z] === 1) {
                        console.log("Collided", x + 1, y, z);
                        return true;
                    }
                } catch (error) {
                    console.log("Movement out of bounds");
                }
            }
        }
    
        return false;
    }

    /**
     * Moves the current tetracube one unit to the east (i.e. increases its x position by 1)
     * if the resulting position is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public moveA(): void {
        if (!this.checkA() && checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(1, 0, 0))) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);

            this.Tetracube.getCubes().forEach(cube => {
                cube.position = new BABYLON.Vector3(cube.position.x + 1, cube.position.y, cube.position.z);
            });

            this.updateMatrixMap(this.Tetracube.getCubes(), 1);
        }
    }

    /**
     * Checks if the Tetracube can move west.
     * @returns If the Tetracube can move west.
     */
    public checkD(): boolean {
        const tetracubeCubes = this.Tetracube.getCubes();
        const occupiedPositions = new Set();
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
            occupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(occupiedPositions);
    
        for (const cube of tetracubeCubes) {
            const x = Math.floor(cube.position.x);
            const y = Math.floor(cube.position.y);
            const z = Math.floor(cube.position.z);
    
            if (
                x >= -6 && x <= 3 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!occupiedPositions.has(`${x - 1},${y},${z}`) && this.matrixMap[x + 5][y][z] === 1) {
                        console.log("Collided", x - 1, y, z);
                        return true;
                    }
                } catch (error) {
                    console.log("Movement out of bounds");
                }
            }
        }
    
        return false;
    }

    /**
     * Moves the current tetracube one unit to the west (i.e. decreases its x position by 1)
     * if the resulting position is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public moveD(): void {
        if (!this.checkD() && checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(-1, 0, 0))) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);

            this.Tetracube.getCubes().forEach(cube => {
                cube.position = new BABYLON.Vector3(cube.position.x - 1, cube.position.y, cube.position.z);
            });
            
            this.updateMatrixMap(this.Tetracube.getCubes(), 1);
        }
    }

    /**
     * Rotates the current tetracube one quarter turn clockwise around the X axis
     * if the resulting rotation is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public rotateQ(): void {
        const rotationX = Math.PI / 2;
        const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 0));

        if (checkTetracubeRotation(cubePositions, new BABYLON.Vector3(rotationX, 0, 0), this.Tetracube.type)) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);
            rotateTetracube(this.Tetracube.getCubes(), new BABYLON.Vector3(rotationX, 0, 0));
        }
        this.updateMatrixMap(this.Tetracube.getCubes(), 1);
    }

    /**
     * Rotates the current tetracube one quarter turn clockwise around the Y axis
     * if the resulting rotation is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public rotateE(): void {
        const rotationY = Math.PI / 2;
        const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 0));

        if (checkTetracubeRotation(cubePositions, new BABYLON.Vector3(0, rotationY, 0), this.Tetracube.type)) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);
            rotateTetracube(this.Tetracube.getCubes(), new BABYLON.Vector3(0, rotationY, 0));
        }
        this.updateMatrixMap(this.Tetracube.getCubes(), 1);
    }

    /**
     * Rotates the current tetracube one quarter turn clockwise around the Z axis
     * if the resulting rotation is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public rotateR(): void {
        const rotationZ = Math.PI / 2;
        const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 0));

        if (checkTetracubeRotation(cubePositions, new BABYLON.Vector3(0, 0, rotationZ), this.Tetracube.type)) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);
            rotateTetracube(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, rotationZ));
        }
        this.updateMatrixMap(this.Tetracube.getCubes(), 1);
    }

    /**
     * Handles key down events.
     * @param event - The key down event.
     *
     * Key bindings:
     * - G: Generate a new Tetracube
     * - W: Move the Tetracube up
     * - S: Move the Tetracube down
     * - A: Move the Tetracube left
     * - D: Move the Tetracube right
     * - Q: Rotate the Tetracube one quarter turn clockwise around the X axis
     * - E: Rotate the Tetracube one quarter turn clockwise around the Y axis
     * - R: Rotate the Tetracube one quarter turn clockwise around the Z axis
     * - Shift: Increase the game speed
     */
    public keyDown(event: KeyboardEvent): void {
        // TODO: Fix Tetracube rotation.
        switch (event.key.toLowerCase()) {
            case "g":
                this.Tetracube.generateTetracube();
                break;
            case "w":
                this.moveW();
                break;
            case "s":
                this.moveS();
                break;
            case "a":
                this.moveA();
                break;
            case "d":
                this.moveD();
                break;
            case "q":
                this.rotateQ();
                break;
            case "e":
                this.rotateE();
                break;
            case "r":
                this.rotateR();
                break;
            case "shift":
                this.timeStep += 10;
                break;
        }
    }
}
