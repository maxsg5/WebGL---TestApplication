var loop;
var gl;
var model;
var textures = [];
var reset = false;

//this function is callback hell right now there may be some way to make it better
var InitDemo = function() {
    loadTextResource('shader.vs.glsl', function(vsErr, vsText) {
        if (vsErr) {
            alert('Fatal error getting vertex shader (see console)');
            console.error(vsErr);
        } else {
            loadTextResource('shader.fs.glsl', function(fsErr, fsText) {
                if (fsErr) {
                    alert('Fatal error getting fragment shader (see console)');
                    console.error(fsErr);
                } else {
                    loadJSONResource('lemur.json', function(modelErr, modelObj) {
                        if(modelErr){
                            alert('Fatal error getting model (see console)');
                            console.error(modelErr);
                        } else {
                            loadImage('lemurT.png', function(imgErr, img) {
                                if(imgErr){
                                    alert('Fatal error getting image (see console)');
                                    console.error(imgErr);
                                } else {
                                    RunDemo(vsText, fsText, img, modelObj);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

var RunDemo = function(vertexShaderText, fragmentShaderText, imgTexture, modelObj) {
    console.log("this is working");
    model = modelObj;

    var canvas = document.getElementById("screen-canvas"); //get the canvas element
    gl = canvas.getContext("webgl"); //get the context of the canvas

    //log message if webgl is not supported
    if (!gl) {
        console.log("WebGL not supported, falling back on experimental-webgl");
        gl = canvas.getContext("experimental-webgl");
    }
    if(!gl){
        alert("Your browser does not support WebGL");
    }

    //setup mouse input on the canvas
    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;
    canvas.addEventListener("mousedown", function(ev) {
        mouseDown = true;
        lastMouseX = ev.clientX;
        lastMouseY = ev.clientY;
    });
    canvas.addEventListener("mouseup", function(ev) {
        mouseDown = false;
    });
    canvas.addEventListener("mousemove", function(ev) {
        if(mouseDown){
            var newX = ev.clientX;
            var newY = ev.clientY;
            var deltaX = newX - lastMouseX;
            var deltaY = newY - lastMouseY;
            lastMouseX = newX;
            lastMouseY = newY;
            //console.log("deltaX: " + deltaX + " deltaY: " + deltaY);
            //console.log("newX: " + newX + " newY: " + newY);
            //console.log("lastMouseX: " + lastMouseX + " lastMouseY: " + lastMouseY);
            model.rotation.x += deltaX * 0.01;
            model.rotation.y += deltaY * 0.01;
        }
    });
    
    

    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    // gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    //clear and set color of the canvas
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); //enable depth testing
    gl.enable(gl.CULL_FACE); //enable backface culling
    gl.frontFace(gl.CCW); //set front face to be counter clock-wise
    gl.cullFace(gl.BACK); //set culling face to be back face

    //create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    //attach source code to shaders
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    //compile shaders
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compiling fragment shader!", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    //create program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    //link program
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ERROR linking program!", gl.getProgramInfoLog(program));
        return;
    }

    //validate program (not exactly sure what this does other than catching other errors)
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error("ERROR validating program!", gl.getProgramInfoLog(program));
        return;
    }

    //create buffer
    var triangleVertices = [
    //   x, y, z          r, g, b
        0.0, 0.5, 0.0,    1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0,  0.0, 1.0, 0.0,
        0.5, -0.5,  0.0,  0.0, 0.0, 1.0
    ];

    var boxVertices = 
	[ // X, Y, Z           U, V
		// Top
		-1.0, 1.0, -1.0,   0,0,
		-1.0, 1.0, 1.0,    0,1,
		1.0, 1.0, 1.0,     1,1,
		1.0, 1.0, -1.0,    1,0,

		// Left
		-1.0, 1.0, 1.0,    0,0,
		-1.0, -1.0, 1.0,   1,0,
		-1.0, -1.0, -1.0,  1,1,
		-1.0, 1.0, -1.0,   0,1,

		// Right
		1.0, 1.0, 1.0,    1,0,
		1.0, -1.0, 1.0,   1,1,
		1.0, -1.0, -1.0,  0,1,
		1.0, 1.0, -1.0,   0,0,

		// Front
		1.0, 1.0, 1.0,    1,0,
		1.0, -1.0, 1.0,   1,1,
		-1.0, -1.0, 1.0,  0,1,
		-1.0, 1.0, 1.0,   0,0,

		// Back
		1.0, 1.0, -1.0,   0,0,
		1.0, -1.0, -1.0,  0,1,
		-1.0, -1.0, -1.0, 1,1,
		-1.0, 1.0, -1.0,  1,0,

		// Bottom
		-1.0, -1.0, -1.0,   0,0,
		-1.0, -1.0, 1.0,    0,1,
		1.0, -1.0, 1.0,     1,1,
		1.0, -1.0, -1.0,    1,0,
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

var lemurIndices = [].concat.apply([],modelObj.meshes[0].faces);
var lemurTextureCoords = modelObj.meshes[0].texturecoords[0];
var lemurVerticies = modelObj.meshes[0].vertices;


    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lemurVerticies), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lemurIndices), gl.STATIC_DRAW);

    var boxTextureCoordBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxTextureCoordBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lemurTextureCoords), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    //set attribute pointers
    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(
        positionAttribLocation, //attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, boxTextureCoordBufferObject);
    var texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
    gl.vertexAttribPointer(
        texCoordAttribLocation, //attribute location
        2, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0
    );

    //enable attribute pointers
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);


    //create texture
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgTexture);

    textures.push(boxTexture);

    gl.bindTexture(gl.TEXTURE_2D, null);


    // Tell WebGL state machine which program should be active.
    gl.useProgram(program);

    var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    var matViewUniformLocation = gl.getUniformLocation(program, "mView");
    var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

    var projMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var worldMatrix = new Float32Array(16);
    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -150], [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);



    //main render loop
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    var angle = 0;
    var textureNum = 0;
    loop = function() {
        if(reset == true){
            return;
        }
        gl.useProgram(program);
        angle = performance.now() / 1000 / 6 * 1 * Math.PI; //rotate the triangle fully every 6 seconds
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]); //rotate around y-axis
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle/4, [1, 0, 0]); //rotate around x-axis

        glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix); //combine the two rotations
        
        //gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix); //send the matrix to the shader
        //clear the canvas
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        textureNum = textures.length-1;
        gl.bindTexture(gl.TEXTURE_2D, textures[textureNum]);
        //gl.activeTexture(gl.TEXTURE1);
        
        gl.drawElements(gl.TRIANGLES, lemurIndices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        requestAnimationFrame(loop);
    
    };
    requestAnimationFrame(loop); // good to know that this is not called when the tab looses focus.
};

async function loadTexture(){
    let formData = new FormData();
    formData.append('file', myFile.files[0]);
    await fetch('/upload.php',{method : 'POST', body : formData});
    restart();
}

function restart(){
    console.log("restart");
    reset = true;

    var newImg = new Image(100,100);
    newImg.src = myFile.files[0].name;
    newImg.id = "newImg";
    document.getElementById("images-uploaded").appendChild(newImg);
    
    var newTexture = gl.createTexture();
    newImg.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, newTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, newImg);
    }

    textures.push(newTexture);
    console.log(textures.length);
    reset = false;
    requestAnimationFrame(loop);
}

