var Main = function(w, h){

	this.width = w;
	this.height = h;

	this.camera = new THREE.PerspectiveCamera(45, w/h, 1, 10000);
	this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	this.scene = new THREE.Scene();


}

Main.prototype.init = function(){
	this.renderer.setSize(this.width, this.height);
	document.body.appendChild(this.renderer.domElement);
	this.renderer.setClearColor(0x222222, 1.0);
	this.renderer.clear();

	this.camera.position.x = 0;
	this.camera.position.y = 0;
	this.camera.position.z = 0;

	this.scene.add(new THREE.AmbientLight(0xeeeeee));

	var g = new GameObject(200, 0, 0, this.scene);

	this.renderer.render(this.scene, this.camera);
}

Main.prototype.update = function(){
	this.camera.lookAt(new THREE.Vector3(100, 0, 0));
	this.renderer.render(this.scene, this.camera);

}