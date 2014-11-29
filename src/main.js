var Main = function(w, h){

	this.width = w;
	this.height = h;

	this.camera = new THREE.PerspectiveCamera(45, w/h, 1, 10000);
	this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	this.scene = new THREE.Scene();

	this.selected; //selected game element
	this.rightMouseDown; //is right mouse down

	this.gamesLoaded = 0; //tracks loaded games
	this.targetGames = 4; //target for loaded games

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
	this.readGames();

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
		if(e.which == "3"){
		that.rightMouseDown = true;
		}
	});
	document.addEventListener("mouseup", function(e){
		if(e.which == "3"){
		that.rightMouseDown = false;
		}
	});
}

Main.prototype.update = function(){
	if(this.targetGames === this.gamesLoaded){
		//rotate around the selected object on update
		this.rotateCamera();
		this.camera.lookAt(new THREE.Vector3(this.selected.x, this.selected.y, this.selected.z));

		//render on update
		this.renderer.render(this.scene, this.camera);

		//what to do when mouse right is held down
		if(this.rightMouseDown){
			//placeholder functionality, needs to rotate around object based on mouse movements
			this.camera.position.x -= 5;
		}
	}

}

Main.prototype.rotateCamera = function(){
	var time = (new Date()).getTime();
    var angle = 0.01 * time * 2 * Math.PI / 1000;

    this.camera.position.x = this.selected.x + Math.cos(angle)*500;
    this.camera.position.z = this.selected.z + Math.sin(angle)*500;
    this.lastTime = time;
}

Main.prototype.readGames = function(){
	var that = this;
	$.getJSON("res/games.json", function(data){
		for(var i = 0; i < data.length; i++){
			//set up physical game object
			var myGame = data[i];
			var obj = new GameObject(myGame.x, myGame.y, myGame.z, myGame.gameTitle, myGame.wikipedia, myGame.boxArt, that.scene);

			//set first obj to selected
			if( i === 0 ) that.selected = obj;

			//Increment global 'gamesLoaded'
			that.gamesLoaded++;
		}
	});
}