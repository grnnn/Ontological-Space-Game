var GameObject = function(x, y, z, scene){

	this.x = x;
	this.y = y;
	this.z = z;

	this.sphere = new THREE.Mesh(
		new THREE.SphereGeometry(20, 20, 20),
		new THREE.MeshPhongMaterial({color: 0xFFFFFF}) );
	this.sphere.position.x = 100;
	this.sphere.position.y = 0;
	this.sphere.position.z = 0;


	this.scene = scene;

	this.scene.add(this.sphere);

}