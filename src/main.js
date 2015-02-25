var Main = function(w, h, gameFile){
	this.width = w; //width of screen
	this.height = h; //height of screen
	this.gameFile = gameFile; //file where games are located

	this.camera = new THREE.PerspectiveCamera(45, w/h, 1, 100000);
	this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	this.scene = new THREE.Scene();

	this.gameSquares = []; //array of games meshes
	this.squareHash = {}; //hashing object to tie cubes to parent objects

	this.selected; //selected game element
	this.rightMouseDown; //is right mouse down
	this.rightLocation = new THREE.Vector2(0, 0); //2d vector for right mouse rotation, stores clicked position of right click
	this.hasRightPressed = false; //has right been pressed since selection

	this.leftMouseDown;
	this.leftLocation = new THREE.Vector2(0, 0);


	this.leftArrow = false;
	this.rightArrow = false;
	this.upArrow = false;
	this.downArrow = false;

	this.selectionLoc = new THREE.Vector2(0, 0);

	this.gamesLoaded = 0; //tracks loaded games
	this.neighborsLoaded = 0; //tracks neighboring games loaded

	this.mousePos = new THREE.Vector2(0, 0); //2d vector tracking mouse position

	this.xAngle = 0; //track rotation of camera x
	this.yAngle = -Math.PI/2; //track rotation of camera y

	this.rayVector = new THREE.Vector3(); //utility vector for raycaster
	this.loader;


	this.startId = 0; // starting game id

	this.cameraVel = 0;

	this.closedModal = false;
	this.mouseUpCounter = 0;

	this.closePoints; //Point cloud for closest games
	this.showClosest = false;
	this.closeDivs = [];


}

Main.prototype.init = function(){

	var QueryString = function () {
      // This function is anonymous, is executed immediately and
      // the return value is assigned to QueryString!
      var query_string = {};
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
            // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
          query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
          var arr = [ query_string[pair[0]], pair[1] ];
          query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
          query_string[pair[0]].push(pair[1]);
        }
      }
        return query_string;
    } ();

    var path = QueryString.u;
   
    if(path != undefined){
    	path = path.replace("/", "");
    	this.startId = parseInt(path);
    	console.log("Starting at ID: " + this.startId);
    }


	this.renderer.setSize(this.width, this.height);
	document.body.appendChild(this.renderer.domElement);
	this.renderer.setClearColor(0x000000, 1.0);
	this.renderer.clear();

	//mouse button isn't down
	this.rightMouseDown = false;

	//set camera position
	this.camera.position.x = 0;
	this.camera.position.y = 0;
	this.camera.position.z = 0;

	this.scene.add(new THREE.AmbientLight(0xeeeeee));

	//read in games
	this.readGames(this.gameFile);
	this.ready = false;

	//get a reference to this
	var that = this;
	//youtube player
	var player;
	var YT = undefined;
	var imageSearch;


	//set what the camera is looking at
	//we would change this when we are "selected" or not
	this.renderer.render(this.scene, this.camera);




	//context menu and mouse event listenders
	document.addEventListener("contextmenu", function(e){
		e.preventDefault();
	});
	document.addEventListener("mousedown", function(e){
		if(that.closedModal){
			if(e.which == "1"){
				//Keep track of what we're selecting
				that.selectionLoc.x = that.mousePos.x;
				that.selectionLoc.y = that.mousePos.y;

				//keep track of panning
				that.leftMouseDown = true;
				that.leftLocation.x = that.mousePos.x;
				that.leftLocation.y = that.mousePos.y;
			}



			if(e.which == "3"){
				that.hasRightPressed = true;
				that.rightLocation.x = e.pageX;
				that.rightLocation.y = e.pageY;
				that.rightMouseDown = true;
			}
		}
	});
	document.addEventListener("mousemove", function(e){
		that.mousePos.x = e.pageX;
		that.mousePos.y = e.pageY;
	});
	document.addEventListener("mouseup", function(e){
		if(that.closedModal){
			if(e.which == "1"){
				if(that.mousePos.distanceTo(that.selectionLoc) < 5){
					that.rayVector.set((that.mousePos.x/window.innerWidth) * 2 - 1, -(that.mousePos.y/window.innerHeight) * 2 + 1, 0.5).unproject(that.camera);
					that.rayVector.sub(that.camera.position).normalize();

					var raycaster = new THREE.Raycaster();
					raycaster.ray.set(that.camera.position, that.rayVector);

					var intersections = raycaster.intersectObjects(that.gameSquares);

					if(intersections[0] !== undefined){
						
						if(intersections[0].object.funk === "wiki"){
							that.openWiki();
						}
						else if(intersections[0].object.funk === "utube"){
							that.googleApiClientReady();
						}
						else if(intersections[0].object.funk === "pix"){
							that.searchImages();
						}
						else if(intersections[0].object.funk === "gamenet"){
							that.searchGamenet();
						}
						

					}

					raycaster = new THREE.Raycaster();
					raycaster.far = 5000;
					raycaster.params.PointCloud.threshold = 50;
					raycaster.ray.set(that.camera.position, that.rayVector);
					intersections = raycaster.intersectObjects([that.particles]);

					var point = (intersections[0] !== undefined) ? intersections[0] : null;
					if(point !== null){
						$("#unselect").attr("style", "background-color:#000000;position:absolute");
						$("#closest").attr("style", "background-color:#222222; position:absolute; left: 79px;");
						if(that.showClosest){
							that.scene.remove(that.closePoints);
							that.closePoints = undefined;

							that.showClosest = false;
							$("#closest").text("Highlight 5 closest games");

							for(var i = 0; i < that.closeDivs.length; i++){
								that.closeDivs[i].remove();
							}

							that.closeDivs = [];
						}
						var id = that.findGameID(point.point);
						that.selected = that.squareHash[id];
						that.hasRightPressed = false;
						that.startVector = new THREE.Vector3(that.selected.x + 500, that.selected.y, that.selected.z);
						that.q1.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
						that.q2.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
						that.q3.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
						that.q4.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
						that.q1.material.visible = true;
						that.q2.material.visible = true;
						that.q3.material.visible = true;
						that.q4.material.visible = true;
						$("#gameTitleP").html("<b><center>" + that.selected.gameTitle + "<br>" + that.selected.year + "</center></b>");
					}
				}

				//release panning
				that.leftMouseDown = false;
			}
			if(e.which == "3"){
				that.rightMouseDown = false;
			}
		} 
	});
	document.addEventListener("keypress", function(e){
		/*if(that.closedModal){
			if (e.which == "106"){
				that.googleApiClientReady();
			}
			else if (e.which == "107"){
				that.openWiki();
			}
			else if (e.which == "108"){
				that.searchImages();
			}
			else if (e.which == "109"){
				that.searchGamenet();
			}
		}*/
	});

	document.addEventListener("keydown", function(e){
		if(that.closedModal){
			if(e.which == "87"){
				if(that.selected == null){
					that.cameraVel = 50;
				}
			}
			else if (e.which == "83"){
				if(that.selected == null){
					that.cameraVel = -50;
				}
			}

			if(e.which == "16"){
				if(that.cameraVel == 50){
					that.cameraVel = 100;
				} else if(that.cameraVel == -50){
					that.cameraVel = -100;
				}
			}
			if(e.which == "37"){

				that.leftArrow = true;

			}
			if(e.which == "38"){
				that.upArrow = true;
			}
			if(e.which == "39"){
				that.rightArrow = true;
			}
			if(e.which == "40"){
				that.downArrow = true;
			}
		}
	});

	document.addEventListener("keyup", function(e){
		if(that.closedModal){
			if(e.which == "87"){
				if(that.selected == null){
					that.cameraVel = 0;
				}
			}
			else if (e.which == "83"){
				if(that.selected == null){
					that.cameraVel = 0;
				}
			}

			if(e.which == "16"){
				if(that.cameraVel == 100){
					that.cameraVel = 50;
				} else if(that.cameraVel == -100){
					that.cameraVel = -50;
				}
			}
			if(e.which == "37"){
				that.leftArrow = false;
			}
			if(e.which == "38"){
				that.upArrow = false;
			}
			if(e.which == "39"){
				that.rightArrow = false;
			}
			if(e.which == "40"){
				that.downArrow = false;
			}
		}
	});

	document.addEventListener("resize", function(){

		that.camera.aspect = (window.innerWidth/window.innerHeight);
		that.camera.updateProjectionMatrix();

		that.renderer.setSize( window.innerWidth, window.innerHeight);

		that.width = window.innerWidth;
		that.height = window.innerHeight;

	}, false);

}

Main.prototype.update = function(){
	if(this.gamesLoaded > 11000){
		//rotate around the selected object on update, only if the right mouse button hasn't been clicked for that object
		if(!this.hasRightPressed && this.selected !== null){
			this.pushRotateCamera(0.001, 0, this.selected.position, 500);
		}

		//what to do when mouse right is held down:
		//Get force of angle "push" from difference between current mouse pos and starting mouse pos
		//We cap the movement of it so that, when distance is increased, the rotation doesn't increase dramatically
		if(this.rightMouseDown && this.selected !== null){
			var xMovement = -(this.rightLocation.x - this.mousePos.x)/10000;
			var yMovement = (this.rightLocation.y - this.mousePos.y)/10000;
			if(xMovement > 0.03) xMovement = 0.03;
			if(xMovement < -0.03) xMovement = -0.03;
			if(yMovement > 0.01) yMovement = 0.01;
			if(yMovement < -0.01) yMovement = -0.01;
			this.pushRotateCamera(xMovement, yMovement, this.selected.position, 500);
			
		}

		if(this.leftMouseDown && this.selected == null){
			var xPan = -(this.leftLocation.x - this.mousePos.x)/50;
			var yPan = (this.leftLocation.y - this.mousePos.y)/50;
			if(xPan > 10) xPan = 10;
			if(xPan < -10) xPan = -10;
			if(yPan > 10) yPan = 10;
			if(yPan < -10) yPan = -10;
			this.pushPan(xPan, yPan);
		}

		if(this.rightMouseDown && this.selected == null){

			var xMovement = (this.rightLocation.x - this.mousePos.x)/10000;
			var yMovement = -(this.rightLocation.y - this.mousePos.y)/10000;
			if(xMovement > 0.01) xMovement = 0.01;
			if(xMovement < -0.01) xMovement = -0.01;
			if(yMovement > 0.01) yMovement = 0.01;
			if(yMovement < -0.01) yMovement = -0.01;
			var lookAtVec = new THREE.Vector3(0, 0, -50);
			lookAtVec.applyQuaternion( this.camera.quaternion );
			
			var pof = new THREE.Vector3(lookAtVec.x + this.camera.position.x,
								  lookAtVec.y + this.camera.position.y,
								  lookAtVec.z + this.camera.position.z);

			this.pushRotateCamera(xMovement, yMovement, pof, 50);
			

		}




		//Do the same function but for arrows
		//keyboard controls coming soon
		if(this.selected == null && this.leftArrow || this.selected == null && this.rightArrow || this.selected == null && this.upArrow || this.selected == null && this.downArrow){

			var xMovement = 0.0;
			var yMovement = 0.0;
			
			if(this.leftArrow) xMovement = 0.01;
			if(this.rightArrow) xMovement = -0.01;
			if(this.upArrow) yMovement = -0.01;
			if(this.downArrow) yMovement = 0.01;
			var lookAtVec = new THREE.Vector3(0, 0, -50);
			lookAtVec.applyQuaternion( this.camera.quaternion );
			
			var pof = new THREE.Vector3(lookAtVec.x + this.camera.position.x,
								  lookAtVec.y + this.camera.position.y,
								  lookAtVec.z + this.camera.position.z);
			this.pushRotateCamera(xMovement, yMovement, pof, 50);

			
		}






		
		this.cameraUpdate();

		if(this.showClosest) this.renderCloseText();
		
		//render on update
		this.renderer.render(this.scene, this.camera);
	}

}

Main.prototype.renderCloseText = function(){

	var that = this;

	this.camera.updateMatrixWorld();

	function toXYCoords (pos) {
		var newPos = pos.clone()
        var v = newPos.project(that.camera);
        var percX = (v.x + 1) / 2;
        var percY = (-v.y + 1) / 2;
        var left = percX * window.innerWidth;
        var top = percY * window.innerHeight;

        return new THREE.Vector2(left, top);
    }

	for(var i = 0; i < this.closeDivs.length; i++){
		var vert = this.squareHash[this.selected.closest[i]].position;

		var div = this.closeDivs[i];

		var newPos = toXYCoords(vert);

		newPos.x = newPos.x - div.offsetWidth/2;
		newPos.y = newPos.y - 70;

		if(newPos.x  + div.offsetWidth/2 + 50 > window.innerWidth || newPos.x < 0 
			|| newPos.y + div.offsetHeight/2 + 50 > window.innerHeight || newPos.y < 0 || 
			newPos.distanceTo((new THREE.Vector2(window.innerWidth/2, window.innerHeight/2))) < 150 ){
			div.style.display = "none";
		} else {
			div.style.display = "";
		}

		div.style.left = newPos.x + "px";
		div.style.top = newPos.y + "px";
	}
}

Main.prototype.cameraUpdate = function(){
	var cameraMovementVec = new THREE.Vector3(0, 0, -this.cameraVel);

	cameraMovementVec.applyQuaternion( this.camera.quaternion );

	var nextPos = new THREE.Vector3(cameraMovementVec.x + this.camera.position.x,
								  cameraMovementVec.y + this.camera.position.y,
								  cameraMovementVec.z + this.camera.position.z);

	this.camera.position.set(nextPos.x, nextPos.y, nextPos.z);
}


//"push" rotate the camera around a specific position,
// pushX -- x strength of push
// pushY -- y strength of push
// position -- 3d vector of position to rotate around
Main.prototype.pushRotateCamera = function(pushX, pushY, position, distance){

	//apply the push number to the current angles
	this.xAngle += pushX;
	this.yAngle += pushY;
	console.log(pushX);


	//check so that we don't rotate behind the object
	if(this.yAngle > -0.001) this.yAngle = -0.001;
	if(this.yAngle < -Math.PI) this.yAngle = -Math.PI;

	//This algorithm was taken from the "OrbitControls.js" package that is included with three.js.
	//Given the new angles of rotation, this is how we calculate the offset coordinates of the camera
	var offSetX = distance*Math.sin(this.xAngle)*Math.sin(this.yAngle);
	var offSetY = distance*Math.cos(this.yAngle);
	var offSetZ = distance*Math.sin(this.yAngle)*Math.cos(this.xAngle);


	//Offset coordinates are simply added to position to get camera coordinates
	this.camera.position.x = position.x + offSetX;
	this.camera.position.y = position.y + offSetY;
	this.camera.position.z = position.z + offSetZ;


	//Make a call to zoom to change camera
	this.camera.lookAt(position);



}

//Push zoom function, for zooming
Main.prototype.pushZoom = function(push){
	var cameraMovementVec = new THREE.Vector3(0, 0, -push);

	cameraMovementVec.applyQuaternion( this.camera.quaternion );

	var nextPos = new THREE.Vector3(cameraMovementVec.x + this.camera.position.x,
								  cameraMovementVec.y + this.camera.position.y,
								  cameraMovementVec.z + this.camera.position.z);

	this.camera.position.set(nextPos.x, nextPos.y, nextPos.z);

}

//Pan camera function
Main.prototype.pushPan = function(pushX, pushY){
	this.camera.translateX(pushX);
	this.camera.translateY(pushY);
}

//Find game, given a vector of its position
Main.prototype.findGameID = function(v){

	var games = this.particles.geometry.vertices;
	for(var i = 0; i < games.length; i++){
		var g = games[i];

		if(g.distanceTo(v) < 50){
			return g.id;
		}
	}
	alert("game not found");
	return -1;


}


//Read in the json for games and create a bunch of objects for those games
Main.prototype.readGames = function(gameFile){


	$('#myModal').modal({backdrop: "static", keyboard: false});



	//First load The textures
	this.texturesLoaded = false;

	var wikiTexLoaded = false;
	var picTexLoaded = false;
	var utubeTexLoaded = false;
	var gNetLoaded = false;

	var that = this;

	this.wikiTex = THREE.ImageUtils.loadTexture("media/wiki_logo.png", undefined, function(){
		wikiTexLoaded = true;
		if(wikiTexLoaded && picTexLoaded && utubeTexLoaded && gNetLoaded){
			that.texturesLoaded = true;
		}
	}, function(){
		alert("Wikipedia Texture failed to load");
	});

	this.utubeTex = THREE.ImageUtils.loadTexture("media/youtube_logo.png", undefined, function(){
		picTexLoaded = true;
		if(wikiTexLoaded && picTexLoaded && utubeTexLoaded && gNetLoaded){
			that.texturesLoaded = true;
		}
	}, function(){
		alert("Youtube Texture failed to load");
	});

	this.picTex = THREE.ImageUtils.loadTexture("media/Camera_icon.png", undefined, function(){
		utubeTexLoaded = true;
		if(wikiTexLoaded && picTexLoaded && utubeTexLoaded && gNetLoaded){
			that.texturesLoaded = true;
		}
	}, function(){
		alert("Picture Texture failed to load");
	});

	this.gNetTex = THREE.ImageUtils.loadTexture("media/gameNet-logo.png", undefined, function(){
		gNetLoaded = true;
		if(wikiTexLoaded && picTexLoaded && utubeTexLoaded && gNetLoaded){
			that.texturesLoaded = true;
		}
	}, function(){
		alert("Gamenet Texture failed to load");
	});

	this.circleSprite = THREE.ImageUtils.loadTexture("media/sphere.png", undefined, function(){
		console.log("sphere texture loaded")
	}, function(){
		alert("Sphere texture failed to load");
	});


	//Set up quarter meshes
	this.q1 = new THREE.Mesh(
		new THREE.SphereGeometry(53, 7, 7, 0, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: this.wikiTex } ) );
	this.q2 = new THREE.Mesh(
		new THREE.SphereGeometry(53, 7, 7, Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: this.utubeTex } ) );
	this.q3 = new THREE.Mesh(
		new THREE.SphereGeometry(53, 7, 7, Math.PI, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: this.picTex } ) );
	this.q4 = new THREE.Mesh(
		new THREE.SphereGeometry(53, 7, 7, 3*Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( {map: this.gNetTex} ) );

	this.scene.add(this.q1);
	this.scene.add(this.q2);
	this.scene.add(this.q3);
	this.scene.add(this.q4);

	this.q1.funk = "wiki";
	this.q2.funk = "utube";
	this.q3.funk = "pix";
	this.q4.funk = "gamenet";

	this.gameSquares.push(this.q1);
	this.gameSquares.push(this.q2);
	this.gameSquares.push(this.q3);
	this.gameSquares.push(this.q4);

	this.cloudMaterial = new THREE.PointCloudMaterial( {size: 250, map: this.circleSprite, transparent: true, blending: THREE.AdditiveBlending,  depthWrite: false});

	this.points = new THREE.Geometry();

	function load(data){


		for(var i = 0; i < data.length; i++){
			//set up physical game object
			var myGame = data[i];

			var obj = new GameObject(myGame.id, myGame.coords[0]*60000, myGame.coords[1]*60000, myGame.coords[2]*60000, myGame.title, myGame["wiki_url"], myGame.platform, myGame.year);

			var vert = new THREE.Vector3(myGame.coords[0]*60000, myGame.coords[1]*60000, myGame.coords[2]*60000);
			vert.id = obj.id;
			that.squareHash[obj.id] = obj;

			that.points.vertices.push(vert);


			//set first obj to selected
			if(obj.id == that.startId){
				that.selected = obj;
				that.q1.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
				that.q2.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
				that.q3.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
				that.q4.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
				$("#gameTitleP").html("<b><center>" + that.selected.gameTitle + "<br>" + that.selected.year + "</center></b>");
			}
			

			that.gamesLoaded++;
			var $loadBar = $("#loadingProgress");
			//console.log(Math.floor(that.gamesLoaded/120));
			$loadBar.css('width', Math.floor(that.gamesLoaded/236) + "%");
			$loadBar.attr("aria-valuenow", Math.floor(that.gamesLoaded/236));
			$loadBar.html(Math.floor(that.gamesLoaded/236) + "%");
			//var s ='<center><i style="text-size: 64;"><b>Loading in Games</b></i><br><br>' + that.gamesLoaded +'/11829</center>'
			//$loading.html(s);
		}
		console.log("Loaded " + that.gamesLoaded + " games");
		
	}

	$.getJSON(gameFile, load).fail(function(){
		console.log("JSON loading failed");
	});

	$.getJSON("res/games2.json", load).fail(function(){
		console.log("JSON loading failed");
	});

	$.getJSON("res/games3.json", load).fail(function(){
		console.log("JSON loading failed");
	});

	function asyncLoad1(){
		if(that.gamesLoaded >= 3000){
			$.getJSON("res/games4.json", load).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/games5.json", load).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/games6.json", load).fail(function(){
				console.log("JSON loading failed");
			});
		} else {
			window.setTimeout(asyncLoad1, 1000);
		}
	}

	function asyncLoad2(){
		if(that.gamesLoaded >= 6000){
			$.getJSON("res/games7.json", load).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/games8.json", load).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/games9.json", load).fail(function(){
				console.log("JSON loading failed");
			});
		} else {
			window.setTimeout(asyncLoad2, 1000);
		}
	}

	function asyncLoad3(){
		if(that.gamesLoaded >= 9000){
			$.getJSON("res/games10.json", load).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/games11.json", load).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/games12.json", load).fail(function(){
				console.log("JSON loading failed");
			});

			that.particles = new THREE.PointCloud(that.points, that.cloudMaterial);
			that.scene.add(that.particles);
		} else {
			window.setTimeout(asyncLoad3, 1000);
		}
	}

	asyncLoad1();
	asyncLoad2();
	asyncLoad3();	


	function loadNeighbors(data){

		for(var i = 0; i < data.length; i++){
			var game = data[i];

			that.squareHash[game.id].setClosest(game.closest);
			that.neighborsLoaded++;

			var $loadBar = $("#loadingProgress");
			$loadBar.css('width', 50 + Math.floor(that.neighborsLoaded/236) + "%");
			$loadBar.attr("aria-valuenow", 50 + Math.floor(that.neighborsLoaded/236));
			$loadBar.html(50 + Math.floor(that.neighborsLoaded/236) + "%");
		}

		if(that.gamesLoaded == 11829 && that.neighborsLoaded == 11829){
			$("#gLaunch").removeAttr("disabled");
		}
	}

	function asyncLoad4(){
		if(that.gamesLoaded >= 11000){
			$.getJSON("res/neighbors/gameneighbors1.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/neighbors/gameneighbors2.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/neighbors/gameneighbors3.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});
			
		} else {
			window.setTimeout(asyncLoad4, 1000);
		}
	}

	function asyncLoad5(){
		if(that.gamesLoaded >= 11000 && that.neighborsLoaded >= 3000){
			$.getJSON("res/neighbors/gameneighbors4.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/neighbors/gameneighbors5.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/neighbors/gameneighbors6.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});
			
		} else {
			window.setTimeout(asyncLoad5, 1000);
		}
	}

	function asyncLoad6(){
		if(that.gamesLoaded >= 11000 && that.neighborsLoaded >= 6000){
			$.getJSON("res/neighbors/gameneighbors7.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/neighbors/gameneighbors8.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/neighbors/gameneighbors9.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});
			
		} else {
			window.setTimeout(asyncLoad6, 1000);
		}
	}

	function asyncLoad7(){
		if(that.gamesLoaded >= 11000 && that.neighborsLoaded >= 9000){
			$.getJSON("res/neighbors/gameneighbors10.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/neighbors/gameneighbors11.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});

			$.getJSON("res/neighbors/gameneighbors12.json", loadNeighbors).fail(function(){
				console.log("JSON loading failed");
			});
			
		} else {
			window.setTimeout(asyncLoad7, 1000);
		}
	}

	asyncLoad4();
	asyncLoad5();
	asyncLoad6();
	asyncLoad7();

	$("#closest").on("click", function(){
		if($(this).text() === "Highlight 5 closest games"){
			var newCloudMaterial = new THREE.PointCloudMaterial( {size: 350, map: that.circleSprite, transparent: true, blending: THREE.AdditiveBlending,  depthWrite: false, color: 0xff0000});

			var newGeometry = new THREE.Geometry();

			for(var i = 0; i < that.selected.closest.length; i++){
				var obj = that.squareHash[ that.selected.closest[i] ];
				var vert = obj.position;
				newGeometry.vertices.push(vert.clone());

				var text = document.createElement('div');
				text.style.position = 'absolute';

				text.innerHTML = "<b style='color: #ff0000;'><center>" + obj.gameTitle + "<br>" + obj.year + "</center></b>"

				document.body.appendChild(text);
				that.closeDivs.push(text);

			}

			that.closePoints = new THREE.PointCloud(newGeometry, newCloudMaterial);
			that.scene.add(that.closePoints);

			that.showClosest = true;
			$(this).text("Hide 5 closest games");

		} else {

			that.scene.remove(that.closePoints);
			that.closePoints = undefined;

			for(var i = 0; i < that.closeDivs.length; i++){
				that.closeDivs[i].remove();
			}

			that.closeDivs = [];

			that.showClosest = false;
			$(this).text("Highlight 5 closest games");
		}
	});

	$("#gLaunch").on("click", function(){
		that.closedModal = true;
	});

}

//Listener for deselecting objects
$("#unselect").on("click", function(){
	if(game.selected !== null){
		game.q1.material.visible = false;
		game.q2.material.visible = false;
		game.q3.material.visible = false;
		game.q4.material.visible = false;
		game.selected = null;
		$(this).attr("style", "display: none;");
		$("#gameTitleP").text(" ");
		$("#closest").attr("style", "display: none;");
		if(game.showClosest){
			game.scene.remove(game.closePoints);
			game.closePoints = undefined;

			for(var i = 0; i < game.closeDivs.length; i++){
				game.closeDivs[i].remove();
			}

			game.closeDivs = [];

			game.showClosest = false;
			$("#closest").text("Highlight 5 closest games");
		}
	}

});









//ALL YOUTUBE STUFF
function handleAPILoaded(){
	Main.prototype.handleAPILoaded2();

}
function callProgress(step){
	if(step == 1){
		$("#progressbar").fadeOut(4000);
		$("#progressbar").fadeIn(4000);
	}
	$("#progressbar").progressbar({
		value: step
	});
}

Main.prototype.handleAPILoaded2 = function(){
	this.ready = true;
	console.log("Search Done");
}
// Search for a specified string.
function onSearchResponse(response) {
	showResponse(response);
  
}
function showResponse(response) {
    YT = response;

    if(YT.items.length > 0){

	    var page = "http://www.youtube.com/embed/" + YT.items[0].id.videoId;

		var $dialog = $('<div></div>')
	               .html('<iframe style="border: 0px; " src="' + page + '" width="100%" height="100%"></iframe>')
	               .dialog({
	                	title: "Youtube 'Let's Play' Video",
	    				autoOpen: false,
	    				dialogClass: 'dialog_fixed,ui-widget-header',
	    				modal: false,
	    				height: 500,
	    				width: 800,
	    				minWidth: 400,
	    				minHeight: 250,
	    				maxWidth: 1280,
	    				maxHeight: 720,
	    				resizable:true,
	    				draggable:true,
	    				close: function () { $(this).remove(); },
	               });
	    //$dialog.load(page);
	    //$(".ui-dialog-titlebar-close").append("x");;
	    $(".ui-dialog-titlebar-close").attr("style", "background-color:red; ");
		$dialog.dialog('open');
	}else{
		alert("No Youtube Videos Found For This Game");
	}


}
Main.prototype.googleApiClientReady = function() {
    gapi.client.setApiKey("AIzaSyCkI9GbnathWCIQBJH-CX3lKftRthDg-4w");
     gapi.client.load('youtube', 'v3', Main.prototype.searchYT);

}
Main.prototype.searchYT = function(){
	var q = "Let's Play " + game.selected.gameTitle + " " +game.selected.platform;
  	var request = gapi.client.youtube.search.list({
    	q: q,
    	part: 'id',
    	type: "video",
    	safeSearch: "moderate"
  	});

  	request.execute(onSearchResponse);
}



Main.prototype.searchGamenet = function(){
	var id = this.selected.id;
	var that = this;

	var $dialog4 = $('<div></div>')
               .html('<iframe style="border: 0px; " src="http://gamecip-projects.soe.ucsc.edu/gamenet/games/' + id + '" width="100%" height="100%"></iframe>')
               .dialog({
                	title: "Gamenet Page",
    				autoOpen: false,
    				dialogClass: 'dialog_fixed,ui-widget-header',
    				modal: false,
    				height: 500,
    				width: 800,
    				minWidth: 400,
    				minHeight: 250,
    				maxWidth: 1280,
    				maxHeight: 720,
    				resizable:true,
    				draggable:true,
    				close: function () { $(this).remove(); },
               });
    //$dialog.load(page);
    $(".ui-dialog-titlebar-close").attr("style", "background-color:red;");
	$dialog4.dialog('open');
}
Main.prototype.findGame = function(id){
	$("#unselect").attr("style", "background-color:#000000;position:absolute");
	var id = id;
	var that = this;
	that.selected = that.squareHash[id];
	that.hasRightPressed = false;
	that.startVector = new THREE.Vector3(that.selected.x + 500, that.selected.y, that.selected.z);
	that.q1.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
	that.q2.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
	that.q3.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
	that.q4.position.set(that.selected.position.x, that.selected.position.y, that.selected.position.z);
	that.q1.material.visible = true;
	that.q2.material.visible = true;
	that.q3.material.visible = true;
	that.q4.material.visible = true;
	$("#gameTitleP").html("<b><center>" + that.selected.gameTitle + "<br>" + that.selected.year + "</center></b>");
}






//WIKI STUFF
Main.prototype.openWiki = function(){
	var page = this.selected.wiki;
	var that = this;

	var $dialog2 = $('<div></div>')
               .html('<iframe style="border: 0px; " src="' + page + '" width="100%" height="100%"></iframe>')
               .dialog({
                	title: "Wikipedia Article",
    				autoOpen: false,
    				dialogClass: 'dialog_fixed,ui-widget-header',
    				modal: false,
    				height: 500,
    				width: 800,
    				minWidth: 400,
    				minHeight: 250,
    				maxWidth: 1280,
    				maxHeight: 720,
    				resizable:true,
    				draggable:true,
    				close: function () { $(this).remove(); },
               });
    //$dialog.load(page);
    $(".ui-dialog-titlebar-close").attr("style", "background-color:red;");
	$dialog2.dialog('open');
}



//GOOGLE IMAGES STUFF
Main.prototype.searchImages = function(){

	google.load('search', '1', {"callback":Main.prototype.OnLoad});
}
Main.prototype.OnLoad = function(){
		
        // Create an Image Search instance.
        imageSearch = new google.search.ImageSearch();

        // Set searchComplete as the callback function when a search is 
        // complete.  The imageSearch object will have results in it.
        imageSearch.setSearchCompleteCallback(this, searchComplete, null);


        imageSearch.execute(game.selected.gameTitle + " " + game.selected.platform);
      

}
function searchComplete(){
	if (imageSearch.results && imageSearch.results.length > 0) {
		var results = imageSearch.results;
		var imagesHTML = "";
        for (var i = 0; i < 5 || i<results.length; i++) {
            // For each result write it's title and image to the screen
            var result = results[i];
            if(result == null){}
            else{
            	imagesHTML+="<img style='width:600px; height:auto; margin:0 100' src=' " + result.url + " ' >";
        	}
            
        }
        var $dialog3 = $('<div></div>')
               .html('<iframe style="border: 0px;" width="0px" height="0px"></iframe>')
               .dialog({
                	title: "Google Image Search",
    				autoOpen: false,
    				dialogClass: 'dialog_fixed,ui-widget-header',
    				modal: false,
    				height: 500,
    				width: 800,
    				minWidth: 400,
    				minHeight: 250,
    				maxWidth: 1280,
    				maxHeight: 720,
    				resizable:true,
    				draggable:true,
    				close: function () { $(this).remove(); },
               });
        $dialog3.append(imagesHTML);
        $(".ui-dialog-titlebar-close").attr("style", "background-color:red; ");
        $dialog3.dialog('open');
    }
}