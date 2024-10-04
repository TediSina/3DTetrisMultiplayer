//import * as BABYLON from "@babylonjs/core/Legacy/legacy";
//import { checkTetracubePosition } from "../client/checkTetracubePosition";
//
//

/**
 * Returns a random tetracube type as a string.
 *
 * @returns A random tetracube type, one of "I", "LJ", "T", "SZ", "O", "Tower1", "Tower2", or "Tower3".
 */
export function pickRandomTetracube(): string {
    const random = Math.floor(Math.random() * 8);
    switch (random) {
        case 0: return "I";
        case 1: return "LJ";
        case 2: return "T";
        case 3: return "SZ";
        case 4: return "O";
        case 5: return "Tower1";
        case 6: return "Tower2";
        case 7: return "Tower3";
        default: return "I";
    }
}
//
//
//export function generatePosition(): BABYLON.Vector3 {
//    let positionX = Math.floor(Math.random() * 10) - 6;
//    const positionY = 19;
//    let positionZ = Math.floor(Math.random() * 10);
//
//    while (!checkTetracubePosition(this.cubes, new BABYLON.Vector3(positionX, positionY, positionZ))) {
//        positionX = Math.floor(Math.random() * 10) - 6;
//        positionZ = Math.floor(Math.random() * 10);
//    }
//
//    return new BABYLON.Vector3(positionX, positionY, positionZ);
//}
//
//
//export function generateRotation(position: BABYLON.Vector3): BABYLON.Vector3 {
//    const cubePositions = calculateTetracubeCubePosition(this.cubes, position);
//
//    let rotationX = Math.floor(Math.random() * 4) * Math.PI / 2;
//    let rotationY = Math.floor(Math.random() * 4) * Math.PI / 2;
//    let rotationZ = Math.floor(Math.random() * 4) * Math.PI / 2;
//
//    while (!checkTetracubeRotation(cubePositions, new BABYLON.Vector3(rotationX, rotationY, rotationZ))) {
//        rotationX = Math.floor(Math.random() * 4) * Math.PI / 2;
//        rotationY = Math.floor(Math.random() * 4) * Math.PI / 2;
//        rotationZ = Math.floor(Math.random() * 4) * Math.PI / 2;
//    }
//
//    return new BABYLON.Vector3(rotationX, rotationY, rotationZ);
//}
//