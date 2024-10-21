import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { checkTetracubePosition, calculateTetracubeCubePosition } from "../client/checkTetracubePosition";
import { checkTetracubeRotation } from "../client/checkTetracubeRotation";
import * as Matrices from "../client/rotationMatrices";
import { Server } from 'socket.io/dist/index';
import { pickRandomTetracube, pickRandomRotation, TetracubeStringType, RotationStringType } from './randomizeTetracube';
import { Room } from './HeadlessApp';


export class HeadlessTetracube {
    private io: Server;
    private room: Room;
    public cubes!: BABYLON.Mesh[];
    private scene: BABYLON.Scene;
    public type!: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3";

    /**
     * Creates a new instance of HeadlessTetracube.
     * @param io the Socket.IO server.
     * @param room the room to generate tetracubes for.
     * @param scene the scene to generate tetracubes in.
     */
    constructor(io: Server, room: Room, scene: BABYLON.Scene) {
        this.io = io;
        this.room = room;
        this.scene = scene;
    }

    /**
     * Converts a rotation matrix to a RotationStringType.
     * @param rotation The rotation matrix to convert.
     * @returns The rotation as a string.
     */
    public stringifyRotation(rotation: BABYLON.Matrix): RotationStringType {
        switch (rotation) {
            case Matrices.noRotationMatrix: return "noRotation";
            case Matrices.rotationMatrixX90: return "rotationX90";
            case Matrices.rotationMatrixX180: return "rotationX180";
            case Matrices.rotationMatrixX270: return "rotationX270";
            case Matrices.rotationMatrixY90: return "rotationY90";
            case Matrices.rotationMatrixY180: return "rotationY180";
            case Matrices.rotationMatrixY270: return "rotationY270";
            case Matrices.rotationMatrixZ90: return "rotationZ90";
            case Matrices.rotationMatrixZ180: return "rotationZ180";
            case Matrices.rotationMatrixZ270: return "rotationZ270";
            default: return "noRotation";
        }
    }

    /**
     * Generates a random valid tetracube and positions it at a random location.
     * The tetracube is picked randomly from the 8 possible tetracubes and a random valid position is generated.
     * The tetracube is then rotated randomly and placed at the generated position.
     */
    public generateTetracube() {
        const tetracube: TetracubeStringType = pickRandomTetracube();
        this.cubes = this.pickTetracube(tetracube);
        this.type = tetracube;
        const position: BABYLON.Vector3 = this.generatePosition();
        const rotationResult: any[] = this.generateRotation(position, this.type);
        const rotation: BABYLON.Matrix = rotationResult[0];
        const stringifiedRotation: string[] = rotationResult[1];
        console.log(`Generated tetracube: ${tetracube}`);
        console.log(`Generated position: ${position}`);
        console.log(`Generated rotation: ${rotation}`);

        // Emit tetracube generation event to all players
        this.io.to(this.room.roomId).emit('generateTetracube', { tetracube, position, stringifiedRotation });
        //this.io.to(roomId).emit('update');

        this.positionTetracube(position);
        this.rotateTetracube(rotation);

        // After generating a tetracube, notify the current player to control it
        const currentPlayer = this.room.players[this.room.currentPlayerIndex];
        this.io.to(currentPlayer).emit('controlTetracube');

        // Move to the next player in the list for the next tetracube
        // room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
    }

    /**
     * Sets the position of all the cubes in the tetracube.
     * @param position - The position to set the cubes at.
     */
    public positionTetracube(position: BABYLON.Vector3): void {
        const translationMatrix = BABYLON.Matrix.Translation(position.x, position.y, position.z);
        this.cubes.forEach(cube => {
            cube.position = BABYLON.Vector3.TransformCoordinates(cube.position, translationMatrix);
        });
    }

    /**
     * Rotates all the cubes in the tetracube by the given rotation matrix.
     * The rotation is done relative to the center of the tetracube.
     * The resulting positions are rounded to the nearest integer.
     * @param rotationMatrix - The rotation matrix to apply to the tetracube.
     */
    public rotateTetracube(rotationMatrix: BABYLON.Matrix): void {
        // Find the center of the tetracube
        const center = this.calculateCenter();

        this.cubes.forEach(cube => {
            const relativePosition = cube.position.subtract(center);

            const rotatedPosition = BABYLON.Vector3.TransformCoordinates(relativePosition, rotationMatrix);

            cube.position = new BABYLON.Vector3(
                Math.round(rotatedPosition.x + center.x),
                Math.round(rotatedPosition.y + center.y),
                Math.round(rotatedPosition.z + center.z)
            );
        });
    }

    /**
     * Creates a cube mesh at a given position with a given color.
     * @param scene - The scene to create the cube in.
     * @param position - The position of the cube in the scene.
     * @param color - The color of the cube.
     * @returns The created cube mesh.
     */
    private createCube(position: BABYLON.Vector3, color: BABYLON.Color3): BABYLON.Mesh {
        const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 1 }, this.scene);

        // Set the cube's material
        const cubeMaterial = new BABYLON.StandardMaterial("cubeMaterial", this.scene);
        cubeMaterial.diffuseColor = color;
        cubeMaterial.emissiveColor = color;
        cube.material = cubeMaterial;

        cube.enableEdgesRendering();
        cube.edgesWidth = 5.0;
        cube.edgesColor = new BABYLON.Color4(0, 0, 0, 1); // black edges

        // Apply transformation matrix for position
        const translationMatrix = BABYLON.Matrix.Translation(position.x, position.y, position.z);
        cube.position = BABYLON.Vector3.TransformCoordinates(BABYLON.Vector3.Zero(), translationMatrix);

        return cube;
    }

    /**
 * Creates an I-shaped Tetracube using matrices
 * @param scene - The scene to create the I-shaped Tetracube in.
 * @returns The created I-shaped Tetracube cubes.
 */
    public createI_Tetracube(): BABYLON.Mesh[] {
        const color = new BABYLON.Color3(0, 0, 0.5);
        const cubes = [
            this.createCube(new BABYLON.Vector3(0, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 0, 0), color),
            this.createCube(new BABYLON.Vector3(2, 0, 0), color),
            this.createCube(new BABYLON.Vector3(3, 0, 0), color),
        ];
        return cubes;
    }

    /**
     * Creates an L/J-shaped Tetracube using matrices
     * @param scene - The scene to create the L/J-shaped Tetracube in.
     * @returns The created L/J-shaped Tetracube cubes.
     */
    public createLJ_Tetracube(): BABYLON.Mesh[] {
        const color = new BABYLON.Color3(0.5, 0, 0);
        const cubes = [
            this.createCube(new BABYLON.Vector3(0, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 0, 0), color),
            this.createCube(new BABYLON.Vector3(2, 0, 0), color),
            this.createCube(new BABYLON.Vector3(2, 1, 0), color),
        ];
        return cubes;
    }


    /**
     * Creates a T-shaped Tetracube using matrices
     * @param scene - The scene to create the T-shaped Tetracube in.
     * @returns The created T-shaped Tetracube cubes.
     */
    public createT_Tetracube(): BABYLON.Mesh[] {
        const color = new BABYLON.Color3(0.7, 0.5, 0.5);
        const cubes = [
            this.createCube(new BABYLON.Vector3(0, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 0, 0), color),
            this.createCube(new BABYLON.Vector3(2, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 1, 0), color),
        ];
        return cubes;
    }


    /**
     * Creates an S/Z-shaped Tetracube using matrices
     * @param scene - The scene to create the S/Z-shaped Tetracube in.
     * @returns The created S/Z-shaped Tetracube cubes.
     */
    public createSZ_Tetracube(): BABYLON.Mesh[] {
        const color = new BABYLON.Color3(0, 0.5, 0);
        const cubes = [
            this.createCube(new BABYLON.Vector3(1, 0, 0), color),
            this.createCube(new BABYLON.Vector3(2, 0, 0), color),
            this.createCube(new BABYLON.Vector3(0, 1, 0), color),
            this.createCube(new BABYLON.Vector3(1, 1, 0), color),
        ];
        return cubes;
    }


    /**
     * Creates an O-shaped Tetracube using matrices
     * @param scene - The scene to create the O-shaped Tetracube in.
     * @returns The created O-shaped Tetracube cubes.
     */
    public createO_Tetracube(): BABYLON.Mesh[] {
        const color = new BABYLON.Color3(0.6, 0.6, 0);
        const cubes = [
            this.createCube(new BABYLON.Vector3(0, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 0, 0), color),
            this.createCube(new BABYLON.Vector3(0, 1, 0), color),
            this.createCube(new BABYLON.Vector3(1, 1, 0), color),
        ];
        return cubes;
    }


    /**
     * Creates a Tower1-shaped Tetracube using matrices
     * @param scene - The scene to create the Tower1-shaped Tetracube in.
     * @returns The created Tower1-shaped Tetracube cubes.
     */
    public createTower1_Tetracube(): BABYLON.Mesh[] {
        const color = new BABYLON.Color3(0.6, 0.3, 0.0);
        const cubes = [
            this.createCube(new BABYLON.Vector3(0, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 0, 1), color),
            this.createCube(new BABYLON.Vector3(1, 1, 0), color),
        ];
        return cubes;
    }


    /**
     * Creates a Tower2-shaped Tetracube using matrices
     * @param scene - The scene to create the Tower2-shaped Tetracube in.
     * @returns The created Tower2-shaped Tetracube cubes.
     */
    public createTower2_Tetracube(): BABYLON.Mesh[] {
        const color = new BABYLON.Color3(0.5, 0.5, 0.5);
        const cubes = [
            this.createCube(new BABYLON.Vector3(0, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 0, 0), color),
            this.createCube(new BABYLON.Vector3(0, 0, 1), color),
            this.createCube(new BABYLON.Vector3(1, 1, 0), color),  // Tower at the start
        ];
        return cubes;
    }


    /**
     * Creates a Tower3-shaped Tetracube using matrices
     * @param scene - The scene to create the Tower3-shaped Tetracube in.
     * @returns The created Tower3-shaped Tetracube cubes.
     */
    public createTower3_Tetracube(): BABYLON.Mesh[] {
        const color = new BABYLON.Color3(0.25, 0.25, 0.25);
        const cubes = [
            this.createCube(new BABYLON.Vector3(0, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 0, 0), color),
            this.createCube(new BABYLON.Vector3(1, 0, 1), color),
            this.createCube(new BABYLON.Vector3(0, 1, 0), color),  // Tower at the start
        ];
        return cubes;
    }

    /**
     * Picks a tetracube by type and creates it.
     * @param tetracube - The type of tetracube to create.
     * @returns The created tetracube.
     */
    public pickTetracube(tetracube: string): BABYLON.Mesh[] {
        switch (tetracube) {
            case 'I': return this.createI_Tetracube();
            case 'LJ': return this.createLJ_Tetracube();
            case 'T': return this.createT_Tetracube();
            case 'SZ': return this.createSZ_Tetracube();
            case 'O': return this.createO_Tetracube();
            case 'Tower1': return this.createTower1_Tetracube();
            case 'Tower2': return this.createTower2_Tetracube();
            case 'Tower3': return this.createTower3_Tetracube();
            default: return this.createI_Tetracube();
        }
    }

    /**
     * Picks a random tetracube type and creates the corresponding tetracube.
     * @returns The created tetracube.
     */
    public pickRandomTetracube(): [BABYLON.Mesh[], "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"] {
        const random = Math.floor(Math.random() * 8);
        switch (random) {
            case 0: return [this.createI_Tetracube(), "I"];
            case 1: return [this.createLJ_Tetracube(), "LJ"];
            case 2: return [this.createT_Tetracube(), "T"];
            case 3: return [this.createSZ_Tetracube(), "SZ"];
            case 4: return [this.createO_Tetracube(), "O"];
            case 5: return [this.createTower1_Tetracube(), "Tower1"];
            case 6: return [this.createTower2_Tetracube(), "Tower2"];
            case 7: return [this.createTower3_Tetracube(), "Tower3"];
            default: return [this.createI_Tetracube(), "I"];
        }
    }

    /**
     * Generates a random valid position for the tetracube.
     * @returns The generated position.
     */
    public generatePosition(): BABYLON.Vector3 {
        let positionX = Math.floor(Math.random() * 10);
        const positionY = 19;
        let positionZ = Math.floor(Math.random() * 10);

        while (!checkTetracubePosition(this.cubes, new BABYLON.Vector3(positionX, positionY, positionZ))) {
            positionX = Math.floor(Math.random() * 10);
            positionZ = Math.floor(Math.random() * 10);
        }

        return new BABYLON.Vector3(positionX, positionY, positionZ);
    }

    /**
     * Generates a valid random rotation for the tetracube.
     * @param position - The current position of the tetracube.
     * @returns The generated rotation.
     */
    public generateRotation(position: BABYLON.Vector3, type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"): any[] {
        const cubePositions = calculateTetracubeCubePosition(this.cubes, position);

        // Arrays of predefined rotation matrices for each axis
        const xRotationMatrices: BABYLON.Matrix[] = [Matrices.noRotationMatrix, Matrices.rotationMatrixX90, Matrices.rotationMatrixX180, Matrices.rotationMatrixX270];
        const yRotationMatrices: BABYLON.Matrix[] = [Matrices.noRotationMatrix, Matrices.rotationMatrixY90, Matrices.rotationMatrixY180, Matrices.rotationMatrixY270];
        const zRotationMatrices: BABYLON.Matrix[] = [Matrices.noRotationMatrix, Matrices.rotationMatrixZ90, Matrices.rotationMatrixZ180, Matrices.rotationMatrixZ270];

        // Randomly select a rotation matrix for each axis
        let rotationMatrixX: BABYLON.Matrix = xRotationMatrices[Math.floor(Math.random() * xRotationMatrices.length)];
        let rotationMatrixY: BABYLON.Matrix = yRotationMatrices[Math.floor(Math.random() * yRotationMatrices.length)];
        let rotationMatrixZ: BABYLON.Matrix = zRotationMatrices[Math.floor(Math.random() * zRotationMatrices.length)];

        // Combine the selected matrices (you can multiply them to apply all rotations)
        let finalRotationMatrix: BABYLON.Matrix = rotationMatrixX.multiply(rotationMatrixY).multiply(rotationMatrixZ);

        while (!checkTetracubeRotation(cubePositions, finalRotationMatrix, type)) {
            rotationMatrixX = xRotationMatrices[Math.floor(Math.random() * xRotationMatrices.length)];
            rotationMatrixY = yRotationMatrices[Math.floor(Math.random() * yRotationMatrices.length)];
            rotationMatrixZ = zRotationMatrices[Math.floor(Math.random() * zRotationMatrices.length)];

            finalRotationMatrix = rotationMatrixX.multiply(rotationMatrixY).multiply(rotationMatrixZ);
        }

        let stringifiedRotationMatrixX: string;
        let stringifiedRotationMatrixY: string;
        let stringifiedRotationMatrixZ: string;
        let stringifiedFinalRotationMatrix: string[] = [];

        switch (rotationMatrixX) {
            case Matrices.noRotationMatrix: stringifiedRotationMatrixX = "noRotation"; break;
            case Matrices.rotationMatrixX90: stringifiedRotationMatrixX = "rotationX90"; break;
            case Matrices.rotationMatrixX180: stringifiedRotationMatrixX = "rotationX180"; break;
            case Matrices.rotationMatrixX270: stringifiedRotationMatrixX = "rotationX270"; break;
            default: stringifiedRotationMatrixX = "noRotation";
        }
        switch (rotationMatrixY) {
            case Matrices.noRotationMatrix: stringifiedRotationMatrixY = "noRotation"; break;
            case Matrices.rotationMatrixY90: stringifiedRotationMatrixY = "rotationY90"; break;
            case Matrices.rotationMatrixY180: stringifiedRotationMatrixY = "rotationY180"; break;
            case Matrices.rotationMatrixY270: stringifiedRotationMatrixY = "rotationY270"; break;
            default: stringifiedRotationMatrixY = "noRotation";
        }
        switch (rotationMatrixZ) {
            case Matrices.noRotationMatrix: stringifiedRotationMatrixZ = "noRotation"; break;
            case Matrices.rotationMatrixZ90: stringifiedRotationMatrixZ = "rotationZ90"; break;
            case Matrices.rotationMatrixZ180: stringifiedRotationMatrixZ = "rotationZ180"; break;
            case Matrices.rotationMatrixZ270: stringifiedRotationMatrixZ = "rotationZ270"; break;
            default: stringifiedRotationMatrixZ = "noRotation";
        }
        stringifiedFinalRotationMatrix = [stringifiedRotationMatrixX, stringifiedRotationMatrixY, stringifiedRotationMatrixZ];

        return [finalRotationMatrix, stringifiedFinalRotationMatrix];
    }

    /**
     * Calculates the center point of the tetracube.
     * @returns The center point as a Vector3.
     */
    private calculateCenter(): BABYLON.Vector3 {
        return this.cubes.reduce((acc, cube) => acc.addInPlace(cube.position), BABYLON.Vector3.Zero()).scaleInPlace(1 / this.cubes.length);
    }

    /**
     * Returns the cubes making up the tetracube.
     */
    public getCubes(): BABYLON.Mesh[] {
        return this.cubes;
    }
}
