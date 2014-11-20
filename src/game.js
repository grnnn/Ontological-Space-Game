var GameObject = function(x, y, z, pictureURL, scene){

	this.x = x;
	this.y = y;
	this.z = z;

	this.image = new Image();
	this.image.src = pictureURL;


	var material = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture(pictureURL)});
	var blankMaterial =  new THREE.MeshPhongMaterial({ color: 0xeeeeee });
	var meshFaces = new THREE.MeshFaceMaterial( [blankMaterial, blankMaterial , blankMaterial, blankMaterial, material, material] );

	this.scene = scene;

	this.cube = new THREE.Mesh(
		new THREE.BoxGeometry(10, 10, 20),
		meshFaces );

	var that = this; 

	this.image.onload = function(){
		
		that.cube.scale.x = this.width/10;
		that.cube.scale.y = this.height/10;

		that.cube.position.x = x;
		that.cube.position.y = y;
		that.cube.position.z = z;

		that.scene.add(that.cube);

	}

	this.lastTime = (new Date()).getTime();

	
}

GameObject.prototype.rotate = function() {
	 // update
        var time = (new Date()).getTime();
        var timeDiff = time - this.lastTime;
        var angleChange = 0.1 * timeDiff * 2 * Math.PI / 1000;
        this.cube.rotation.y += angleChange;
        this.lastTime = time;
}