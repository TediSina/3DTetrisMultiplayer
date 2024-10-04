import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { checkCubePosition } from "./checkTetracubePosition";


export function calculateTetracubeCubeRotation(position: BABYLON.Vector3[], rotation: BABYLON.Vector3): BABYLON.Vector3[] {
    const newTetracubeCubePositions: BABYLON.Vector3[] = [];
    const rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);

    // Find the center of the tetracube by averaging the positions of the cubes
    const center = position.reduce((acc, pos) => acc.addInPlace(pos), BABYLON.Vector3.Zero()).scaleInPlace(1 / position.length);

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

        console.log("Before Rounding: " + unroundedPosition); 

        // Add the center back and round the result to integers
        const finalPosition = new BABYLON.Vector3(
            Math.round(rotatedPosition.x + center.x),
            Math.round(rotatedPosition.y + center.y),
            Math.round(rotatedPosition.z + center.z)
        );

        console.log("After Rounding: " + finalPosition);

        newTetracubeCubePositions.push(finalPosition);
    };

    return newTetracubeCubePositions;
}


export function checkTetracubeRotation(position: BABYLON.Vector3[], rotation: BABYLON.Vector3): boolean {
    const rotatedTetracubeCubePositions: BABYLON.Vector3[] = calculateTetracubeCubeRotation(position, rotation);
    const result: boolean[] = [];

    rotatedTetracubeCubePositions.forEach((position: BABYLON.Vector3) => {
        result.push(checkCubePosition(position));
    });

    return result.every(Boolean); // Returns true if all positions are valid
}
