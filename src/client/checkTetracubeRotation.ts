import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { checkCubePosition } from "./checkTetracubePosition";


/**
 * Calculates the center point of the tetracube given the positions of all the cubes that make it up.
 * @param position - The positions of all the cubes in the tetracube.
 * @returns The center point as a Vector3.
 */
export function calculateCenter(position: BABYLON.Vector3[]): BABYLON.Vector3 {
    let center: BABYLON.Vector3 = position.reduce((acc, pos) => acc.addInPlace(pos), BABYLON.Vector3.Zero()).scaleInPlace(1 / position.length);
    return center;
}


/**
 * Applies a rotation matrix to a given tetracube by rotating each cube relative to the tetracube's center.
 * @param position - The positions of all the cubes in the tetracube.
 * @param rotationMatrix - The rotation matrix to apply to the tetracube.
 * @param type - The type of tetracube (T, I, O, LJ, SZ, Tower1, Tower2, Tower3) for error checking.
 * @returns The positions of all the cubes in the rotated tetracube as an array of Vector3's.
 */
export function calculateTetracubeCubeRotation(position: BABYLON.Vector3[], rotationMatrix: BABYLON.Matrix, type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"): BABYLON.Vector3[] {
    const newTetracubeCubePositions: BABYLON.Vector3[] = [];

    // Find the center of the tetracube by averaging the positions of the cubes
    const center = calculateCenter(position);

    for (let i = 0; i < position.length; i++) {
        // Calculate local position relative to tetracube center
        const localPosition = position[i].subtract(center);

        // Apply the rotation matrix to the local position
        const rotatedPosition = BABYLON.Vector3.TransformCoordinates(localPosition, rotationMatrix);

        const unroundedPosition = new BABYLON.Vector3(
            rotatedPosition.x + center.x,
            rotatedPosition.y + center.y,
            rotatedPosition.z + center.z
        );

        // Add the center back and round the result to integers
        const finalPosition = new BABYLON.Vector3(
            Math.round(rotatedPosition.x + center.x),
            Math.round(rotatedPosition.y + center.y),
            Math.round(rotatedPosition.z + center.z)
        );

        newTetracubeCubePositions.push(finalPosition);
    };

    return newTetracubeCubePositions;
}


/**
 * Checks if the given tetracube can be rotated by the given rotation matrix.
 * Applies the rotation matrix to each cube in the tetracube and checks if the resulting positions are all valid.
 * @param position - The positions of all the cubes in the tetracube.
 * @param rotationMatrix - The rotation matrix to apply to the tetracube.
 * @param type - The type of tetracube (T, I, O, LJ, SZ, Tower1, Tower2, Tower3) for error checking.
 * @returns True if all positions after rotation are valid, false otherwise.
 */
export function checkTetracubeRotation(position: BABYLON.Vector3[], rotationMatrix: BABYLON.Matrix, type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"): boolean {
    const rotatedTetracubeCubePositions: BABYLON.Vector3[] = calculateTetracubeCubeRotation(position, rotationMatrix, type);
    const result: boolean[] = [];

    rotatedTetracubeCubePositions.forEach((position: BABYLON.Vector3) => {
        result.push(checkCubePosition(position));
    });

    return result.every(Boolean); // Returns true if all positions are valid
}
