var Main = function(w, h, gameFile){

	this.width = w; //width of screen
	this.height = h; //height of screen
	this.gameFile = gameFile; //file where games are located

	this.camera = new THREE.PerspectiveCamera(45, w/h, 1, 10000);
	this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	this.scene = new THREE.Scene();

	this.gameSquares = []; //array of games meshes
	this.squareHash = {}; //hashing object to tie cubes to parent objects

	this.selected; //selected game element
	this.rightMouseDown; //is right mouse down
	this.rightLocation = new THREE.Vector2(0, 0); //2d vector for right mouse rotation, stores clicked position of right click
	this.hasRightPressed = false; //has right been pressed since selection

	this.gamesLoaded = 0; //tracks loaded games
	this.targetGames = 4; //target for loaded games

	this.mousePos = new THREE.Vector2(0, 0); //2d vector tracking mouse position

	this.xAngle = 0; //track rotation of camera x
	this.yAngle = -Math.PI/2; //track rotation of camera y

	this.raycaster = new THREE.Raycaster(); //raycaster for selecting objects
	this.rayVector = new THREE.Vector3(); //utility vector for raycaster

}

Main.prototype.init = function(){
	this.renderer.setSize(this.width, this.height);
	document.body.appendChild(this.renderer.domElement);
	this.renderer.setClearColor(0x222222, 1.0);
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

	//get a reference to this
	var that = this;


	//set what the camera is looking at
	//we would change this when we are "selected" or not
	this.renderer.render(this.scene, this.camera);

	//context menu and mouse event listenders
	document.addEventListener("contextmenu", function(e){
		e.preventDefault();
	});
	document.addEventListener("mousedown", function(e){
		if(e.which == "1"){
			that.rayVector.set(that.mousePos.x, that.mousePos.y, 0.1).unproject(that.camera);
			that.raycaster.ray.set(that.camera.position, that.rayVector.sub(that.camera.position).normalize() );

			var intersection = that.raycaster.intersectObjects( that.gameSquares )[0];

			if(intersection !== null){
				var gameObj = that.squareHash[JSON.stringify(intersection)];
				that.selected = gameObj;
			}
		}
		if(e.which == "3"){
			that.hasRightPressed = true;
			that.rightLocation.x = e.pageX;
			that.rightLocation.y = e.pageY;
			that.rightMouseDown = true;
		}
	});
	document.addEventListener("mousemove", function(e){
		that.mousePos.x = e.pageX;
		that.mousePos.y = e.pageY;
	});
	document.addEventListener("mouseup", function(e){
		if(e.which == "3"){
		that.rightMouseDown = false;
		}
	});
}

Main.prototype.update = function(){
	if(this.targetGames === this.gamesLoaded){
		//rotate around the selected object on update, only if the right mouse button hasn't been clicked for that object
		if(!this.hasRightPressed){
			this.pushRotateCamera(0.001, 0, this.selected);
		}

		//what to do when mouse right is held down:
		//Get force of angle "push" from difference between current mouse pos and starting mouse pos
		//We cap the movement of it so that, when distance is increased, the rotation doesn't increase dramatically
		if(this.rightMouseDown){
			var xMovement = (this.rightLocation.x - this.mousePos.x)/10000;
			var yMovement = -(this.rightLocation.y - this.mousePos.y)/10000;
			if(xMovement > 0.02) xMovement = 0.02;
			if(xMovement < -0.02) xMovement = -0.02;
			if(yMovement > 0.02) yMovement = 0.02;
			if(yMovement < -0.02) yMovement = -0.02;
			this.pushRotateCamera(xMovement, yMovement, this.selected);
			
		}

		//render on update
		this.renderer.render(this.scene, this.camera);
	}

}

//"push" rotate the camera around a specific position,
// pushX -- x strength of push
// pushY -- y strength of push
// position -- 3d vector of position to rotate around
Main.prototype.pushRotateCamera = function(pushX, pushY, position){

	//apply the push number to the current angles
	this.xAngle += pushX;
	this.yAngle += pushY;

	//check so that we don't rotate behind the object
	if(this.yAngle > -0.001) this.yAngle = -0.001;
	if(this.yAngle < -Math.PI) this.yAngle = -Math.PI;

	//This algorithm was taken from the "OrbitControls.js" package that is included with three.js.
	//Given the new angles of rotation, this is how we calculate the offset coordinates of the camera
	var offSetX = 500*Math.sin(this.xAngle)*Math.sin(this.yAngle);
	var offSetY = 500*Math.cos(this.yAngle);
	var offSetZ = 500*Math.sin(this.yAngle)*Math.cos(this.xAngle);

	//Offset coordinates are simply added to position to get camera coordinates
	this.camera.position.x = position.x + offSetX;
	this.camera.position.y = position.y + offSetY;
	this.camera.position.z = position.z + offSetZ;

	//Make sure the camera is looking at the position
    this.camera.lookAt(new THREE.Vector3(position.x, position.y, position.z));
}

//Read in the json for games and create a bunch of objects for those games
Main.prototype.readGames = function(gameFile){
	var that = this;
	$.getJSON(gameFile, function(data){
		for(var i = 0; i < data.length; i++){
			//set up physical game object
			var myGame = data[i];
			var obj = new GameObject(myGame.x, myGame.y, myGame.z, myGame.gameTitle, myGame.wikipedia, myGame.boxArt, that.scene);

			//add mesh to gameSquares and add mesh to hash
			that.gameSquares.push(obj.cube);
			that.squareHash[JSON.stringify(obj.cube)] = obj;


			//set first obj to selected, temporary
			if( i === 0 ) that.selected = obj;

			//Increment 'gamesLoaded', for update check
			that.gamesLoaded++;
		}
	});
}