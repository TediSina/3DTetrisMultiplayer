import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { createBoundaryMesh } from "./createBoundaryMesh";
import * as Tetracubes from "./createTetracubes";
import { positionTetracube, rotateTetracube } from "./generateTetracube";
import { checkTetracubePosition, calculateTetracubeCubePosition } from "./checkTetracubePosition";
import { checkTetracubeRotation, calculateTetracubeCubeRotation } from "./checkTetracubeRotation";
import { Tetracube } from "./Tetracube";
import * as Matrices from "./rotationMatrices";
import * as GUI from "@babylonjs/gui/index";
import { io, Socket } from 'socket.io-client/build/esm/index';
import { on as socketOn } from "socket.io-client/build/esm/on";


export class Game {
    private socket: Socket;
    private scene: BABYLON.Scene;
    private Tetracube: Tetracube;
    private timeStep = 0;
    private timeCheck = 60;
    private matrixMap: number[][][] = [];
    public score = 0;
    public maxScore = 0;
    private advancedTexture: GUI.AdvancedDynamicTexture;
    private scoreText: GUI.TextBlock;
    private controlText: GUI.TextBlock;
    public gameIsOver = false;

    constructor(socket: Socket, scene: BABYLON.Scene, maxScore: number = 0) {
        this.socket = socket;
        this.socket.emit('joinRoom', 'roomId123');
        this.scene = scene;
        this.maxScore = maxScore;
        this.Tetracube = new Tetracube(this.scene);

        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.scoreText = new GUI.TextBlock();
        this.scoreText.text = `Score: ${this.score}   Max Score: ${this.maxScore}`;
        this.scoreText.color = "white";
        this.scoreText.fontSize = 24;
        this.scoreText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.scoreText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.scoreText.top = "20px";
        this.advancedTexture.addControl(this.scoreText);

        this.controlText = new GUI.TextBlock();
        this.controlText.text = "You do not control the tetracube";
        this.controlText.color = "red";
        this.controlText.fontSize = 24;
        this.controlText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.controlText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.controlText.top = "60px";
        this.advancedTexture.addControl(this.controlText);

        this.initializeMatrixMap(10, 22, 10);

        const boundary: BABYLON.Mesh = createBoundaryMesh(scene, 10, 20, 10, [0, 4, 2]);
        boundary.position.x = 4.5;
        boundary.position.y = 9.5;
        boundary.position.z = 4.5;

        const I_tetracube = Tetracubes.createI_Tetracube(scene);
        positionTetracube(I_tetracube, new BABYLON.Vector3(-15, 0, -5));

        const LJ_tetracube = Tetracubes.createLJ_Tetracube(scene);
        positionTetracube(LJ_tetracube, new BABYLON.Vector3(-10, 0, -5));

        const SZ_tetracube = Tetracubes.createSZ_Tetracube(scene);
        positionTetracube(SZ_tetracube, new BABYLON.Vector3(-5, 0, -5));

        const O_tetracube = Tetracubes.createO_Tetracube(scene);
        positionTetracube(O_tetracube, new BABYLON.Vector3(0, 0, -5));

        const T_tetracube = Tetracubes.createT_Tetracube(scene);
        positionTetracube(T_tetracube, new BABYLON.Vector3(5, 0, -5));

        const Tower1_Tetracube = Tetracubes.createTower1_Tetracube(scene);
        positionTetracube(Tower1_Tetracube, new BABYLON.Vector3(10, 0, -5));

        const Tower2_Tetracube = Tetracubes.createTower2_Tetracube(scene);
        positionTetracube(Tower2_Tetracube, new BABYLON.Vector3(15, 0, -5));

        const Tower3_Tetracube = Tetracubes.createTower3_Tetracube(scene);
        positionTetracube(Tower3_Tetracube, new BABYLON.Vector3(20, 0, -5));

        socketOn(this.socket, 'generateTetracube', (data) => {
            console.log(data);
            this.Tetracube.generateSpecifiedTetracube(data.tetracube, data.position, data.stringifiedRotation);
            this.updateMatrixMap(this.Tetracube.getCubes(), 1);

            console.log(this.Tetracube);
            console.log(this.Tetracube.cubes);
        });

        socketOn(this.socket, "moveTetracubeDown", () => {
            this.moveTetracubeDown();
            this.addScore(1);
        });

        socketOn(this.socket, "tetracubeControl" , () => {
            this.controlText.text = "You control the tetracube";
            this.controlText.color = "green";
        });

        socketOn(this.socket, "removeTetracubeControl" , () => {
            this.controlText.text = "You do not control the tetracube";
            this.controlText.color = "red";
        });
    }

    /**
     * Initializes the matrix map with the given dimensions.
     * @param width - The width of the matrix map.
     * @param height - The height of the matrix map.
     * @param depth - The depth of the matrix map.
     */
    private initializeMatrixMap(width: number, height: number, depth: number) {
        this.matrixMap = Array.from({ length: width }, () =>
            Array.from({ length: height }, () =>
                Array(depth).fill(0)
            )
        );

        console.log(this.matrixMap);
    }

    /**
     * Updates the matrix map with the given value at the positions of the given cubes.
     * @param cubes - The cubes to update the matrix map with.
     * @param value - The value to set in the matrix map.
     */
    private updateMatrixMap(cubes: BABYLON.Mesh[], value: number) {
        for (const cube of cubes) {
            const x = cube.position.x;
            const y = cube.position.y;
            const z = cube.position.z;

            if (
                x >= 0 && x <= 9 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                this.matrixMap[x][y][z] = value;
            } else {
                console.warn(`Position out of bounds: (${x}, ${y}, ${z})`);
            }
        }
    }

    /**
     * Moves the tetracube down by one unit and updates the matrix map
     * accordingly. The matrix map is updated in two steps: first, the old
     * positions are cleared, and then the new positions are filled in.
     */
    private moveTetracubeDown() {
        this.updateMatrixMap(this.Tetracube.getCubes(), 0);

        positionTetracube(this.Tetracube.getCubes(), new BABYLON.Vector3(0, -1, 0));

        this.updateMatrixMap(this.Tetracube.getCubes(), 1);
    }

    /**
     * Checks if the tetracube has reached the bottom of the game board.
     * If the tetracube has reached the bottom, this function updates the matrix map to reflect the tetracube's position.
     * @returns True if the tetracube has reached the bottom, false otherwise.
     */
    private tetracubeHasReachedBottom(): boolean {
        if (this.Tetracube.getCubes().some(cube => cube.position.y <= 0)) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 1);
            return true;
        }
        return false;
    }

    /**
     * Checks if the tetracube has collided with the bottom of the game board
     * or with any existing cubes in the game board.
     * This function first finds all positions occupied by the tetracube by
     * rounding the positions of the cubes in the tetracube to whole numbers
     * and then checks if any of the positions directly below the tetracube
     * are occupied by other cubes. If any of them are, this function returns
     * true, indicating that the tetracube has collided with something. If none
     * of them are, this function returns false.
     * @returns True if the tetracube has collided with something, false otherwise.
     */
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
                x >= 0 && x <= 9 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                if (!occupiedPositions.has(`${x},${y - 1},${z}`) && this.matrixMap[x][y - 1][z] === 1) {
                    console.log("Collided", x, y - 1, z);
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Returns the mesh at the given position in the scene if it exists.
     * @param targetPosition The position to search for in the scene.
     * @returns The mesh at the given position if it exists, null otherwise.
     */
    public getMeshByPosition(targetPosition: BABYLON.Vector3): BABYLON.AbstractMesh | null {
        const meshes = this.scene.meshes;

        for (let i = 0; i < meshes.length; i++) {
            let mesh = meshes[i];

            if (mesh.position.equals(targetPosition)) {
                return mesh;
            }
        }

        return null;
    }

    /**
     * Deletes all meshes in the scene that have a Y position equal to the given rowY
     * and are inside the matrixMap boundary (within x and z limits).
     * @param rowY The Y position of the meshes to be deleted.
     */
    public deleteMeshesInRow(rowY: number) {
        const tolerance = 0.001;

        const meshesToRemove = this.scene.meshes.filter(mesh => {
            const isInRow = Math.abs(mesh.position.y - rowY) < tolerance;

            const isInBoundary = (
                mesh.position.x >= 0 && mesh.position.x < 10 &&
                mesh.position.z >= 0 && mesh.position.z < 10
            );

            return isInRow && isInBoundary;
        });

        meshesToRemove.forEach(mesh => {
            mesh.dispose();
        });

        console.log(`${meshesToRemove.length} meshes were deleted in row ${rowY}`);
    }

    /**
     * Moves all cubes above the given row down by one unit.
     * This function is used when a row is cleared to move all the cubes down to fill the gap.
     * This function also updates the matrix map to reflect the new positions of the cubes.
     * @param row The row above which all the cubes are moved down.
     */
    public moveCubesDownAboveRow(row: number) {
        for (let y = row + 1; y < 22; y++) {
            for (let x = 0; x < 10; x++) {
                for (let z = 0; z < 10; z++) {
                    if (this.matrixMap[x][y][z] === 1) {
                        this.matrixMap[x][y - 1][z] = 1;
                        this.matrixMap[x][y][z] = 0;

                        let cube = this.getMeshByPosition(new BABYLON.Vector3(x, y, z));
                        if (cube) {
                            cube.position.y -= 1;
                        }
                    }
                }
            }
        }
    }

    /**
     * Clears the given row in the matrix map by setting all values in the row to 0.
     * Then, moves all the cubes above the cleared row down by one unit.
     * This function is used when a row is cleared to fill the gap that is left.
     * @param y The row to be cleared.
     */
    public clearRow(y: number) {
        this.deleteMeshesInRow(y);

        for (let x = 0; x < this.matrixMap.length; x++) {
            for (let z = 0; z < this.matrixMap[x].length; z++) {
                if (this.matrixMap[x][y][z] === 1) {
                    this.matrixMap[x][y][z] = 0;
                }
            }
        }

        this.moveCubesDownAboveRow(y);
    }

    /**
     * Returns a list of all y positions that have a full row in the matrix map.
     * @returns A list of y positions that have a full row.
     */
    public getFullRows(): number[] {
        let fullRows: number[] = [];

        for (let y = 0; y < 22; y++) {
            let isFull = true;

            for (let x = 0; x < 10; x++) {
                for (let z = 0; z < 10; z++) {
                    if (this.matrixMap[x][y][z] === 0) {
                        isFull = false;
                        break;
                    }
                }
                if (!isFull) break;
            }

            if (isFull) {
                fullRows.push(y);
            }
        }

        return fullRows;
    }

    /**
     * Adds a given score to the total score and updates the score text.
     * @param score The score to add to the total score.
     */
    public addScore(score: number) {
        this.score += score;
        this.scoreText.text = `Score: ${this.score}   Max Score: ${this.maxScore}`;
    }

    /**
     * Checks if the game should end by checking if there are any cubes in the fourth highest rows.
     * If there are any cubes in the fourth highest rows, the function returns false.
     * If there are no cubes in the fourth highest rows, the function returns true.
     * @returns True if the game should continue, false otherwise.
     */
    public checkMatrixMap(): boolean {
        const height = this.matrixMap[0].length;

        for (let y = height - 4; y < height; y++) {
            for (let x = 0; x < this.matrixMap.length; x++) {
                for (let z = 0; z < this.matrixMap[x][y].length; z++) {
                    if (this.matrixMap[x][y][z] !== 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Updates the game state once per frame.
     * If the tetracube has reached the bottom of the game board, generates a new tetracube.
     * If the position below the tetracube is valid and the tetracube is not colliding with any other cubes, moves the tetracube down.
     * Otherwise, generates a new tetracube.
     * Increments the time step and resets it to 0 when it reaches the time check.
     */
    public update(): void {
        console.log("Updating...");
        if (this.timeStep >= this.timeCheck) {
            if (this.getFullRows().length > 0) {
                this.addScore(3000 * this.getFullRows().length);

                for (const row of this.getFullRows()) {
                    this.clearRow(row);
                }
            }

            if (this.tetracubeHasReachedBottom()) {
                if (!this.checkMatrixMap()) {
                    this.gameIsOver = true;
                    return;
                }

                this.Tetracube.generateTetracube();
            }

            const positionIsValid = checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, -1, 0));

            if (positionIsValid && !this.cubesHaveCollided()) {
                this.moveTetracubeDown();
                this.addScore(1);
            } else {
                if (!this.checkMatrixMap()) {
                    this.gameIsOver = true;
                    return;
                }

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
                x >= 0 && x <= 9 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!occupiedPositions.has(`${x},${y},${z - 1}`) && this.matrixMap[x][y][z - 1] === 1) {
                        console.log("Collided", x, y, z - 1);
                        return false;
                    }
                } catch (error) {
                    console.log("Movement out of bounds", x, y, z);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Moves the current tetracube one unit to the west (i.e. decreases its z position by 1)
     * if the resulting position is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public moveW(): void {
        if (this.checkW() && checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, -1))) {
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
                x >= 0 && x <= 9 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!occupiedPositions.has(`${x},${y},${z + 1}`) && this.matrixMap[x][y][z + 1] === 1) {
                        console.log("Collided", x, y, z + 1);
                        return false;
                    }
                } catch (error) {
                    console.log("Movement out of bounds", x, y, z);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Moves the current tetracube one unit to the south (i.e. increases its z position by 1)
     * if the resulting position is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public moveS(): void {
        if (this.checkS() && checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 1))) {
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
                x >= 0 && x <= 9 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!occupiedPositions.has(`${x + 1},${y},${z}`) && this.matrixMap[x + 1][y][z] === 1) {
                        console.log("Collided", x + 1, y, z);
                        return false;
                    }
                } catch (error) {
                    console.log("Movement out of bounds", x, y, z);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Moves the current tetracube one unit to the east (i.e. increases its x position by 1)
     * if the resulting position is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public moveA(): void {
        if (this.checkA() && checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(1, 0, 0))) {
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
                x >= 0 && x <= 9 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!occupiedPositions.has(`${x - 1},${y},${z}`) && this.matrixMap[x - 1][y][z] === 1) {
                        console.log("Collided", x - 1, y, z);
                        return false;
                    }
                } catch (error) {
                    console.log("Movement out of bounds", x, y, z);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Moves the current tetracube one unit to the west (i.e. decreases its x position by 1)
     * if the resulting position is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public moveD(): void {
        if (this.checkD() && checkTetracubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(-1, 0, 0))) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);

            this.Tetracube.getCubes().forEach(cube => {
                cube.position = new BABYLON.Vector3(cube.position.x - 1, cube.position.y, cube.position.z);
            });

            this.updateMatrixMap(this.Tetracube.getCubes(), 1);
        }
    }

    /**
     * Checks if the current tetracube can be rotated one quarter turn clockwise around the X axis
     * if the resulting rotation is valid (i.e. does not collide with any other cubes or the border of the game board).
     * @returns True if the rotation is valid, false otherwise.
     */
    public checkQ(): boolean {
        const currentCubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.cubes, BABYLON.Vector3.Zero());
        const calculatedCubePositions: BABYLON.Vector3[] = calculateTetracubeCubeRotation(currentCubePositions, Matrices.rotationMatrixX90, this.Tetracube.type);

        const currentOccupiedPositions: Set<string> = new Set();

        for (const position of currentCubePositions) {
            const x = Math.floor(position.x);
            const y = Math.floor(position.y);
            const z = Math.floor(position.z);
            currentOccupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(currentOccupiedPositions);

        const calculatedOccupiedPositions: Set<string> = new Set();

        for (const position of calculatedCubePositions) {
            const x = Math.floor(position.x);
            const y = Math.floor(position.y);
            const z = Math.floor(position.z);
            calculatedOccupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(calculatedOccupiedPositions);

        for (const position of calculatedCubePositions) {
            const x = Math.floor(position.x);
            const y = Math.floor(position.y);
            const z = Math.floor(position.z);

            if (
                x >= 0 && x <= 9 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!currentOccupiedPositions.has(`${x},${y},${z}`) && this.matrixMap[x][y][z] === 1) {
                        console.log("Collided", x, y, z);
                        return false;
                    }
                } catch (error) {
                    console.log("Movement out of bounds", x, y, z);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Rotates the current tetracube one quarter turn clockwise around the X axis
     * if the resulting rotation is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public rotateQ(): void {
        const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 0));

        if (this.checkQ() && checkTetracubeRotation(cubePositions, Matrices.rotationMatrixX90, this.Tetracube.type)) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);
            rotateTetracube(this.Tetracube.getCubes(), Matrices.rotationMatrixX90);
        }
        this.updateMatrixMap(this.Tetracube.getCubes(), 1);
    }

    /**
     * Checks if the current tetracube can be rotated one quarter turn clockwise around the Y axis
     * if the resulting rotation is valid (i.e. does not collide with any other cubes or the border of the game board).
     * @returns True if the rotation is valid, false otherwise.
     */
    public checkE(): boolean {
        const currentCubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.cubes, BABYLON.Vector3.Zero());
        const calculatedCubePositions: BABYLON.Vector3[] = calculateTetracubeCubeRotation(currentCubePositions, Matrices.rotationMatrixY90, this.Tetracube.type);

        const currentOccupiedPositions: Set<string> = new Set();

        for (const position of currentCubePositions) {
            const x = Math.floor(position.x);
            const y = Math.floor(position.y);
            const z = Math.floor(position.z);
            currentOccupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(currentOccupiedPositions);

        const calculatedOccupiedPositions: Set<string> = new Set();

        for (const position of calculatedCubePositions) {
            const x = Math.floor(position.x);
            const y = Math.floor(position.y);
            const z = Math.floor(position.z);
            calculatedOccupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(calculatedOccupiedPositions);

        for (const position of calculatedCubePositions) {
            const x = Math.floor(position.x);
            const y = Math.floor(position.y);
            const z = Math.floor(position.z);

            if (
                x >= 0 && x <= 9 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!currentOccupiedPositions.has(`${x},${y},${z}`) && this.matrixMap[x][y][z] === 1) {
                        console.log("Collided", x, y, z);
                        return false;
                    }
                } catch (error) {
                    console.log("Movement out of bounds", x, y, z);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Rotates the current tetracube one quarter turn clockwise around the Y axis
     * if the resulting rotation is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public rotateE(): void {
        const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 0));

        if (this.checkE() && checkTetracubeRotation(cubePositions, Matrices.rotationMatrixY90, this.Tetracube.type)) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);
            rotateTetracube(this.Tetracube.getCubes(), Matrices.rotationMatrixY90);
        }
        this.updateMatrixMap(this.Tetracube.getCubes(), 1);
    }

    /**
     * Checks if the current tetracube can be rotated one quarter turn clockwise around the Z axis
     * if the resulting rotation is valid (i.e. does not collide with any other cubes or the border of the game board).
     * @returns True if the rotation is valid, false otherwise.
     */
    public checkR(): boolean {
        const currentCubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.cubes, BABYLON.Vector3.Zero());
        const calculatedCubePositions: BABYLON.Vector3[] = calculateTetracubeCubeRotation(currentCubePositions, Matrices.rotationMatrixZ90, this.Tetracube.type);

        const currentOccupiedPositions: Set<string> = new Set();

        for (const position of currentCubePositions) {
            const x = Math.floor(position.x);
            const y = Math.floor(position.y);
            const z = Math.floor(position.z);
            currentOccupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(currentOccupiedPositions);

        const calculatedOccupiedPositions: Set<string> = new Set();

        for (const position of calculatedCubePositions) {
            const x = Math.floor(position.x);
            const y = Math.floor(position.y);
            const z = Math.floor(position.z);
            calculatedOccupiedPositions.add(`${x},${y},${z}`);
        }

        console.log(calculatedOccupiedPositions);

        for (const position of calculatedCubePositions) {
            const x = Math.floor(position.x);
            const y = Math.floor(position.y);
            const z = Math.floor(position.z);

            if (
                x >= 0 && x <= 9 &&
                y >= 0 && y <= 22 &&
                z >= 0 && z <= 9
            ) {
                try {
                    if (!currentOccupiedPositions.has(`${x},${y},${z}`) && this.matrixMap[x][y][z] === 1) {
                        console.log("Collided", x, y, z);
                        return false;
                    }
                } catch (error) {
                    console.log("Movement out of bounds", x, y, z);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Rotates the current tetracube one quarter turn clockwise around the Z axis
     * if the resulting rotation is valid (i.e. does not collide with any other cubes or the border of the game board).
     */
    public rotateR(): void {
        const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(this.Tetracube.getCubes(), new BABYLON.Vector3(0, 0, 0));

        if (this.checkR() && checkTetracubeRotation(cubePositions, Matrices.rotationMatrixZ90, this.Tetracube.type)) {
            this.updateMatrixMap(this.Tetracube.getCubes(), 0);
            rotateTetracube(this.Tetracube.getCubes(), Matrices.rotationMatrixZ90);
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
     * - Escape: End the game
     */
    public keyDown(event: KeyboardEvent): void {
        switch (event.key.toLowerCase()) {
            case "g":
                if (!this.checkMatrixMap()) {
                    this.gameIsOver = true;
                    return;
                }
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
                this.socket.emit("shiftKeyPressed");
                console.log("Shift key pressed");
                break;
            case "escape":
                this.gameIsOver = true;
                break;
            default:
                break;
        }
    }
}
