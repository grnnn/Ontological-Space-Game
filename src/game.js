var GameObject = function(id, x, y, z, title, wiki, platform, year, scene){

	this.position = new THREE.Vector3(x, y, z);


	this.id = id;
	this.platform = platform;
	this.year = year;

	this.gameTitle = title;
	this.wiki = wiki;

	/*this.image = new Image();
	this.image.src = pictureURL;

	var material = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture(pictureURL)});
	var blankMaterial =  new THREE.MeshPhongMaterial({ color: 0xeeeeee });
	var meshFaces = new THREE.MeshFaceMaterial( [blankMaterial, blankMaterial , blankMaterial, blankMaterial, material, material] );
	*/
	this.scene = scene;

	this.main = new THREE.Mesh(
		new THREE.SphereGeometry(50, 5, 5),
		new THREE.MeshPhongMaterial( {  color: 0xffffff } ) );


	this.main.position.set(x, y, z);

	this.scene.add(this.main);

	
}

GameObject.prototype.select = function(wikiTex, utubeTex, picTex){
	this.main.material.visible = false;

	this.q1 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 7, 7, 0, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: wikiTex } ) );
	this.q2 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 7, 7, Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: utubeTex } ) );
	this.q3 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 7, 7, Math.PI, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: picTex } ) );
	this.q4 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 7, 7, 3*Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( {color: 0xffffff} ) );

	this.q1.position.set(this.position.x, this.position.y, this.position.z);
	this.q2.position.set(this.position.x, this.position.y, this.position.z);
	this.q3.position.set(this.position.x, this.position.y, this.position.z);
	this.q4.position.set(this.position.x, this.position.y, this.position.z);

	this.scene.add(this.q1);
	this.scene.add(this.q2);
	this.scene.add(this.q3);
	this.scene.add(this.q4);
}

GameObject.prototype.unSelect = function(){
	this.main.material.visible = true;

	this.scene.remove(this.q1);
	this.scene.remove(this.q2);
	this.scene.remove(this.q3);
	this.scene.remove(this.q4);

	this.q1 = null;
	this.q2 = null;
	this.q3 = null;
	this.q4 = null;
}