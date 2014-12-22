var GameObject = function(x, y, z, title, wiki, pictureURL, scene){

	this.x = x;
	this.y = y;
	this.z = z;

	this.gameTitle = title;
	this.wiki = wiki;

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

	
}
