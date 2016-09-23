var g_scene;

var Sphere = function(x, y, z, r){
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
}

Sphere.prototype = {
    set : function(axis, val){
	if(axis == 0){
	    this.x = val;
	}else if(axis == 1){
	    this.y = val;
	}else if(axis == 2){
	    this.z = val;
	}else if(axis == 3){
	    this.r = val;
	}
    },
    get : function(axis){
	if(axis == 0){
	    return this.x;
	}else if(axis == 1){
	    return this.y;
	}else if(axis == 2){
	    return this.z;
	}else if(axis == 3){
	    return this.r;
	}
    },
    getPosition: function(){
	return [this.x, this.y, this.z];
    },
    getUniformArray: function(){
	return [this.x, this.y, this.z, this.r];
    },
    clone: function(){
	return new Sphere(this.x, this.y, this.z, this.r);
    },
    // dx and dy are distance between preveous mouse position and current mouse position.
    // Move this sphere along the selected axis.
    move: function(dx, dy, axis, prevObject, geometryCanvas){
	var v = geometryCanvas.axisVecOnScreen[axis];
	var lengthOnAxis = v[0] * dx + v[1] * dy;
	var p = calcCoordOnAxis(geometryCanvas.camera,
				geometryCanvas.canvas.width,
				geometryCanvas.canvas.height,
				axis, v, prevObject.getPosition(),
				lengthOnAxis);
	this.set(axis, p[axis]);
    },
    setRadius: function(mx, my, dx, dy, prevObject, geometryCanvas){
	//We assume that prevObject is Sphere.
	var spherePosOnScreen = calcPointOnScreen(prevObject.getPosition(),
						  geometryCanvas.camera,
						  geometryCanvas.canvas.width,
						  geometryCanvas.canvas.height);
	var diffSphereAndPrevMouse = [spherePosOnScreen[0] - geometryCanvas.prevMousePos[0],
				      spherePosOnScreen[1] - geometryCanvas.prevMousePos[1]];
	var r = Math.sqrt(diffSphereAndPrevMouse[0] * diffSphereAndPrevMouse[0] +
			  diffSphereAndPrevMouse[1] * diffSphereAndPrevMouse[1]);
	var diffSphereAndMouse = [spherePosOnScreen[0] - mx,
				  spherePosOnScreen[1] - my];
	var distToMouse = Math.sqrt(diffSphereAndMouse[0] * diffSphereAndMouse[0] +
				    diffSphereAndMouse[1] * diffSphereAndMouse[1]);
	var d = distToMouse - r;
	
	//TODO: calculate tangent sphere
	this.r = prevObject.r + d * 0.01;
    },
    getComponentFromId(id){
	return this;
    }
}

// position [x, y, z] is center of the cube
// scale is distance between center and each side.
var Cube = function(x, y, z, scale){
    this.x = x;
    this.y = y;
    this.z = x;
    this.scale = scale;
}

Cube.prototype = {
    getPosition: function(){
	return [this.x, this.y, this.z];
    },
    clone: function(){
	return new Cube(this.x, this.y, this.z, this.scale);
    },
    setRadius: function(mx, my, dx, dy, prevObject, geometryCanvas){
	//We assume that prevObject is Sphere.
	var spherePosOnScreen = calcPointOnScreen(prevObject.getPosition(),
						  geometryCanvas.camera,
						  geometryCanvas.canvas.width,
						  geometryCanvas.canvas.height);
	var diffSphereAndPrevMouse = [spherePosOnScreen[0] - geometryCanvas.prevMousePos[0],
				      spherePosOnScreen[1] - geometryCanvas.prevMousePos[1]];
	var r = Math.sqrt(diffSphereAndPrevMouse[0] * diffSphereAndPrevMouse[0] +
			  diffSphereAndPrevMouse[1] * diffSphereAndPrevMouse[1]);
	var diffSphereAndMouse = [spherePosOnScreen[0] - mx,
				  spherePosOnScreen[1] - my];
	var distToMouse = Math.sqrt(diffSphereAndMouse[0] * diffSphereAndMouse[0] +
				    diffSphereAndMouse[1] * diffSphereAndMouse[1]);
	var d = distToMouse - r;
	
	//TODO: calculate tangent sphere
	this.scale = prevObject.scale + d * 0.01;
    }
}


var Mandelbox =  function(){
    this.position = [0, 0, 0];
    this.boxScale = 1.; // box: componentId = 0
    this.box = new Cube(0, 0, 0, this.boxScale);
    this.minRadius = 0.5;
    this.minSphere = new Sphere(0, 0, 0, this.minRadius); // min sphere: componentId = 1
    this.minRadius2 = this.minRadius * this.minRadius;
    this.fixedRadius = 1.;
    this.fixedSphere = new Sphere(0, 0, 0, this.fixedRadius); // fixed sphere: componentId = 2;
    this.fixedRadius2 = this.fixedRadius * this.fixedRadius;
    this.scale = 2;
    this.offset = [0, 0, 0];
}

Mandelbox.prototype = {
    getUniformArray: function(){
	return [this.boxScale, this.minRadius, this.fixedRadius, this.scale];
    },
    update: function(){
	this.boxScale = this.box.scale;
	this.minRadius = this.minSphere.r;
	this.minRadius2 = this.minRadius * this.minRadius;
	this.fixedRadius = this.fixedSphere.r;
	this.fixedRadius2 = this.fixedRadius * this.fixedRadius;
    },
    clone: function(){
	var mandelbox = new Mandelbox();
	mandelbox.box = this.box.clone();
	mandelbox.minSphere = this.minSphere.clone();
	mandelbox.fixedSphere = this.fixedSphere.clone();
	mandelbox.scale = this.scale;
	mandelbox.offset = this.offset.slice(0);
	mandelbox.update();
	return mandelbox;
    },
    getComponentFromId: function(id){
	if(id == 0){
	    return this.box;
	}else if(id == 1){
	    return this.minSphere;
	}else if(id == 2){
	    return this.fixedSphere;
	}
    },
    getPosition: function(){
	return this.position;
    },
    getOrbit: function(pos, numIterations){
	var p = pos;
	var p0 = pos;
	var orbit = [];
	for(var i = 0 ; i < numIterations ; i++){
	    if (p[0] > this.boxScale) { p[0] = 2.0*this.boxScale-p[0]; }
	    else if (p[0] < -this.boxScale) { p[0] = -2.0*this.boxScale-p[0]; }
	    
	    if (p[1] > this.boxScale) { p[1] = 2.0*this.boxScale-p[1]; }
	    else if (p[1] < -this.boxScale) { p[1] = -2.0*this.boxScale-p[1]; }
	    
	    if (p[2] > this.boxScale) { p[2] = 2.0*this.boxScale-p[2]; }
	    else if (p[2] < -this.boxScale) { p[2] = -2.0*this.boxScale-p[2]; }

	    var d = dot(p, p);
	    if(d < this.minRadius2){
		p = scale(p, this.fixedRadius2 / this.minRadius2);
	    }else if(d < this.fixedRadius2){
		p = scale(p, this.fixedRadius2 / d);
	    }
	    p = scale(p, this.scale);
	    p = sum(sum(p, p0), this.offset);
	    orbit.push(p);
	}
	console.log(orbit);
	return orbit;
    }
}

var Camera = function(target, fovDegree, eyeDist, up){
    this.target = target;
    this.prevTarget = target;
    this.fovDegree = fovDegree;
    this.eyeDist = eyeDist;
    this.up = up;
    this.theta = 0;
    this.phi = 0;
    this.position;
    this.update();
}

// Camera is on the sphere which its center is target and radius is eyeDist.
// Position is defined by two angle, theta and phi.
Camera.prototype = {    
    update: function(){
	this.position = [this.eyeDist * Math.cos(this.phi) * Math.cos(this.theta),
			 this.eyeDist * Math.sin(this.phi),
			 -this.eyeDist * Math.cos(this.phi) * Math.sin(this.theta)];
	this.position = sum(this.target, this.position);
	if(Math.abs(this.phi) % (2 * Math.PI) > Math.PI / 2. &&
	   Math.abs(this.phi) % (2 * Math.PI) < 3 * Math.PI / 2.){
	    this.up = [0, -1, 0];
	}else{
	    this.up = [0, 1, 0];
	}
    }
}

var RenderCanvas = function(canvasId, templateId){
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.template = nunjucks.compile(document.getElementById(templateId).text);
    this.camera = new Camera([0, 0, 0], 60, 20, [0, 1, 0]);

    this.selectedObjectId = -1;
    this.selectedObjectIndex = -1;
    this.selectedComponentId = -1;

    this.isRendering = false;
    this.isMousePressing = false;
    this.prevMousePos = [0, 0];
    this.selectedAxis = -1;

    this.axisVecOnScreen;
    this.pressingKey = '';
    this.numIterations = 10;

    this.pixelRatio = 1;//window.devicePixelRatio;

    this.sphereCenterOnScreen;
    this.prevObject;
}

RenderCanvas.prototype = {
    resizeCanvas: function(width, height){
	this.canvas.style.width = width + 'px';
	this.canvas.style.height = height + 'px';
	this.canvas.width = width * this.pixelRatio;
	this.canvas.height = height * this.pixelRatio;
    },
    calcPixel: function(mouseEvent){
	var rect = mouseEvent.target.getBoundingClientRect();
	return [(mouseEvent.clientX - rect.left) * this.pixelRatio,
		(mouseEvent.clientY - rect.top) * this.pixelRatio];
    }
};

var Scene = function(){
    this.mandelboxes = [new Mandelbox()];
    this.baseSpheres = [new Sphere(4, 0, 0, 1)];
    this.orbits = [];
    this.maxOrbitLevel = 5;
    for(var i = 0 ; i < this.baseSpheres.length ; i++){
	var p = this.baseSpheres[i].getPosition();
	var orb = Array.prototype.concat.apply([], this.mandelboxes[i].getOrbit(p, this.maxOrbitLevel))
	this.orbits.push(orb);
    }
}

const ID_MANDELBOX = 0;
Scene.prototype = {
    getNumMandelboxes : function(){
	return this.mandelboxes.length;
    },
    getNumBaseSpheres : function(){
	return this.baseSpheres.length;
    },
    getObjects : function(){
	var obj = {};
	obj[ID_MANDELBOX] = this.mandelboxes;
	return obj;
    },
    update : function(){
	for(var i = 0 ; i < this.baseSpheres.length ; i++){
	    var p = this.baseSpheres[i].getPosition();
	    var orb = Array.prototype.concat.apply([], this.mandelboxes[i].getOrbit(p, this.maxOrbitLevel))
	    this.orbits.push(orb);
	}
    }
}

function addMouseListenersToCanvas(renderCanvas){
    var canvas = renderCanvas.canvas;
    var prevTheta, prevPhi;

    canvas.addEventListener("contextmenu", function(e){
	// disable right-click context-menu
        event.preventDefault();
    });

    canvas.addEventListener('mouseup', function(event){
	renderCanvas.isMousePressing = false;
	renderCanvas.isRendering = false;
    });

    canvas.addEventListener('mouseleave', function(event){
	renderCanvas.isMousePressing = false;
	renderCanvas.isRendering = false;
    });

    canvas.addEventListener('mousemove', function(event){
	if(!renderCanvas.isMousePressing) return;
	[px, py] = renderCanvas.calcPixel(event);
	if(event.button == 1){
	    renderCanvas.camera.theta = prevTheta + (renderCanvas.prevMousePos[0] - px) * 0.01;
	    renderCanvas.camera.phi = prevPhi -(renderCanvas.prevMousePos[1] - py) * 0.01;
	    renderCanvas.camera.update();
	    renderCanvas.isRendering = true;
	}else if(event.button == 2){
	    var dx = px - renderCanvas.prevMousePos[0];
	    var dy = py - renderCanvas.prevMousePos[1];
	    var vec = getFocalXYAxisVector(renderCanvas.camera,
					   renderCanvas.canvas.width,
					   renderCanvas.canvas.height);
	    renderCanvas.camera.target = sum(renderCanvas.camera.prevTarget,
					     sum(scale(vec[0], -dx * 5),
						 scale(vec[1], -dy * 5)));
	    renderCanvas.camera.update();
	    renderCanvas.isRendering = true;
	}
    });

    canvas.addEventListener('mousedown', function(event){
	renderCanvas.isMousePressing = true;
	[px, py] = renderCanvas.calcPixel(event);
	renderCanvas.prevMousePos = [px, py];
	if(event.button == 1){
	    event.preventDefault();
	    prevTheta = renderCanvas.camera.theta;
	    prevPhi = renderCanvas.camera.phi;
	}else if(event.button == 2){
	    renderCanvas.camera.prevTarget = renderCanvas.camera.target;
	}
    }, true);

    canvas.addEventListener('mousewheel', function(event){
	event.preventDefault();
	if(event.wheelDelta > 0 && renderCanvas.camera.eyeDist > 1){
	    renderCanvas.camera.eyeDist -= 1;
	}else{
	    renderCanvas.camera.eyeDist += 1;
	}
	renderCanvas.camera.update();
	renderCanvas.render(0);
    }, true);

    [renderCanvas.switch,
     renderCanvas.render] = setupShaderProgram(g_scene,
						 renderCanvas);
    renderCanvas.switch();
    renderCanvas.render(0);
}

function setupShaderProgram(scene, renderCanvas){
    var gl = renderCanvas.gl;
    var program = gl.createProgram();

    var numMandelboxes = scene.getNumMandelboxes();
    var numBaseSpheres = scene.getNumBaseSpheres();
    var shaderStr = renderCanvas.template.render({
	numMandelboxes : numMandelboxes,
	numBaseSpheres : numBaseSpheres,
	maxOrbitLevel : scene.maxOrbitLevel
    });
    attachShaderFromString(gl,
			   shaderStr,
			   program,
			   gl.FRAGMENT_SHADER);
    attachShader(gl, 'vs', program, gl.VERTEX_SHADER);
    program = linkProgram(gl, program);

    var uniLocation = new Array();
    var n = 0;
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_iResolution');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_iGlobalTime');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_selectedObjectId');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_selectedObjectIndex');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_selectedComponentId');
    uniLocation[n++] = gl.getUniformLocation(program,
					     'u_selectedAxis');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_eye');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_up');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_target');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_fov');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_numIterations');

    uniLocation[n++] = gl.getUniformLocation(program, 'u_boxScale');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_minRadius');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_minRadius2');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_fixedRadius');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_fixedRadius2');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_scale');
    uniLocation[n++] = gl.getUniformLocation(program, 'u_offset');

    for(var i = 0 ; i < numMandelboxes ; i++){
	uniLocation[n++] = gl.getUniformLocation(program, 'u_mandelbox'+ i);
    }

    for(var i = 0 ; i < numBaseSpheres ; i++){
	uniLocation[n++] = gl.getUniformLocation(program, 'u_baseSphere'+ i);
	uniLocation[n++] = gl.getUniformLocation(program, 'u_orbit'+ i);
    }
    
    var position = [-1.0, 1.0, 0.0,
                    1.0, 1.0, 0.0,
	            -1.0, -1.0,  0.0,
	            1.0, -1.0, 0.0
                   ];
    var index = [
	0, 2, 1,
	1, 2, 3
    ];
    var vPosition = createVbo(gl, position);
    var vIndex = createIbo(gl, index);
    var vAttLocation = gl.getAttribLocation(program, 'position');
    gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
    gl.enableVertexAttribArray(vAttLocation);
    gl.vertexAttribPointer(vAttLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);

    var switchProgram = function(){
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
        gl.enableVertexAttribArray(vAttLocation);
        gl.vertexAttribPointer(vAttLocation, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);
    }

    var render = function(elapsedTime){
        gl.viewport(0, 0, renderCanvas.canvas.width, renderCanvas.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var uniI = 0;
        gl.uniform2fv(uniLocation[uniI++], [renderCanvas.canvas.width, renderCanvas.canvas.height]);
        gl.uniform1f(uniLocation[uniI++], elapsedTime * 0.001);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectId);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedObjectIndex);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedComponentId);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.selectedAxis);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.position);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.up);
	gl.uniform3fv(uniLocation[uniI++], renderCanvas.camera.target);
	gl.uniform1f(uniLocation[uniI++], renderCanvas.camera.fovDegree);
	gl.uniform1i(uniLocation[uniI++], renderCanvas.numIterations);

	for(var i = 0 ; i < numMandelboxes ; i++){
	    gl.uniform1f(uniLocation[uniI++], scene.mandelboxes[0].boxScale);
	    gl.uniform1f(uniLocation[uniI++], scene.mandelboxes[0].minRadius);
	    gl.uniform1f(uniLocation[uniI++], scene.mandelboxes[0].minRadius2);
	    gl.uniform1f(uniLocation[uniI++], scene.mandelboxes[0].fixedRadius);
	    gl.uniform1f(uniLocation[uniI++], scene.mandelboxes[0].fixedRadius2);
	    gl.uniform1f(uniLocation[uniI++], scene.mandelboxes[0].scale);
	    gl.uniform3fv(uniLocation[uniI++], scene.mandelboxes[0].offset);
	    gl.uniform1fv(uniLocation[uniI++], scene.mandelboxes[0].getUniformArray());
	}

	for(var i = 0 ; i < numBaseSpheres ; i++){
	    var p = scene.baseSpheres[i].getPosition();
	    gl.uniform3fv(uniLocation[uniI++], p);
	    gl.uniform3fv(uniLocation[uniI++], scene.orbits[i]);
	}

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.flush();
    }

    return [switchProgram, render];
}

function updateShaders(geometryCanvas, fractalCanvas){
    [geometryCanvas.switch,
     geometryCanvas.render] = setupShaderProgram(g_scene, geometryCanvas);
    [fractalCanvas.switch,
     fractalCanvas.render] = setupShaderProgram(g_scene, fractalCanvas);
    geometryCanvas.switch();
    fractalCanvas.switch();

    geometryCanvas.render(0);
    fractalCanvas.render(0);
}

window.addEventListener('load', function(event){
    g_scene = new Scene();
    var geometryCanvas = new RenderCanvas('canvas', 'geometryTemplate');
    var fractalCanvas = new RenderCanvas('fractalCanvas', 'fractalTemplate');

    geometryCanvas.resizeCanvas(256, 256);
    fractalCanvas.resizeCanvas(256, 256);
    
    addMouseListenersToCanvas(geometryCanvas);
    addMouseListenersToCanvas(fractalCanvas);
    
    window.addEventListener('keyup', function(event){
	geometryCanvas.pressingKey = '';
	if(geometryCanvas.selectedAxis != -1){
	    geometryCanvas.selectedAxis = -1;
	    geometryCanvas.render(0);
	}
	geometryCanvas.isRendering = false;
	fractalCanvas.isRendering = false;
    });

    geometryCanvas.canvas.addEventListener('mousedown', function(event){
	[px, py] = geometryCanvas.calcPixel(event);
	if(event.button == 0){
	    var objects = g_scene.getObjects();
	    var [objectId,
		 objectIndex,
		 componentId] = getIntersectedObject(geometryCanvas.camera.position,
						     calcRay(geometryCanvas.camera,
							     geometryCanvas.canvas.width,
							     geometryCanvas.canvas.height,
							     [px, py]),
						     objects);
	    geometryCanvas.selectedObjectId = objectId;
	    geometryCanvas.selectedObjectIndex = objectIndex;
	    geometryCanvas.selectedComponentId = componentId;
	    geometryCanvas.render(0);

	    if(objectId == -1) return;
	    var obj = objects[objectId][objectIndex];
	    geometryCanvas.prevObject = obj.clone();
	    geometryCanvas.axisVecOnScreen = calcAxisOnScreen(obj.getComponentFromId(componentId).getPosition(),
							      geometryCanvas.camera,
							      geometryCanvas.canvas.width,
							      geometryCanvas.canvas.height);
	}
    });
    
    geometryCanvas.canvas.addEventListener('mousemove', function(event){
	if(!geometryCanvas.isMousePressing) return;
	var groupId = geometryCanvas.selectedObjectId;
	var index = geometryCanvas.selectedObjectIndex;
	var componentId = geometryCanvas.selectedComponentId;
	if(event.button == 0){
	    var operateObject = g_scene.getObjects()[groupId][index];

	    if(operateObject == undefined) return;
	    [mx, my] = geometryCanvas.calcPixel(event);
	    var dx = mx - geometryCanvas.prevMousePos[0];
	    var dy = my - geometryCanvas.prevMousePos[1];
	    switch (geometryCanvas.pressingKey){
	    case 's':
		operateObject.getComponentFromId(componentId).setRadius(mx, my, dx, dy,
									geometryCanvas.prevObject.getComponentFromId(componentId),
									geometryCanvas);
		operateObject.update();
		geometryCanvas.isRendering = true;
		fractalCanvas.isRendering = true;
		break;
	    }
	}
    });
    geometryCanvas.canvas.addEventListener('mouseup', function(event){
	fractalCanvas.isMousePressing = false;
	fractalCanvas.isRendering = false;
    });
    geometryCanvas.canvas.addEventListener('dblclick', function(event){
	event.preventDefault();
	var groupId = geometryCanvas.selectedObjectId;
	var index = geometryCanvas.selectedObjectIndex;

    });
    window.addEventListener('keydown', function(event){
	geometryCanvas.pressingKey = event.key;
    });
    
    var startTime = new Date().getTime();
    (function(){
        var elapsedTime = new Date().getTime() - startTime;
	if(geometryCanvas.isRendering){
	    geometryCanvas.render(elapsedTime);
	}
	if(fractalCanvas.isRendering){
	    fractalCanvas.render(elapsedTime);
	}
    	requestAnimationFrame(arguments.callee);
    })();
}, false);
