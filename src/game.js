var GameObject = function(id, x, y, z, title, wiki, platform, year){

	this.position = new THREE.Vector3(x, y, z);


	this.id = id;
	this.platform = platform;
	this.year = year;

	this.gameTitle = title;
	this.wiki = wiki;

	this.closest = [];
	
}

GameObject.prototype.setClosest = function(closest){
	this.closest = closest;
}