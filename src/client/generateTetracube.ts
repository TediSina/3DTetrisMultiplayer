import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import * as Tetracubes from "./createTetracubes";
import { checkTetracubePosition } from "./checkTetracubePosition";
import { checkTetracubeRotation } from "./checkTetracubeRotation";
import { calculateTetracubeCubePosition } from "./checkTetracubePosition";


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
export function rotateTetracube(cubes: BABYLON.Mesh[], rotation: BABYLON.Vector3): void {
    // Calculate rotation matrix
    const rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);

    // Find the center of the tetracube by averaging the positions of the cubes
    const center = cubes.reduce((acc, cube) => acc.addInPlace(cube.position), BABYLON.Vector3.Zero()).scaleInPlace(1 / cubes.length);

    cubes.forEach(cube => {
        // Translate cube position relative to the tetracube center
        const relativePosition = cube.position.subtract(center);

        // Rotate the relative position
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


export function generateTetracubePosition(tetracube: BABYLON.Mesh[]): BABYLON.Vector3 {
    let positionX = Math.floor(Math.random() * (3 - (-6) + 1)) + (-6);
    const positionY = 19;
    let positionZ = Math.floor(Math.random() * (9 - 0 + 1)) + 0;

    while (!checkTetracubePosition(tetracube, new BABYLON.Vector3(positionX, positionY, positionZ))) {
        positionX = Math.floor(Math.random() * (3 - (-6) + 1)) + (-6);
        positionZ = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
    }

    return new BABYLON.Vector3(positionX, positionY, positionZ);
}


export function generateTetracubeRotation(tetracube: BABYLON.Mesh[], tetracubePosition: BABYLON.Vector3, type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"): BABYLON.Vector3 {
    const cubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(tetracube, tetracubePosition);

    let rotationX = Math.floor(Math.random() * 4) * Math.PI / 2; // 0, π/2, π, 3π/2
    let rotationY = Math.floor(Math.random() * 4) * Math.PI / 2;
    let rotationZ = Math.floor(Math.random() * 4) * Math.PI / 2;

    while (!checkTetracubeRotation(cubePositions,  new BABYLON.Vector3(rotationX, rotationY, rotationZ), type)) {
        rotationX = Math.floor(Math.random() * 4) * Math.PI / 2;
        rotationY = Math.floor(Math.random() * 4) * Math.PI / 2;
        rotationZ = Math.floor(Math.random() * 4) * Math.PI / 2;
    }

    return new BABYLON.Vector3(rotationX, rotationY, rotationZ);
}



export function generateTetracube(scene: BABYLON.Scene): BABYLON.Mesh[] {
    const pickedTetracube: [BABYLON.Mesh[], "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"] = pickRandomTetracube(scene);
    const tetracube: BABYLON.Mesh[] = pickedTetracube[0];
    const type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3" = pickedTetracube[1];

    const position: BABYLON.Vector3 = generateTetracubePosition(tetracube);

    const rotation: BABYLON.Vector3 = generateTetracubeRotation(tetracube, position, type);

    positionTetracube(tetracube, position);

    rotateTetracube(tetracube, rotation);

    return tetracube;
}
