//
// DI Computer Graphics
//
// WebGL Exercises
//

// Register function to call after document has loaded
window.onload = startup;

// the gl object is saved globally
var gl;

// all parameters associated with the shader program
var ctx = {
    shaderProgram: -1,
    aVertexPositionId: -1,
    aVertexColorId: -1,
    aVertexTextureCoordId: -1,
    aVertexNormalId: -1,
    uModelViewMatrixId: -1,
    uProjectionMatrixId: -1,
    uNormalMatrixId: -1,
    uTextureMatrixId: -1,
    uSamplerId: -1,
    uEnableTextureId: -1,
    uLightPositionId: -1,
    uLightColorId: -1,
    uEnableLightingId: -1
};

// loaded textures
var textures = {
    textureObject0: {},
    textureObject1: {}
};

// parameters that define the scene
var scene = {
    eyePosition: [0, 0, 5],
    lookAtPosition: [0, 0, 0],
    upVector: [0, 1, 0],
    nearPlane: 0.1,
    farPlane: 30.0,
    fov: 65,
    lights: [
        { pos:[0, 0, -10], color: [1,1,1] },
    ],
    rotateObjects: true,
    angle: 0,
    angularSpeed: 0.025 * 2 * Math.PI / 360.0
};

// ball
var ball = {
    position: [0, 0, 0],
    moveDirection: [0.08, 0.09, 0.07]
};

// player paddle
var playerPaddle = {
    position : [0, 0, 2],
    moveDirection: [0.04, 0.04]
}

// BOT paddle
var botPaddle = {
    position : [0, 0, -6.5],
    moveDirection: [0.08, 0.09]
}

// defined objects
var drawingObjects = {
    solidCube: null,
    solidSphere: null,
    wireFrame: null,
    playerPaddle: null,
    botPaddle: null
};

// Key Handling
var key = {
    A: 97,
    D: 100,
    W: 119,
    S: 115,
};

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    "use strict";
    var canvas = document.getElementById("canvas");
    gl = createGLContext(canvas);
    initGL();
    loadTexture();
    window.requestAnimationFrame(drawAnimated);
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL() {
    "use strict";
    ctx.shaderProgram = loadAndCompileShaders(gl, 'VertexShader.glsl', 'FragmentShaderLighting.glsl');
    setUpAttributesAndUniforms();
    defineObjects();

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.5, 0.5, 0.5, 1);
}

/**
 * Initialize a texture from an image
 * @param image the loaded image
 * @param textureObject WebGL Texture Object
 */
function initTexture(image, textureObject) {
    // create a new texture
    gl.bindTexture(gl.TEXTURE_2D, textureObject);

    // set parameters for the texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    // turn texture off again
    gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * Load an image as a texture
 */
function loadTexture() {
    var image_walls = new Image();
    var image_paddle = new Image();

    // create a texture object
    textures.textureObject0 = gl.createTexture();
    textures.textureObject1 = gl.createTexture();
    image_walls.onload = function() {
        console.log("Image for walls loaded");
        initTexture(image_walls, textures.textureObject0);
    };
    image_paddle.onload = function () {
        console.log("Image for paddles loaded");
        initTexture(image_paddle, textures.textureObject1);
    };
    // setting the src will trigger onload
    image_walls.src = "textures/stone.jpeg";
    image_paddle.src = "textures/stone_brick.jpeg";
}

/**
 * Define objects that are drawn within the scene
 */
function defineObjects() {
    drawingObjects.solidCube = new SolidCube(gl,
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0],
        [0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0]);
    drawingObjects.solidSphere = new SolidSphere(gl, 50, 50);
    drawingObjects.wireFrame = new WireFrame(gl, [1.0, 1.0, 1.0, 1.0]);
    drawingObjects.playerPaddle = new SolidRectangle(gl, [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]);
    drawingObjects.botPaddle = new SolidRectangle(gl, [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]);
}

/**
 * Setup all the attribute and uniform variables
 */
function setUpAttributesAndUniforms(){
    "use strict";
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    ctx.aVertexColorId = gl.getAttribLocation(ctx.shaderProgram, "aVertexColor");
    ctx.aVertexTextureCoordId = gl.getAttribLocation(ctx.shaderProgram, "aVertexTextureCoord");
    ctx.aVertexNormalId = gl.getAttribLocation(ctx.shaderProgram, "aVertexNormal");

    ctx.uModelViewMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uModelViewMatrix");
    ctx.uProjectionMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uProjectionMatrix");
    ctx.uNormalMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uNormalMatrix");
    ctx.uTextureMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uTextureMatrix");

    ctx.uSamplerId = gl.getUniformLocation(ctx.shaderProgram, "uSampler");
    ctx.uEnableTextureId = gl.getUniformLocation(ctx.shaderProgram, "uEnableTexture");

    ctx.uLightPositionId = gl.getUniformLocation(ctx.shaderProgram, "uLightPosition");
    ctx.uLightColorId = gl.getUniformLocation(ctx.shaderProgram, "uLightColor");
    ctx.uEnableLightingId = gl.getUniformLocation(ctx.shaderProgram, "uEnableLighting");
}

/**
 * Calculate the movement of the ball
 */
function moveBall(){
    //detect ball on top and bottom
    if (Math.abs(ball.position[0]) >= 2.4) {
        ball.moveDirection[0] *= -1;
    }
    if (Math.abs(ball.position[1]) >= 2.4) {
        ball.moveDirection[1] *= -1;
    }
    //front
    if (ball.position[2] >= 2) {
        ball.moveDirection[2] *= -1;
    }
    //back
    if (ball.position[2] <= -6.5) {
        ball.moveDirection[2] *= -1;
    }

    ball.position[0] += ball.moveDirection[0];
    ball.position[1] += ball.moveDirection[1];
    ball.position[2] += ball.moveDirection[2];
}

/**
 * Calculate the movement of the player paddle
 */
function movePlayerPaddle() {
    if(Math.abs(playerPaddle.position[0]) >= 2.2) {
        playerPaddle.moveDirection[0] *= -1;
    }

    if(Math.abs(playerPaddle.position[1]) >= 1.7) {
        playerPaddle.moveDirection[1] *= -1;
    }

    playerPaddle.position[0] += playerPaddle.moveDirection[0];
    playerPaddle.position[1] += playerPaddle.moveDirection[1];
}

/**
 * Calculate position of bot paddle
 */
function moveBotPaddle() {
     botPaddle.position[0] = ball.position[0];
     botPaddle.position[1] = ball.position[1];
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    var modelViewMatrix = mat4.create();
    var viewMatrix = mat4.create();
    var projectionMatrix = mat4.create();
    var textureMatrix = mat3.create();
    var normalMatrix = mat3.create();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the matrices from the scene
    mat4.lookAt(viewMatrix, scene.eyePosition, scene.lookAtPosition, scene.upVector);

    mat4.perspective(projectionMatrix,
        glMatrix.toRadian(scene.fov),
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        scene.nearPlane, scene.farPlane);

    // enable the texture mapping
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.textureObject0);
    gl.uniform1i(ctx.uSamplerId, 0);
    gl.uniformMatrix3fv(ctx.uTextureMatrixId, false, textureMatrix);

    // tell the fragment shader to use the texture
    gl.uniform1i(ctx.uEnableTextureId, 1);

    gl.uniformMatrix3fv(ctx.uTextureMatrixId, false, textureMatrix);

    // set the light
    gl.uniform1i(ctx.uEnableLightingId, 1);
    for (let light of scene.lights) {
        gl.uniform3fv(ctx.uLightPositionId, light.pos);
        //gl.uniform3fv(ctx.uLightPositionId, ball.position);
        gl.uniform3fv(ctx.uLightColorId, light.color);
    }

    // same projection matrix for all drawings, so it can be specified here
    gl.uniformMatrix4fv(ctx.uProjectionMatrixId, false, projectionMatrix);

    // LEFT SIDE
    mat4.translate(modelViewMatrix, viewMatrix, [-3, 0, -2]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [1.0, 5, 10]);
    //mat4.rotate(modelViewMatrix, modelViewMatrix, scene.angle, [1, 1, 0]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);
    drawingObjects.solidCube.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId, ctx.aVertexTextureCoordId, textures.textureObject0);

    // RIGHT SIDE
    mat4.translate(modelViewMatrix, viewMatrix, [3, 0, -2]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [1.0, 5, 10]);
    //mat4.rotate(modelViewMatrix, modelViewMatrix, scene.angle, [0, 1, 1]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);
    drawingObjects.solidCube.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId, ctx.aVertexTextureCoordId, textures.textureObject0);

    // TOP
    mat4.translate(modelViewMatrix, viewMatrix, [0, 3, -2]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [5, 1, 10]);
    //mat4.rotate(modelViewMatrix, modelViewMatrix, scene.angle, [0, 1, 1]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);
    drawingObjects.solidCube.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId, ctx.aVertexTextureCoordId, textures.textureObject0);

    // BOTTOM
    mat4.translate(modelViewMatrix, viewMatrix, [0, -3, -2]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [5, 1, 10]);
    //mat4.rotate(modelViewMatrix, modelViewMatrix, scene.angle, [0, 1, 1]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);
    drawingObjects.solidCube.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId, ctx.aVertexTextureCoordId, textures.textureObject0);

    // back
    mat4.translate(modelViewMatrix, viewMatrix, [0, 0, -7]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [5, 5, 0.1]);
    //mat4.rotate(modelViewMatrix, modelViewMatrix, scene.angle, [0, 1, 1]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);
    drawingObjects.solidCube.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId, ctx.aVertexTextureCoordId, textures.textureObject0);

    // draw ball
    moveBall()
    mat4.translate(modelViewMatrix, viewMatrix, [0.0, 0.0, -1.0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [0.5, 0.5, 0.5]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);

    drawingObjects.solidSphere.drawWithColor(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId, [1, 1, 1]);

    // frame of ball position
    mat4.translate(modelViewMatrix, viewMatrix, [0, 0, ball.position[2]]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [2.4, 2.4, 0]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);
    drawingObjects.wireFrame.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId);

    // player paddle
    gl.bindTexture(gl.TEXTURE_2D, textures.textureObject1); // use second texture
    gl.uniform1i(ctx.uSamplerId, 0);
    gl.uniformMatrix3fv(ctx.uTextureMatrixId, false, textureMatrix);
    gl.uniformMatrix3fv(ctx.uTextureMatrixId, false, textureMatrix);

    movePlayerPaddle();
    mat4.translate(modelViewMatrix, viewMatrix, [playerPaddle.position[0],
        playerPaddle.position[1], playerPaddle.position[2]]); // the limit of the z-axis towards the player is 2
    mat4.scale(modelViewMatrix, modelViewMatrix, [3, 2, 0]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);

    drawingObjects.playerPaddle.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId)

    // bot paddle
    moveBotPaddle()
    mat4.translate(modelViewMatrix, viewMatrix, [botPaddle.position[0],
        botPaddle.position[1], botPaddle.position[2]]); // the limit of the z-axis backwards is 6.5 (approx)
    mat4.scale(modelViewMatrix, modelViewMatrix, [3, 2, 0]);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, modelViewMatrix);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(ctx.uNormalMatrixId, false, normalMatrix);

    drawingObjects.botPaddle.draw(gl, ctx.aVertexPositionId, ctx.aVertexColorId, ctx.aVertexNormalId);
}

var first = true;
var lastTimeStamp = 0;
function drawAnimated( timeStamp ) {
    var timeElapsed = 0;
    if (first) {
        lastTimeStamp = timeStamp;
        first = false;
    } else {
        timeElapsed = timeStamp - lastTimeStamp;
        lastTimeStamp = timeStamp;
    }
    // calculate time since last call
    // move or change objects
    scene.angle += timeElapsed * scene.angularSpeed;
    if (scene.angle > 2.0*Math.PI) {
        scene.angle -= 2.0*Math.PI;
    }
    draw();
    // request the next frame
    window.requestAnimationFrame(drawAnimated);
}

/**
 * Event listener for key presses
 */
document.addEventListener('keypress', (event) => {
    console.log(event.keyCode);
    if(event.keyCode == key.A) {
        if(playerPaddle.moveDirection[0] > 0) {
            playerPaddle.moveDirection[0] *= -1;
        }
    } else if (event.keyCode == key.D) {
        if(playerPaddle.moveDirection[0] < 0) {
            playerPaddle.moveDirection[0] *= -1;
        }
    } else if (event.keyCode == key.W) {
        if(playerPaddle.moveDirection[1] < 0) {
            playerPaddle.moveDirection[1] *= -1;
        }
    } else if (event.keyCode == key.S) {
        if(playerPaddle.moveDirection[1] > 0) {
            playerPaddle.moveDirection[1] *= -1;
        }
    }

}, false);