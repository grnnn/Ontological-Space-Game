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
		new THREE.SphereGeometry(50, 10, 10, 0, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: wikiTex, visible: false } ) );
	this.q2 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 10, 10, Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: utubeTex, visible: false } ) );
	this.q3 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 10, 10, Math.PI, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( { map: picTex, visible: false } ) );
	this.q4 = new THREE.Mesh(
		new THREE.SphereGeometry(50, 10, 10, 3*Math.PI/2, Math.PI/2, 0, Math.PI),
		new THREE.MeshPhongMaterial( {color: 0xffffff, visible: false} ) );

	var that = this; 

	this.main = new THREE.Mesh(
		new THREE.SphereGeometry(50, 10, 10),
		new THREE.MeshPhongMaterial( {  color: 0xffffff } ) );

	/*this.image.onload = function(){
		
		that.cube.scale.x = this.width/10;
		that.cube.scale.y = this.height/10;

		

	}*/

	that.q1.position.x = x;
	that.q1.position.y = y;
	that.q1.position.z = z;
	that.q2.position.x = x;
	that.q2.position.y = y;
	that.q2.position.z = z;
	that.q3.position.x = x;
	that.q3.position.y = y;
	that.q3.position.z = z;
	that.q4.position.x = x;
	that.q4.position.y = y;
	that.q4.position.z = z;

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