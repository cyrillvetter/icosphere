"use strict";

window.onload = async function()
{
    const canvas = document.getElementById("myCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    let gl = canvas.getContext("webgl2");

    const main = await createShader(gl, "./vertex-shader.glsl", "./fragment-shader.glsl")
        .then(sp => new Main(gl, sp, canvas));

    setupControls(canvas, main);
}

function setupControls(canvas, main) {
    const toolWindow = document.getElementById("tool-window");
    document.getElementById("window-toggle").onclick = () => {
        toolWindow.toggleAttribute("closed");
    };

    document.getElementById("flat").onclick = (() => main.shadeFlat());
    document.getElementById("smooth").onclick = (() => main.shadeSmooth());

    document.getElementById("increase-subdivisions").onclick = (() => main.changeSubdivisions(1));
    document.getElementById("decrease-subdivisions").onclick = (() => main.changeSubdivisions(-1));

    window.onwheel = (event) => {
        main.scroll(event.deltaY);
    };

    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;

    canvas.ontouchstart = (event) => {
        startMouseX = event.touches[0].clientX;
        startMouseY = event.touches[0].clientY;
        isDragging = true;
    };

    canvas.ontouchend = (event) => {
        isDragging = false;
    };

    canvas.ontouchmove = (event) => {
        handleDrag(event.touches[0].clientX, event.touches[0].clientY);
    };

    canvas.onmousedown = (event) => {
        canvas.style.cursor = "grabbing";
        startMouseX = event.clientX;
        startMouseY = event.clientY;
        isDragging = true;
    };

    canvas.onmouseup = (event) => {
        canvas.style.cursor = "grab";
        isDragging = false;
    };

    window.onmousemove = (event) => {
        handleDrag(event.clientX, event.clientY);
    };

    function handleDrag(x, y) {
        if (isDragging) {
            main.rotateModel(startMouseX - x, startMouseY - y);
            startMouseX = x;
            startMouseY = y;
        }
    }
}

async function createShader(gl, vsPath, fsPath) {
    const vsProg = await fetch(vsPath)
        .then(result => result.text());

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsProg);
    gl.compileShader(vs);

    const fsProg = await fetch(fsPath)
        .then(result => result.text());
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsProg);
    gl.compileShader(fs);

    const sp = gl.createProgram();
    gl.attachShader(sp, vs);
    gl.attachShader(sp, fs);
    gl.linkProgram(sp);
    gl.useProgram(sp);

    return sp;
}
