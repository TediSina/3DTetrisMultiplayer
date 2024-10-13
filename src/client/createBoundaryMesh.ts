import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { GridMaterial } from "@babylonjs/materials/grid/index";


/**
 * Creates a boundary mesh with the given width, height, and depth.
 * Faces can be made transparent by passing their indices in the transparencyFaces array.
 * The generated mesh is a single mesh containing all the faces, with the materials applied accordingly.
 * @param scene - The scene to create the mesh in.
 * @param width - The width of the boundary mesh.
 * @param height - The height of the boundary mesh.
 * @param depth - The depth of the boundary mesh.
 * @param transparencyFaces - The indices of the faces to make transparent.
 * @returns The generated boundary mesh.
 */
export function createBoundaryMesh(scene: BABYLON.Scene, width: number, height: number, depth: number, transparencyFaces: number[] = []): BABYLON.Mesh {
    const materials: any[] = [];

    // Create the grid material
    const gridMaterial = new GridMaterial("groundMaterial", scene);
    gridMaterial.majorUnitFrequency = 5;
    gridMaterial.minorUnitVisibility = 0.45;
    gridMaterial.gridRatio = 1;
    gridMaterial.backFaceCulling = false;
    gridMaterial.mainColor = new BABYLON.Color3(1, 1, 1);
    gridMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    gridMaterial.opacity = 0.98;


    const transparentMaterial = new BABYLON.StandardMaterial("transparentMaterial", scene);
    transparentMaterial.alpha = 0;

    // Create materials for each face
    for (let i = 0; i < 6; i++) {
        materials.push(transparencyFaces.includes(i) ? transparentMaterial : gridMaterial);
    }

    const faces = [];

    // Front face
    const frontFace = BABYLON.MeshBuilder.CreatePlane("front", { width, height }, scene);
    frontFace.position.z = depth / 2;
    faces.push(frontFace);

    // Back face
    const backFace = BABYLON.MeshBuilder.CreatePlane("back", { width, height }, scene);
    backFace.position.z = -depth / 2;
    backFace.rotation.y = Math.PI;
    faces.push(backFace);

    // Left face
    const leftFace = BABYLON.MeshBuilder.CreatePlane("left", { width: depth, height }, scene);
    leftFace.position.x = -width / 2;
    leftFace.rotation.y = -Math.PI / 2;
    faces.push(leftFace);

    // Right face
    const rightFace = BABYLON.MeshBuilder.CreatePlane("right", { width: depth, height }, scene);
    rightFace.position.x = width / 2;
    rightFace.rotation.y = Math.PI / 2;
    faces.push(rightFace);

    // Top face
    const topFace = BABYLON.MeshBuilder.CreatePlane("top", { width, height: depth }, scene);
    topFace.position.y = height / 2;
    topFace.rotation.x = -Math.PI / 2;
    faces.push(topFace);

    // Bottom face
    const bottomFace = BABYLON.MeshBuilder.CreatePlane("bottom", { width, height: depth }, scene);
    bottomFace.position.y = -height / 2;
    bottomFace.rotation.x = Math.PI / 2;
    faces.push(bottomFace);

    // Apply corresponding material to each face
    faces.forEach((face, index) => {
        face.material = materials[index];
    });

    // Merge all the faces into one mesh
    const boundaryMesh = BABYLON.Mesh.MergeMeshes(faces, true, true, undefined, false, true) as BABYLON.Mesh;

    return boundaryMesh;
}
