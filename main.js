"use strict";

class Main {
    #gl;
    #sp;

    #canvas;

    #icosphere;

    #transformLoc;
    #viewLoc;

    indicesAmount;
    verticesAmount;

    #rebind = true;

    isFlat = true;
    #previousIsFlat = false;

    subdivisions = 2;
    #previousSubdivisions = 0;

    #distance = 3.0;
    #rotationX = -30.0;
    #rotationY = 0.0;

    static #maxSubdivisions = 8;
    static #minSubdivisions = 0;
    static #maxDistance = 50.0;
    static #minDistance = 2.0;

    static #mouseSensitivity = 0.2;
    static #scrollModifier = 0.015;

    constructor(gl, sp, canvas) {
        this.#gl = gl;
        this.#sp = sp;

        Mat.gl = gl;

        this.#canvas = canvas;

        this.#icosphere = new Icosphere();

        this.#transformLoc = gl.getUniformLocation(sp, "uModel");
        this.#viewLoc = gl.getUniformLocation(sp, "uView");

        const projectionLoc = gl.getUniformLocation(sp, "uProjection");
        Mat.set(projectionLoc, Mat.perspective(1.0, 60.0, 0.1, 100.0))

        const colorLoc = gl.getUniformLocation(sp, "uColor");
        gl.uniform3fv(colorLoc, [0.211764706, 0.215686275, 0.811764706]);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        requestAnimationFrame((t) => this.draw(t));
    }

    bindIcosphere() {
        let vertices, triangles, normals;

        if (this.isFlat) {
            [vertices, triangles, normals] = this.#icosphere.getFlat();
        } else {
            [vertices, triangles, normals] = this.#icosphere.getSmooth();
        }

        var vertexNormals = Main.flatInterleave(vertices, normals);

        const vertexBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, vertexBuffer);
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(vertexNormals), this.#gl.STATIC_DRAW);

        const aVertexLoc = this.#gl.getAttribLocation(this.#sp, "aVertex");
        this.#gl.vertexAttribPointer(aVertexLoc, 3, this.#gl.FLOAT, false, 24, 0);
        this.#gl.enableVertexAttribArray(aVertexLoc);

        const aNormalLoc = this.#gl.getAttribLocation(this.#sp, "aNormal");
        this.#gl.vertexAttribPointer(aNormalLoc, 3, this.#gl.FLOAT, false, 24, 12);
        this.#gl.enableVertexAttribArray(aNormalLoc);

        const indexBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(triangles), this.#gl.STATIC_DRAW);

        this.#previousIsFlat = this.isFlat;

        this.indicesAmount = triangles.length;
        this.verticesAmount = vertices.length;
        this.#previousSubdivisions = this.subdivisions;

        Main.updateInnerText("vertices-amount", Main.localize(this.verticesAmount) + " vertices");
        Main.updateInnerText("triangles-amount", Main.localize(this.indicesAmount / 3) + " triangles");
        Main.updateValue("subdivisions", this.subdivisions);       
    }

    generateIcosphere() {
        const subdivisionDiff = this.subdivisions - this.#previousSubdivisions

        if (subdivisionDiff >= 1) {
            this.#icosphere.subdivideN(subdivisionDiff);
            this.bindIcosphere();
        } else if (subdivisionDiff < 0) {
            this.#icosphere = new Icosphere();
            this.#icosphere.subdivideN(this.subdivisions);
            this.bindIcosphere();
        } else if (this.isFlat !== this.#previousIsFlat) {
            this.bindIcosphere();
        }

        this.#previousSubdivisions = this.subdivisions;
        this.#previousIsFlat = this.isFlat;
    }

    draw(t) {
        this.generateIcosphere();

        Mat.set(this.#transformLoc, Mat.multiplyAll (
            Mat.rotateX(this.#rotationX),
            Mat.rotateY(this.#rotationY)
        ));

        Mat.set(this.#viewLoc, Mat.lookAt([0.0, 0.0, this.#distance], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]));

        const minDimensions = Math.min(this.#canvas.height, this.#canvas.width);
        this.#gl.viewport((this.#canvas.width - minDimensions) / 2.0, (this.#canvas.height - minDimensions) / 2.0, minDimensions, minDimensions);

        this.#gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);

        this.#gl.drawElements(this.#gl.TRIANGLES, this.indicesAmount, this.#gl.UNSIGNED_INT, 0);

        requestAnimationFrame((t) => this.draw(t));
    }

    scroll(deltaY) {
        this.#distance = this.clamp(this.#distance + deltaY * Main.#scrollModifier, Main.#minDistance, Main.#maxDistance);
    }

    rotateModel(xOffset, yOffset) {
        this.#rotationY -= xOffset * Main.#mouseSensitivity;
        this.#rotationX -= yOffset * Main.#mouseSensitivity;
        this.#rotationX = this.clamp(this.#rotationX, -90.0, 90.0);
    }

    changeSubdivisions(c) {
        this.subdivisions = this.clamp(this.subdivisions + c, Main.#minSubdivisions, Main.#maxSubdivisions);
    }

    shadeFlat() {
      this.isFlat = true;
    }

    shadeSmooth() {
      this.isFlat = false;
    }

    clamp(x, min, max) {
        return Math.min(Math.max(x, min), max);
    }

    static flatInterleave(a, b) {
        if (a.length !== b.length) {
            throw new Error("Interleave requires arrays of the same length.");
        }

        const result = [];

        for (let i = 0; i < a.length; i++) {
            result.push(...a[i], ...b[i]);
        }

        return result;
    }

    static updateInnerText(id, text) {
      document.getElementById(id).innerText = text;
    }

    static updateValue(id, text) {
      document.getElementById(id).value = text;
    }

    static localize(num) {
      return Number(num).toLocaleString("de-CH");
    }
}

