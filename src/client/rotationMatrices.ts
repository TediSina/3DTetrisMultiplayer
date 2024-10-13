import { Matrix } from "@babylonjs/core/Legacy/legacy";


export const noRotationMatrix = Matrix.FromValues(
    1, 0, 0, 0,  // first column
    0, 1, 0, 0,  // second column
    0, 0, 1, 0,  // third column
    0, 0, 0, 1   // fourth column (identity)
);


export const rotationMatrixX90 = Matrix.FromValues(
    1, 0, 0, 0, // first column
    0, 0, 1, 0, // second column
    0, -1, 0, 0, // third column
    0, 0, 0, 1  // fourth column (identity)
);

export const rotationMatrixY90 = Matrix.FromValues(
    0, 0, -1, 0, // first column
    0, 1, 0, 0,  // second column
    1, 0, 0, 0,  // third column
    0, 0, 0, 1   // fourth column (identity)
);

export const rotationMatrixZ90 = Matrix.FromValues(
    0, 1, 0, 0,  // first column
    -1, 0, 0, 0, // second column
    0, 0, 1, 0,  // third column
    0, 0, 0, 1   // fourth column (identity)
);

export const rotationMatrixX180 = Matrix.FromValues(
    1, 0, 0, 0,  // first column
    0, -1, 0, 0, // second column
    0, 0, -1, 0, // third column
    0, 0, 0, 1   // fourth column (identity)
);

export const rotationMatrixY180 = Matrix.FromValues(
    -1, 0, 0, 0, // first column
    0, 1, 0, 0,  // second column
    0, 0, -1, 0, // third column
    0, 0, 0, 1   // fourth column (identity)
);

export const rotationMatrixZ180 = Matrix.FromValues(
    -1, 0, 0, 0, // first column
    0, -1, 0, 0, // second column
    0, 0, 1, 0,  // third column
    0, 0, 0, 1   // fourth column (identity)
);

export const rotationMatrixX270 = Matrix.FromValues(
    1, 0, 0, 0,  // first column
    0, 0, -1, 0, // second column
    0, 1, 0, 0,  // third column
    0, 0, 0, 1   // fourth column (identity)
);

export const rotationMatrixY270 = Matrix.FromValues(
    0, 0, 1, 0,  // first column
    0, 1, 0, 0,  // second column
    -1, 0, 0, 0, // third column
    0, 0, 0, 1   // fourth column (identity)
);

export const rotationMatrixZ270 = Matrix.FromValues(
    0, -1, 0, 0, // first column
    1, 0, 0, 0,  // second column
    0, 0, 1, 0,  // third column
    0, 0, 0, 1   // fourth column (identity)
);
