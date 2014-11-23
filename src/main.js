var Main = function(w, h){

	this.width = w;
	this.height = h;

	this.camera = new THREE.PerspectiveCamera(45, w/h, 1, 10000);
	this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	this.scene = new THREE.Scene();

	this.selected; //selected game element
	this.rightMouseDown; //is right mouse down

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

	//create the game object
	var g = new GameObject(500, 0, 0, "http://upload.wikimedia.org/wikipedia/en/thumb/4/42/Supersmashbox.jpg/250px-Supersmashbox.jpg", this.scene);

	//get a reference to this
	var that = this;

	//set selected object, only like this for testing
	this.selected = g;

	//set what the camera is looking at
	//we would change this when we are "selected" or not
	this.camera.lookAt(new THREE.Vector3(this.selected.x, this.selected.y, this.selected.z));
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
	//rotate the selected object on update
	this.selected.rotate();

	//render on update
	this.renderer.render(this.scene, this.camera);

	//what to do when mouse right is held down
	if(this.rightMouseDown){
		//placeholder functionality, needs to rotate around object based on mouse movements
		this.camera.position.x -= 5;
	}

}
