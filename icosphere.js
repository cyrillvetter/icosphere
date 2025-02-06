class Icosphere {
  vertices;
  triangles;

  lookup = new Map();

  constructor() {
    const X = 0.525731112119133606;
    const Z = 0.850650808352039932;
    const N = 0.0;

    // Initialize vertices.
    this.vertices = [
      [-X, N, Z], [X, N, Z], [-X, N, -Z], [X, N, -Z],
      [N, Z, X], [N, Z, -X], [N, -Z, X], [N, -Z, -X],
      [Z, X, N], [-Z, X, N], [Z, -X, N], [-Z, -X, N]
    ];

    // Initialize triangles.
    this.triangles = [
      0, 1, 4, 0, 4, 9, 9, 4, 5, 4, 8, 5, 4, 1, 8,
  		8, 1, 10, 8, 10, 3, 5, 8, 3, 5, 3, 2, 2, 3, 7,
  		7, 3, 10, 7, 10, 6, 7, 6, 11, 11, 6, 0, 0, 6, 1,
  		6, 10, 1, 9, 11, 0, 9, 2, 11, 9, 5, 2, 7, 11, 2
    ]
  }

  getSmooth() {
    return [this.vertices, this.triangles, this.vertices];
  }

  getFlat() {
    const newVertices = [];
    const newTriangles = [];
    const normals = [];
    
    for (let i = 0; i < this.triangles.length; i += 3) {
      const t1 = this.triangles[i];
      const t2 = this.triangles[i + 1];
      const t3 = this.triangles[i + 2];

      const v1 = this.vertices[t1];
      const v2 = this.vertices[t2];
      const v3 = this.vertices[t3];

      newVertices.push(v1, v2, v3);

      const normal = Vector3.cross(Vector3.sub(v2, v1), Vector3.sub(v3, v1));

      for (let j = 0; j < 3; j++) {
        normals.push(normal);
        newTriangles.push(i + j);
      }
    }

    return [newVertices, newTriangles, normals];
  }

  subdivideN(n) {
    for (let i = 0; i < n; i++) {
      this.subdivide();
    }
  }

  subdivide() {
    this.lookup.clear();
    const newTriangles = [];

    for (let i = 0; i < this.triangles.length; i += 3) {
      const t1 = this.triangles[i];
      const t2 = this.triangles[i + 1];
      const t3 = this.triangles[i + 2];

      const a = this.vertexForEdge(t1, t2);
      const b = this.vertexForEdge(t2, t3);
      const c = this.vertexForEdge(t3, t1);

      newTriangles.push(t1, a, c, t2, b, a, t3, c, b, a, b, c);
    }

    this.triangles = newTriangles;
  }

  vertexForEdge(first, second) {
    const smaller = Math.min(first, second);
    const greater = Math.max(first, second);
    const key = (BigInt(smaller) << BigInt(32)) + BigInt(greater);

    if (this.lookup.has(key)) {
      return this.lookup.get(key);
    }

    const p1 = this.vertices[first];
    const p2 = this.vertices[second];
    const mid = Vector3.normalized(Vector3.add(p1, p2));

    this.vertices.push(mid);

    const index = this.vertices.length - 1;
    this.lookup.set(key, index);
    return index;
  }
}
