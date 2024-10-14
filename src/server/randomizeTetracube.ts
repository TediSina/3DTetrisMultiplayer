//import * as BABYLON from "@babylonjs/core/Legacy/legacy";
//import { checkTetracubePosition } from "../client/checkTetracubePosition";
//
//
import * as Matrices from "../client/rotationMatrices";

export type TetracubeStringType = "T" | "I" | "O" | "LJ" | "SZ" | "Tower1" | "Tower2" | "Tower3";
export type RotationStringType = "noRotation" | "rotationX90" | "rotationX180" | "rotationX270" | "rotationY90" | "rotationY180" | "rotationY270" | "rotationZ90" | "rotationZ180" | "rotationZ270";


/**
 * Returns a random tetracube type as a string.
 *
 * @returns A random tetracube type, one of "I", "LJ", "T", "SZ", "O", "Tower1", "Tower2", or "Tower3".
 */
export function pickRandomTetracube(): TetracubeStringType {
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


/**
 * Returns a random rotation as a string, one of "noRotation", "rotationX90", "rotationX180", "rotationX270", "rotationY90", "rotationY180", "rotationY270", "rotationZ90", "rotationZ180", or "rotationZ270".
 *
 * @returns A random rotation.
 */
export function pickRandomRotation(): RotationStringType {
    switch (Math.floor(Math.random() * 10)) {
        case 0: return "noRotation";
        case 1: return "rotationX90";
        case 2: return "rotationX180";
        case 3: return "rotationX270";
        case 4: return "rotationY90";
        case 5: return "rotationY180";
        case 6: return "rotationY270";
        case 7: return "rotationZ90";
        case 8: return "rotationZ180";
        case 9: return "rotationZ270";
        default: return "noRotation";
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