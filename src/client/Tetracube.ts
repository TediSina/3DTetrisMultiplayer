import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { checkTetracubePosition, calculateTetracubeCubePosition } from "./checkTetracubePosition";
import { checkTetracubeRotation } from "./checkTetracubeRotation";
import { Socket } from 'socket.io-client/build/esm/index';


export class Tetracube {
    private socket: Socket;
    public cubes!: BABYLON.Mesh[];
    private scene: BABYLON.Scene;

    /**
     * Constructor for the Tetracube class.
     * @param socket The socket that the tetracube should use to communicate with the server.
     * @param scene The scene in which the tetracube should be rendered.
     */
    constructor(socket: Socket, scene: BABYLON.Scene) {
        this.socket = socket;
        this.scene = scene;
    }


    public generateTetracube(): void {
        this.cubes = this.pickRandomTetracube();
        const position = this.generatePosition();
        const rotation = this.generateRotation(position);
        this.positionTetracube(position);
        this.rotateTetracube(rotation);
        this.socket.emit('tetracubeGenerated', 'roomId123');
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
     * Rotates the tetracube.
     * @param rotation - The rotation to apply to the cubes (yaw, pitch, roll).
     */
    public rotateTetracube(rotation: BABYLON.Vector3): void {
        const rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);
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
    public pickRandomTetracube(): BABYLON.Mesh[] {
        const random = Math.floor(Math.random() * 8);
        switch (random) {
            case 0: return this.createI_Tetracube();
            case 1: return this.createLJ_Tetracube();
            case 2: return this.createT_Tetracube();
            case 3: return this.createSZ_Tetracube();
            case 4: return this.createO_Tetracube();
            case 5: return this.createTower1_Tetracube();
            case 6: return this.createTower2_Tetracube();
            case 7: return this.createTower3_Tetracube();
            default: return this.createI_Tetracube();
        }
    }

    /**
     * Generates a random valid position for the tetracube.
     * @returns The generated position.
     */
    public generatePosition(): BABYLON.Vector3 {
        let positionX = Math.floor(Math.random() * 10) - 6;
        const positionY = 19;
        let positionZ = Math.floor(Math.random() * 10);

        while (!checkTetracubePosition(this.cubes, new BABYLON.Vector3(positionX, positionY, positionZ))) {
            positionX = Math.floor(Math.random() * 10) - 6;
            positionZ = Math.floor(Math.random() * 10);
        }

        return new BABYLON.Vector3(positionX, positionY, positionZ);
    }

    /**
     * Generates a valid random rotation for the tetracube.
     * @param position - The current position of the tetracube.
     * @returns The generated rotation.
     */
    public generateRotation(position: BABYLON.Vector3): BABYLON.Vector3 {
        const cubePositions = calculateTetracubeCubePosition(this.cubes, position);

        let rotationX = Math.floor(Math.random() * 4) * Math.PI / 2;
        let rotationY = Math.floor(Math.random() * 4) * Math.PI / 2;
        let rotationZ = Math.floor(Math.random() * 4) * Math.PI / 2;

        while (!checkTetracubeRotation(cubePositions, new BABYLON.Vector3(rotationX, rotationY, rotationZ))) {
            rotationX = Math.floor(Math.random() * 4) * Math.PI / 2;
            rotationY = Math.floor(Math.random() * 4) * Math.PI / 2;
            rotationZ = Math.floor(Math.random() * 4) * Math.PI / 2;
        }

        return new BABYLON.Vector3(rotationX, rotationY, rotationZ);
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
