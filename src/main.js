var Main = function(w, h, gameFile){
	this.width = w; //width of screen
	this.height = h; //height of screen
	this.gameFile = gameFile; //file where games are located

	this.camera = new THREE.PerspectiveCamera(45, w/h, 1, 10000);
	this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	this.scene = new THREE.Scene();

	this.gameSquares = []; //array of games meshes
	this.squareHash = {}; //hashing object to tie cubes to parent objects

	this.selected; //selected game element
	this.rightMouseDown; //is right mouse down
	this.rightLocation = new THREE.Vector2(0, 0); //2d vector for right mouse rotation, stores clicked position of right click
	this.hasRightPressed = false; //has right been pressed since selection

	this.leftMouseDown;
	this.leftLocation = new THREE.Vector2(0, 0);

	this.selectionLoc = new THREE.Vector2(0, 0);

	this.gamesLoaded = 0; //tracks loaded games
	this.targetGames = 4; //target for loaded games

	this.mousePos = new THREE.Vector2(0, 0); //2d vector tracking mouse position

	this.xAngle = 0; //track rotation of camera x
	this.yAngle = -Math.PI/2; //track rotation of camera y

	this.rayVector = new THREE.Vector3(); //utility vector for raycaster


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
	this.readGames(this.gameFile);
	this.ready = false;

	//get a reference to this
	var that = this;
	//youtube player
	var player;
	var YT = undefined;
	var imageSearch;


	//set what the camera is looking at
	//we would change this when we are "selected" or not
	this.renderer.render(this.scene, this.camera);



	//context menu and mouse event listenders
	document.addEventListener("contextmenu", function(e){
		e.preventDefault();
	});
	document.addEventListener("mousedown", function(e){
		if(e.which == "1"){
			//Keep track of what we're selecting
			that.selectionLoc.x = that.mousePos.x;
			that.selectionLoc.y = that.mousePos.y;

			//keep track of panning
			that.leftMouseDown = true;
			that.leftLocation.x = that.mousePos.x;
			that.leftLocation.y = that.mousePos.y;
		}



		if(e.which == "3"){
			that.hasRightPressed = true;
			that.rightLocation.x = e.pageX;
			that.rightLocation.y = e.pageY;
			that.rightMouseDown = true;
		}
	});
	document.addEventListener("mousemove", function(e){
		that.mousePos.x = e.pageX;
		that.mousePos.y = e.pageY;
	});
	document.addEventListener("mouseup", function(e){
		if(e.which == "1"){
			if(that.mousePos.distanceTo(that.selectionLoc) < 5){
				that.rayVector.set((that.mousePos.x/window.innerWidth) * 2 - 1, -(that.mousePos.y/window.innerHeight) * 2 + 1, 0.5).unproject(that.camera);
				that.rayVector.sub(that.camera.position).normalize();

				var raycaster = new THREE.Raycaster();
				raycaster.ray.set(that.camera.position, that.rayVector);

				var intersections = raycaster.intersectObjects(that.gameSquares);

				if(intersections[0] !== undefined){
					
					$("#unselect").attr("style", "background-color:#222222;position:absolute");
					if(that.squareHash[intersections[0].object.id] !== that.selected){
						if(that.selected != null) that.selected.unSelect();
						that.selected = that.squareHash[intersections[0].object.id];
						that.hasRightPressed = false;
						that.startVector = new THREE.Vector3(that.selected.x + 500, that.selected.y, that.selected.z);
						that.selected.select();
					}
					

				}
			}

			//release panning
			that.leftMouseDown = false;
		}
		if(e.which == "3"){
			that.rightMouseDown = false;
		}
	});
	document.addEventListener("keypress", function(e){
		if(e.which == "115"){
			if(that.selected == null){
				that.pushZoom(-50);
			}
		}
		else if (e.which == "119"){
			
			if(that.selected == null){
				that.pushZoom(50);
			}
		}
		else if (e.which == "106"){
			that.googleApiClientReady();
		}
		else if (e.which == "107"){
			that.openWiki();
		}
		else if (e.which == "108"){
			that.searchImages();
		}
	});

}

Main.prototype.update = function(){
	if(this.targetGames === this.gamesLoaded){

		//rotate around the selected object on update, only if the right mouse button hasn't been clicked for that object
		if(!this.hasRightPressed && this.selected !== null){
			this.pushRotateCamera(0.001, 0, this.selected.position, 500);
		}

		//what to do when mouse right is held down:
		//Get force of angle "push" from difference between current mouse pos and starting mouse pos
		//We cap the movement of it so that, when distance is increased, the rotation doesn't increase dramatically
		if(this.rightMouseDown && this.selected !== null){
			var xMovement = -(this.rightLocation.x - this.mousePos.x)/10000;
			var yMovement = (this.rightLocation.y - this.mousePos.y)/10000;
			if(xMovement > 0.03) xMovement = 0.03;
			if(xMovement < -0.03) xMovement = -0.03;
			if(yMovement > 0.01) yMovement = 0.01;
			if(yMovement < -0.01) yMovement = -0.01;
			this.pushRotateCamera(xMovement, yMovement, this.selected.position, 500);
			
		}

		if(this.leftMouseDown && this.selected == null){
			var xPan = -(this.leftLocation.x - this.mousePos.x)/50;
			var yPan = (this.leftLocation.y - this.mousePos.y)/50;
			if(xPan > 10) xPan = 10;
			if(xPan < -10) xPan = -10;
			if(yPan > 10) yPan = 10;
			if(yPan < -10) yPan = -10;
			this.pushPan(xPan, yPan);
		}

		if(this.rightMouseDown && this.selected == null){

			var xMovement = (this.rightLocation.x - this.mousePos.x)/10000;
			var yMovement = -(this.rightLocation.y - this.mousePos.y)/10000;
			if(xMovement > 0.01) xMovement = 0.01;
			if(xMovement < -0.01) xMovement = -0.01;
			if(yMovement > 0.01) yMovement = 0.01;
			if(yMovement < -0.01) yMovement = -0.01;
			var lookAtVec = new THREE.Vector3(0, 0, -50);
			lookAtVec.applyQuaternion( this.camera.quaternion );
			
			var pof = new THREE.Vector3(lookAtVec.x + this.camera.position.x,
								  lookAtVec.y + this.camera.position.y,
								  lookAtVec.z + this.camera.position.z);

			this.pushRotateCamera(xMovement, yMovement, pof, 50);
			
		}
		
		
			
		

		//render on update
		this.renderer.render(this.scene, this.camera);
	}

}

//"push" rotate the camera around a specific position,
// pushX -- x strength of push
// pushY -- y strength of push
// position -- 3d vector of position to rotate around
Main.prototype.pushRotateCamera = function(pushX, pushY, position, distance){

	//apply the push number to the current angles
	this.xAngle += pushX;
	this.yAngle += pushY;

	//check so that we don't rotate behind the object
	if(this.yAngle > -0.001) this.yAngle = -0.001;
	if(this.yAngle < -Math.PI) this.yAngle = -Math.PI;

	//This algorithm was taken from the "OrbitControls.js" package that is included with three.js.
	//Given the new angles of rotation, this is how we calculate the offset coordinates of the camera
	var offSetX = distance*Math.sin(this.xAngle)*Math.sin(this.yAngle);
	var offSetY = distance*Math.cos(this.yAngle);
	var offSetZ = distance*Math.sin(this.yAngle)*Math.cos(this.xAngle);

	//Offset coordinates are simply added to position to get camera coordinates
	this.camera.position.x = position.x + offSetX;
	this.camera.position.y = position.y + offSetY;
	this.camera.position.z = position.z + offSetZ;

	//Make a call to zoom to change camera
	this.camera.lookAt(position);



}

//Push zoom function, for zooming
Main.prototype.pushZoom = function(push){
	var cameraMovementVec = new THREE.Vector3(0, 0, -push);

	cameraMovementVec.applyQuaternion( this.camera.quaternion );

	var nextPos = new THREE.Vector3(cameraMovementVec.x + this.camera.position.x,
								  cameraMovementVec.y + this.camera.position.y,
								  cameraMovementVec.z + this.camera.position.z);

	this.camera.position.set(nextPos.x, nextPos.y, nextPos.z);

}

//Pan camera function
Main.prototype.pushPan = function(pushX, pushY){
	this.camera.translateX(pushX);
	this.camera.translateY(pushY);
}

//Read in the json for games and create a bunch of objects for those games
Main.prototype.readGames = function(gameFile){
	//First load The textures
	this.texturesLoaded = false;

	var wikiTexLoaded = false;
	var picTexLoaded = false;
	var utubeTexLoaded = false;

	var that = this;

	this.wikiTex = THREE.ImageUtils.loadTexture("media/wiki_logo.png", undefined, function(){
		wikiTexLoaded = true;
		if(wikiTexLoaded && picTexLoaded && utubeTexLoaded){
			that.texturesLoaded = true;
		}
	}, function(){
		alert("Wikipedia Texture failed to load");
	});

	this.utubeTex = THREE.ImageUtils.loadTexture("media/youtube_logo.png", undefined, function(){
		picTexLoaded = true;
		if(wikiTexLoaded && picTexLoaded && utubeTexLoaded){
			that.texturesLoaded = true;
		}
	}, function(){
		alert("Youtube Texture failed to load");
	});

	this.picTex = THREE.ImageUtils.loadTexture("media/Camera_icon.png", undefined, function(){
		utubeTexLoaded = true;
		if(wikiTexLoaded && picTexLoaded && utubeTexLoaded){
			that.texturesLoaded = true;
		}
	}, function(){
		alert("Picture Texture failed to load");
	});

	this.gamesLoaded = false;


	var thingy = $.getJSON(gameFile, function(data){
		console.log("boop 3");
		for(var i = 0; i < data.length; i++){
			//set up physical game object
			var myGame = data[i];

			var obj = new GameObject(myGame.id, myGame.coords[0]*10000, myGame.coords[1]*10000, myGame.coords[2]*10000, myGame.title, myGame["wiki_url"], myGame.platform, myGame.year, that.wikiTex, that.utubeTex, that.picTex, that.scene);

			//set an arbitrary identifier for hashing, make it the wiki link, since that's already unique and garaunteed
			obj.main.id = obj.id;

			//add mesh to gameSquares and add mesh to hash
			that.gameSquares.push(obj.main);
			that.squareHash[obj.main.id] = obj;


			//set first obj to selected, temporary
			if( i === 0 ) {
				that.selected = obj;
				obj.select();
			}

			//Increment 'gamesLoaded', for update check
			//that.gamesLoaded++;
			console.log(myGame.id);
		}
	}).fail(function(){
		console.log("U wot m8");
	});
}

//Listener for deselecting objects
$("#unselect").on("click", function(){
	if(game.selected !== null){
		game.selected.unSelect();
		game.selected = null;
		$(this).attr("style", "display: none;");
	}

});







//ALL YOUTUBE STUFF
function handleAPILoaded(){
	Main.prototype.handleAPILoaded2();

}
Main.prototype.handleAPILoaded2 = function(){
	this.ready = true;
	console.log("Search Done");
}
// Search for a specified string.
function onSearchResponse(response) {
	showResponse(response);
  
}
function showResponse(response) {
    YT = response;

    var page = "http://www.youtube.com/embed/" + YT.items[0].id.videoId;

	var $dialog = $('<div></div>')
               .html('<iframe style="border: 0px; " src="' + page + '" width="100%" height="100%"></iframe>')
               .dialog({
                	title: "Youtube 'Let's Play' Video",
    				autoOpen: false,
    				dialogClass: 'dialog_fixed,ui-widget-header',
    				modal: false,
    				height: 500,
    				width: 800,
    				minWidth: 400,
    				minHeight: 400,
    				draggable:true,
    				close: function () { $(this).remove(); },
               });
    //$dialog.load(page);
	$dialog.dialog('open');

}
Main.prototype.googleApiClientReady = function() {
    gapi.client.setApiKey("AIzaSyCkI9GbnathWCIQBJH-CX3lKftRthDg-4w");
     gapi.client.load('youtube', 'v3', Main.prototype.searchYT);

}
Main.prototype.searchYT = function(){
	var q = "Let's Play " + game.selected.gameTitle;
  	var request = gapi.client.youtube.search.list({
    	q: q,
    	part: 'id',
    	type: "video",
    	safeSearch: "moderate"
  	});

  	request.execute(onSearchResponse);
}






//WIKI STUFF
Main.prototype.openWiki = function(){
	var page = this.selected.wiki;
	var that = this;

	var $dialog2 = $('<div></div>')
               .html('<iframe style="border: 0px; " src="' + page + '" width="100%" height="100%"></iframe>')
               .dialog({
                	title: "Wikipedia Article",
    				autoOpen: false,
    				dialogClass: 'dialog_fixed,ui-widget-header',
    				modal: false,
    				height: 500,
    				width: 800,
    				minWidth: 400,
    				minHeight: 400,
    				draggable:true,
    				close: function () { $(this).remove(); },
               });
    //$dialog.load(page);
	$dialog2.dialog('open');
}



//GOOGLE IMAGES STUFF
Main.prototype.searchImages = function(){

	google.load('search', '1', {"callback":Main.prototype.OnLoad});
}
Main.prototype.OnLoad = function(){
		
        // Create an Image Search instance.
        imageSearch = new google.search.ImageSearch();

        // Set searchComplete as the callback function when a search is 
        // complete.  The imageSearch object will have results in it.
        imageSearch.setSearchCompleteCallback(this, searchComplete, null);


        imageSearch.execute(game.selected.gameTitle);
      

}
function searchComplete(){
	if (imageSearch.results && imageSearch.results.length > 0) {
		var results = imageSearch.results;
		var imagesHTML = "";
        for (var i = 0; i < 5 || i<results.length; i++) {
            // For each result write it's title and image to the screen
            var result = results[i];
            if(result == undefined){}
            else{
            	imagesHTML+="<img style='width:600px; height:auto; margin:0 100' src=' " + result.url + " ' >";
        	}
            
        }
        var $dialog3 = $('<div></div>')
               .html('<iframe style="border: 0px;" width="0px" height="0px"></iframe>')
               .dialog({
                	title: "Google Image Search",
    				autoOpen: false,
    				dialogClass: 'dialog_fixed,ui-widget-header',
    				modal: false,
    				height: 500,
    				width: 800,
    				minWidth: 400,
    				minHeight: 400,
    				draggable:true,
    				close: function () { $(this).remove(); },
               });
        $dialog3.append(imagesHTML);
        $dialog3.dialog('open');
    }
}