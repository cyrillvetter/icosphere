"use strict";

class Vector3 {
  static add([x1, y1, z1], [x2, y2, z2]) {
    return [x1 + x2, y1 + y2, z1 + z2];
  }

  static sub([x1, y1, z1], [x2, y2, z2]) {
    return [x1 - x2, y1 - y2, z1 - z2];
  }

  static normalized([x, y, z]) {
    const len = Math.sqrt(x*x + y*y + z*z);

    if (len === 0.0) {
      throw new Error("Cannot normalize null vector.");
    }

    return [x / len, y / len, z / len];
  }

  static cross(v1, v2) {
    const x = v1[1] * v2[2] - v1[2] * v2[1];
    const y = v1[2] * v2[0] - v1[0] * v2[2];
    const z = v1[0] * v2[1] - v1[1] * v2[0];

    return [x, y, z];
  }

  static dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  }
}

