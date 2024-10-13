import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import * as Tetracubes from "./createTetracubes";
import { checkTetracubePosition } from "./checkTetracubePosition";
import { checkTetracubeRotation, calculateCenter } from "./checkTetracubeRotation";
import { calculateTetracubeCubePosition } from "./checkTetracubePosition";
import * as Matrices from "./rotationMatrices";


/**
 * Sets the position of all the cubes in the given array to the given position.
 * This function changes the position of the cubes in-place.
 * @param cubes - The array of cubes to be positioned.
 * @param position - The position to set the cubes at.
 */
export function positionTetracube(cubes: BABYLON.Mesh[], position: BABYLON.Vector3): void {
    const translationMatrix = BABYLON.Matrix.Translation(position.x, position.y, position.z);

    cubes.forEach(cube => {
        cube.position = BABYLON.Vector3.TransformCoordinates(cube.position, translationMatrix);
    });
}


/**
 * Rotates all the cubes in the given array to the given rotation.
 * This function changes the rotation of the cubes in-place.
 * @param cubes - The array of cubes to be rotated.
 * @param rotation - The rotation to apply to the cubes (yaw, pitch, roll).
 */
export function rotateTetracube(cubes: BABYLON.Mesh[], rotationMatrix: BABYLON.Matrix): void {
    const cubesPosition = calculateTetracubeCubePosition(cubes, BABYLON.Vector3.Zero());
    // Find the center of the tetracube
    const center = calculateCenter(cubesPosition);
    
    cubes.forEach(cube => {
        // Translate cube position relative to the tetracube center
        const relativePosition = cube.position.subtract(center);

        // Rotate the relative position using the selected rotation matrix
        const rotatedPosition = BABYLON.Vector3.TransformCoordinates(relativePosition, rotationMatrix);

        // Set the new position relative to the original center, rounding to the nearest integer
        cube.position = new BABYLON.Vector3(
            Math.round(rotatedPosition.x + center.x),
            Math.round(rotatedPosition.y + center.y),
            Math.round(rotatedPosition.z + center.z)
        );
    });
}


/**
 * Picks a random tetracube type and creates the corresponding tetracube.
 * @param scene - The scene to create the tetracube in.
 * @returns The created tetracube and its type (string).
 */
export function pickRandomTetracube(scene: BABYLON.Scene): [BABYLON.Mesh[], "I" | "LJ" | "T" | "SZ" | "O" | "Tower1" | "Tower2" | "Tower3"] {
    let tetracube: BABYLON.Mesh[];

    const random = Math.floor(Math.random() * 8);

    switch (random) {
        case 0:
            tetracube = Tetracubes.createI_Tetracube(scene);
            return [tetracube, "I"];
        case 1:
            tetracube = Tetracubes.createLJ_Tetracube(scene);
            return [tetracube, "LJ"];
        case 2:
            tetracube = Tetracubes.createT_Tetracube(scene);
            return [tetracube, "T"];
        case 3:
            tetracube = Tetracubes.createSZ_Tetracube(scene);
            return [tetracube, "SZ"];
        case 4:
            tetracube = Tetracubes.createO_Tetracube(scene);
            return [tetracube, "O"];
        case 5:
            tetracube = Tetracubes.createTower1_Tetracube(scene);
            return [tetracube, "Tower1"];
        case 6:
            tetracube = Tetracubes.createTower2_Tetracube(scene);
            return [tetracube, "Tower2"];
        case 7:
            tetracube = Tetracubes.createTower3_Tetracube(scene);
            return [tetracube, "Tower3"];
        default:
            tetracube = Tetracubes.createI_Tetracube(scene);
            return [tetracube, "I"];
    };
}


/**
 * Generates a random valid position for the given tetracube.
 * @param tetracube - The tetracube to generate a position for.
 * @returns The generated position.
 */
export function generateTetracubePosition(tetracube: BABYLON.Mesh[]): BABYLON.Vector3 {
    let positionX = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
    const positionY = 19;
    let positionZ = Math.floor(Math.random() * (9 - 0 + 1)) + 0;

    while (!checkTetracubePosition(tetracube, new BABYLON.Vector3(positionX, positionY, positionZ))) {
        positionX = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
        positionZ = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
    }

    return new BABYLON.Vector3(positionX, positionY, positionZ);
}


/**
 * Generates a random valid rotation for the given tetracube at the given position.
 * @param tetracube - The tetracube to generate a rotation for.
 * @param tetracubePosition - The position of the tetracube.
 * @param type - The type of the tetracube.
 * @returns The generated rotation.
 */
export function generateTetracubeRotation(tetracube: BABYLON.Mesh[], tetracubePosition: BABYLON.Vector3, type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"): BABYLON.Matrix {
    const cubePositions = calculateTetracubeCubePosition(tetracube, tetracubePosition);

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

    return finalRotationMatrix;
}



/**
 * Generates a random valid tetracube and places it in the given scene.
 * The tetracube is placed at a random position and rotated randomly.
 * @param scene - The scene to create the tetracube in.
 * @returns The created tetracube.
 */
export function generateTetracube(scene: BABYLON.Scene): BABYLON.Mesh[] {
    const pickedTetracube: [BABYLON.Mesh[], "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"] = pickRandomTetracube(scene);
    const tetracube: BABYLON.Mesh[] = pickedTetracube[0];
    const type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3" = pickedTetracube[1];

    const position: BABYLON.Vector3 = generateTetracubePosition(tetracube);

    const rotation: BABYLON.Matrix = generateTetracubeRotation(tetracube, position, type);

    positionTetracube(tetracube, position);

    rotateTetracube(tetracube, rotation);

    return tetracube;
}
