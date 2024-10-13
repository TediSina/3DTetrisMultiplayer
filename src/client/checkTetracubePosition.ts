import * as BABYLON from "@babylonjs/core/Legacy/legacy";


/**
 * Calculates the positions of all the cubes in the given tetracube if they were to be translated to the given position.
 * @param tetracube - The tetracube to be translated.
 * @param position - The position to translate the tetracube to.
 * @returns An array of positions, one for each cube in the tetracube.
 */
export function calculateTetracubeCubePosition(tetracube: BABYLON.Mesh[], position: BABYLON.Vector3): BABYLON.Vector3[] {
    const newTetracubeCubePositions: BABYLON.Vector3[] = [];
    const translationMatrix = BABYLON.Matrix.Translation(position.x, position.y, position.z);

    tetracube.forEach(cube => {
        newTetracubeCubePositions.push(BABYLON.Vector3.TransformCoordinates(cube.position, translationMatrix));
    });

    return newTetracubeCubePositions;
}


/**
 * Checks if the given cube position is within the valid game board boundaries.
 * A valid position is one where x is between -6 and 3, y is between 0 and 22, and z is between 0 and 9.
 * The position coordinates must also be integers.
 * @param position - The position of the cube to be checked.
 * @returns True if the position is valid, false otherwise.
 */
export function checkCubePosition(position: BABYLON.Vector3): boolean {
    if (position.x >= 0 && position.x <= 9 && position.y >= 0 && position.y <= 22 && position.z >= 0 && position.z <= 9 && Number.isInteger(position.x) && Number.isInteger(position.y) && Number.isInteger(position.z)) {
        return true;
    } else {
        return false;
    }
}


/**
 * Checks if all the cubes in the given tetracube at the given position are within the valid game board boundaries.
 * @param tetracube - The tetracube to be checked.
 * @param position - The position of the tetracube to be checked.
 * @returns True if all the cubes in the tetracube are in a valid position, false otherwise.
 */

export function checkTetracubePosition(tetracube: BABYLON.Mesh[], position: BABYLON.Vector3): boolean {
    const calculatedTetracubeCubePositions: BABYLON.Vector3[] = calculateTetracubeCubePosition(tetracube, position);
    const result: boolean[] = [];

    calculatedTetracubeCubePositions.forEach((position: BABYLON.Vector3) => {
        result.push(checkCubePosition(position))
    });
    
    return result.every(Boolean); // Returns true if all elements are true
}
