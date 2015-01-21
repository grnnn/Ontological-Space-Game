var GameObject = function(id, x, y, z, title, wiki, platform, year, wikiTex, utubeTex, picTex, scene){

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

	this.q1 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 7, 7, 0, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: wikiTex, visible: false } ) );
	this.q2 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 7, 7, Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: utubeTex, visible: false } ) );
	this.q3 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 7, 7, Math.PI, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: picTex, visible: false } ) );
	this.q4 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 7, 7, 3*Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( {color: 0xffffff, visible: false} ) );


	/*this.q1 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 5, 5, 0, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { color: 0xffffff, visible: false } ) );
	this.q2 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 5, 5, Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { color: 0xffffff, visible: false } ) );
	this.q3 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 5, 5, Math.PI, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { color: 0xffffff, visible: false } ) );
	this.q4 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 5, 5, 3*Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( {color: 0xffffff, visible: false} ) );*/

	var that = this; 

	this.main = new THREE.Mesh(
		new THREE.SphereGeometry(50, 5, 5),
		new THREE.MeshPhongMaterial( {  color: 0xffffff } ) );


	that.q1.position.set(x, y, z);
	that.q2.position.set(x, y, z);
	that.q3.position.set(x, y, z);
	that.q4.position.set(x, y, z);

	that.main.position.set(x, y, z);

	that.scene.add(that.q1);
	that.scene.add(that.q2);
	that.scene.add(that.q3);
	that.scene.add(that.q4);

	that.scene.add(that.main);

	
}

GameObject.prototype.select = function(){
	this.main.material.visible = false;

	this.q1.material.visible = true;
	this.q2.material.visible = true;
	this.q3.material.visible = true;
	this.q4.material.visible = true;
}

GameObject.prototype.unSelect = function(){
	this.main.material.visible = true;

	this.q1.material.visible = false;
	this.q2.material.visible = false;
	this.q3.material.visible = false;
	this.q4.material.visible = false;
}