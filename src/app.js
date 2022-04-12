var reset = false;
var vertexShaderSource = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec2 vertTexCoord;
    varying vec2 fragTexCoord;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main(){
        fragTexCoord = vertTexCoord;
        gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    }
    `;

var fragmentShaderSource = `
    precision mediump float;
    varying vec2 fragTexCoord;
    uniform sampler2D sampler;

    void main(){
        gl_FragColor = texture2D(sampler, fragTexCoord);
    }
    `;

var InitDemo = function() {
    console.log("this is working");

    var canvas = document.getElementById("screen-canvas"); //get the canvas element
    var gl = canvas.getContext("webgl"); //get the context of the canvas

    //log message if webgl is not supported
    if (!gl) {
        console.log("WebGL not supported, falling back on experimental-webgl");
        gl = canvas.getContext("experimental-webgl");
    }
    if(!gl){
        alert("Your browser does not support WebGL");
    }

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
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

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
    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    //set attribute pointers
    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    var texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
    gl.vertexAttribPointer(
        positionAttribLocation, //attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        texCoordAttribLocation, //attribute location
        2, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
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

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("crate-image"));

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
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
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
    var loop = function() {
        if(reset == true){
            return;
        }
        gl.useProgram(program);
        angle = performance.now() / 1000 / 6 * 1 * Math.PI; //rotate the triangle fully every 6 seconds
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]); //rotate around y-axis
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle/4, [1, 0, 0]); //rotate around x-axis

        glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix); //combine the two rotations
        
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix); //send the matrix to the shader
        //clear the canvas
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        gl.activeTexture(gl.TEXTURE0);
        
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    
    };
    requestAnimationFrame(loop); // good to know that this is not called when the tab looses focus.
};

async function loadTexture(){
    let formData = new FormData();
    formData.append('file', myFile.files[0]);
    await fetch('/upload.php',{method : 'POST', body : formData});
    reset = true;
    restart();
}

function restart(){
    console.log("restart");
    reset = false;
    var canvas = document.getElementById("screen-canvas"); //get the canvas element
    var gl = canvas.getContext("webgl"); //get the context of the canvas

    //log message if webgl is not supported
    if (!gl) {
        console.log("WebGL not supported, falling back on experimental-webgl");
        gl = canvas.getContext("experimental-webgl");
    }
    if(!gl){
        alert("Your browser does not support WebGL");
    }

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
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

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
    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    //set attribute pointers
    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    var texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
    gl.vertexAttribPointer(
        positionAttribLocation, //attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        texCoordAttribLocation, //attribute location
        2, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
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

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("crate-image").src);

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
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
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
    var loop = function() {
        if(reset == true){
            return;
        }
        gl.useProgram(program);
        angle = performance.now() / 1000 / 6 * 1 * Math.PI; //rotate the triangle fully every 6 seconds
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]); //rotate around y-axis
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle/4, [1, 0, 0]); //rotate around x-axis

        glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix); //combine the two rotations
        
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix); //send the matrix to the shader
        //clear the canvas
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        gl.activeTexture(gl.TEXTURE0);
        
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    
    };
    requestAnimationFrame(loop); // good to know that this is not called when the tab looses focus.
}

