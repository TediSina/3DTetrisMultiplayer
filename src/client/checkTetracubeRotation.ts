import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { checkCubePosition } from "./checkTetracubePosition";


/**
 * Calculates the center of rotation for the given tetracube type based on its positions and rotation.
 * @param position - Array of positions of the cubes.
 * @param rotation - The rotation vector (x = pitch, y = yaw, z = roll).
 * @param type - The type of tetracube (T, I, O, LJ, SZ, Tower1, Tower2, Tower3).
 * @returns The center of rotation for the tetracube based on the current rotation.
 */
export function calculateCenter(
    position: BABYLON.Vector3[],
    rotation: BABYLON.Vector3,
    type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3", 
): BABYLON.Vector3 {
    let center: BABYLON.Vector3;
    
    // Base calculation of the center based on the tetracube type
    switch (type) {
        case "T":
            center = position[3]; // Top middle cube of T
            break;

        case "I":
            center = BABYLON.Vector3.Lerp(position[1], position[2], 0.5); // Middle of the bar
            break;

        case "O":
            center = BABYLON.Vector3.Lerp(position[0], position[3], 0.5); // Between the four cubes
            break;

        case "LJ":
            center = position[2]; // The corner cube of the L/J
            break;

        case "SZ":
            center = BABYLON.Vector3.Lerp(position[1], position[2], 0.5); // Between the overlapping cubes
            break;

        case "Tower1":
            center = position[3]; // The top cube could serve as the center
            break;

        case "Tower2":
            center = position[0]; // Bottom corner cube as a reference point
            break;

        case "Tower3":
            center = position[3]; // The tower top could serve as a good center
            break;

        default:
            center = position.reduce((acc, pos) => acc.addInPlace(pos), BABYLON.Vector3.Zero()).scaleInPlace(1 / position.length); // Fallback: geometric center
            break;
    }

    const relativeCenter = center.subtract(position.reduce((acc, pos) => acc.addInPlace(pos), BABYLON.Vector3.Zero()).scaleInPlace(1 / position.length));

    console.log("Absolute center: " + center);
    console.log("Relative center: " + relativeCenter);

    return center;
}


export function calculateTetracubeCubeRotation(position: BABYLON.Vector3[], rotation: BABYLON.Vector3, type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"): BABYLON.Vector3[] {
    const newTetracubeCubePositions: BABYLON.Vector3[] = [];
    const rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);

    // Find the center of the tetracube by averaging the positions of the cubes
    const center = calculateCenter(position, rotation, type);

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


export function checkTetracubeRotation(position: BABYLON.Vector3[], rotation: BABYLON.Vector3, type: "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3"): boolean {
    const rotatedTetracubeCubePositions: BABYLON.Vector3[] = calculateTetracubeCubeRotation(position, rotation, type);
    const result: boolean[] = [];

    rotatedTetracubeCubePositions.forEach((position: BABYLON.Vector3) => {
        result.push(checkCubePosition(position));
    });

    return result.every(Boolean); // Returns true if all positions are valid
}
