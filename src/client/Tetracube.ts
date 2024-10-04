import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import * as Tetracubes from "./createTetracubes";
import { checkTetracubePosition, calculateTetracubeCubePosition } from "./checkTetracubePosition";
import { checkTetracubeRotation, calculateTetracubeCubeRotation } from "./checkTetracubeRotation";

export class Tetracube {
    private cubes!: BABYLON.Mesh[];
    private scene: BABYLON.Scene;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
    }


    public generateTetracube(): void {
        this.cubes = this.pickRandomTetracube();
        const position = this.generatePosition();
        const rotation = this.generateRotation(position);
        this.positionTetracube(position);
        this.rotateTetracube(rotation);
    }

    /**
     * Sets the position of all the cubes in the tetracube.
     * @param position - The position to set the cubes at.
     */
    private positionTetracube(position: BABYLON.Vector3): void {
        const translationMatrix = BABYLON.Matrix.Translation(position.x, position.y, position.z);
        this.cubes.forEach(cube => {
            cube.position = BABYLON.Vector3.TransformCoordinates(cube.position, translationMatrix);
        });
    }

    /**
     * Rotates the tetracube.
     * @param rotation - The rotation to apply to the cubes (yaw, pitch, roll).
     */
    private rotateTetracube(rotation: BABYLON.Vector3): void {
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
     * Picks a random tetracube type and creates the corresponding tetracube.
     * @returns The created tetracube.
     */
    private pickRandomTetracube(): BABYLON.Mesh[] {
        const random = Math.floor(Math.random() * 8);
        switch (random) {
            case 0: return Tetracubes.createI_Tetracube(this.scene);
            case 1: return Tetracubes.createLJ_Tetracube(this.scene);
            case 2: return Tetracubes.createT_Tetracube(this.scene);
            case 3: return Tetracubes.createSZ_Tetracube(this.scene);
            case 4: return Tetracubes.createO_Tetracube(this.scene);
            case 5: return Tetracubes.createTower1_Tetracube(this.scene);
            case 6: return Tetracubes.createTower2_Tetracube(this.scene);
            case 7: return Tetracubes.createTower3_Tetracube(this.scene);
            default: return Tetracubes.createI_Tetracube(this.scene);
        }
    }

    /**
     * Generates a random valid position for the tetracube.
     * @returns The generated position.
     */
    private generatePosition(): BABYLON.Vector3 {
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
    private generateRotation(position: BABYLON.Vector3): BABYLON.Vector3 {
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
