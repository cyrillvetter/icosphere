"use strict";

class Mat {
    static gl;

    static id = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];

    static cs(phi) {
        const t = phi * Math.PI / 180.0;
        return [
            Math.cos(t),
            Math.sin(t)
        ];
    }

    static rotateX(phi) {
        const [c, s] = Mat.cs(phi);

        return [
            [1, 0,  0, 0],
            [0, c, -s, 0],
            [0, s,  c, 0],
            [0, 0,  0, 1]
        ];
    }

    static rotateY(phi) {
        const [c, s] = Mat.cs(phi);

        return [
            [ c, 0, s, 0],
            [ 0, 1, 0, 0],
            [-s, 0, c, 0],
            [ 0, 0, 0, 1]
        ];
    }
    
    static rotateZ(phi) {
        const [c, s] = Mat.cs(phi);

        return [
            [c, -s, 0, 0],
            [s,  c, 0, 0],
            [0,  0, 1, 0],
            [0,  0, 0, 1]
        ];
    }

    static scale(f, g, h) {
        if (g === undefined && h === undefined) {
            g = h = f;
        }

        return [
            [f, 0.0, 0.0, 0.0],
            [0.0, g, 0.0, 0.0],
            [0.0, 0.0, h, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ];
    }

    static perspective(aspect, fov, near, far) {
        const fovRad = fov * Math.PI / 180.0;
        const tanHalfFov = Math.tan(fovRad / 2);

        return [
            [1 / (aspect * tanHalfFov), 0.0,  0.0, 0.0],
            [0.0, 1 / tanHalfFov,  0.0, 0.0],
            [0.0, 0.0, -((far + near) / (far - near)), -((2 * far * near) / (far - near))],
            [0.0, 0.0,   -1.0, 0.0]
        ];
    }

    static lookAt(from, to, up) {
        const z = Vector3.normalized(Vector3.sub(from, to));
        const x = Vector3.normalized(Vector3.cross(up, z));
        const y = Vector3.normalized(Vector3.cross(z, x));

        return [
            [ x [0], x [1], x [2], -Vector3.dot(from, x) ],
            [ y [0], y [1], y [2], -Vector3.dot(from, y) ],
            [ z [0], z [1], z [2], -Vector3.dot(from, z) ],
            [   0.0,   0.0,   0.0,                   1.0 ]
        ];
    }

    static multiplyAll() {
        if (arguments.length < 1) {
            return Mat.id;
        }

        let res = arguments [0];
        for (let i = 1; i < arguments.length; ++i)
        {
            const mat = arguments [i];
            res = Mat.multiply(res, mat);
        }

        return res;
    }

    static multiply(lhs, rhs) {
        let res = [];

        for (let i = 0; i < 4; ++i)
        {
            let row = [];
            for (let k = 0; k < 4; ++k)
            {
                let s = 0;
                for (let j = 0; j < 4; ++j) {
                    s += lhs [i] [j] * rhs [j] [k];
                }
                row [k] = s;
            }
            res [i] = row;
        }

        return res;
    }

    static set(loc, mat) {
        if (Mat.gl === undefined) {
            throw new Error("Cannot set uniform matrix on undefined gl.");
        }

        Mat.gl.uniformMatrix4fv (loc, false, [
            mat [0] [0], mat [1] [0], mat [2] [0], mat [3] [0],
            mat [0] [1], mat [1] [1], mat [2] [1], mat [3] [1],
            mat [0] [2], mat [1] [2], mat [2] [2], mat [3] [2],
            mat [0] [3], mat [1] [3], mat [2] [3], mat [3] [3]
        ]);
    }
}
