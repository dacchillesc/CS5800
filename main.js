window.addEventListener("load", level, false);
function level(){
	var levelFile = "level1.json";
	var gameCanvas = document.getElementById('gameCanvas');
	var context = gameCanvas.getContext("2d");
	var width = gameCanvas.width;
	var hight = gameCanvas.height;
	var mid = width/5;
	var hStartX = mid + 60;
	var hStartY = 40;
	var levelConfig;
	var mazeMaps;
	var animate;
	var numBlue;
	var numRed;
	var numFree;
	var blueRed;
	var numTotal;
	var numColumns;
	var numRows;
	var numInWallColumns;
	var numInWallRows;
	var door;
	var hero;
	var dTypes;
	var rooms;
	var doorFrames;
	var doorFrames2;
	var iter;
	var iX;
	var iY;
	var index;
	var mapIndex;
	var map;
	var instructions;
	var acceptConditions;
	var finished;
	var runButton;
	var d;
	var r;
	var dI;
	var mX;
	var mY;
	var dX;
	var dY;
	var sX;
	var sY;
	var sd;
	var sh;
	var si;
	var sj;
	var statusString;
	$.getJSON(levelFile,function(data){
		levelConfig = data;
		init();
	});
	function init(){
		numBlue = levelConfig.numBlue;
		numRed = levelConfig.numRed;
		numFree = levelConfig.numFree;
		blueRed = numBlue + numRed;
		numTotal = blueRed + numFree;
		numColumns = levelConfig["numColumns"];
		numRows = levelConfig["numRows"];
		numInWallColumns = numColumns - 1;
		numInWallRows = numRows - 1;
		hero = {"x":hStartX, "y":hStartY, "rad":4, "i":0, "j":0, "color":"orange"};
		runButton = {"x":mid - 45,"y": hight - (mid + 30),"w":45,"h":30, "color":"DarkSlateGray"};
		iter = 10;
		instructions = "Drag the colored doors to the inner walls of the maze. The doors are directional, so use the \"a\" key to change that direction.";
		instructions2 = "Green doors do not use up characters of the color string.";
		acceptConditions = levelConfig.acceptConditions;
		dI = -1;
		d = false;
		r = false;
		statusString = "";
		initDoors();
		initDoorFrames();
		initDoorTypes();
		mazeMaps = levelConfig.mazeMaps;
		gameCanvas.addEventListener("mousedown", mDL, false);
		document.onkeypress = keyPress;
		animate = window.requestAnimationFrame(drawScreen);
	}
	function initDoors(){
		door = [];
		for(var i = 0; i < numBlue; i++)
		{ door[i] = {"x":50, "y":50, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"blue"}; }
		for(var i = numBlue; i < blueRed; i++)
		{ door[i] = {"x":50, "y":90, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"red"}; }
		for(var i = blueRed; i < numTotal; i++)
		{ door[i] = {"x":50, "y":130, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"green"}; }
	}
	function initDoorTypes(){
		dTypes = [];
		var colors = [];
		colors[0] = "darkBlue";
		colors[1] = "darkRed";
		colors[2] = "darkGreen";
		colors[3] = "orange";
		for(var i = 0; i < 4; i++)
		{ dTypes[i] = {"x":40,"y":40 + 40*i,"w":20,"h":20,"color":colors[i]}; }
	}
	function initDoorFrames(){
		rooms = [];
		doorFrames = [];
		doorFrames2 = [];
		for(var i = 0; i < numRows; i++){
			rooms[i] = [];
			for(var j = 0; j < numColumns; j++)
			{ rooms[i][j] = {"x":mid + 60 + 40 * j,"y":40 + 40 * i,"rad":10,"red":"noDoor","blue":"noDoor","green":"noDoor","color":"yellow"}; }
		}
		for(var i = 0; i < numRows; i++){
			doorFrames[i] = [];
			for(var j = 0; j < numInWallColumns; j++)
			{ doorFrames[i][j] = {"x":mid + 80 + 40 * j,"y":40 + 40 * i,"rad":14,"door":null,"color":"darkRed"}; }
		}
		for(var i = 0; i < numInWallRows; i++){
			doorFrames2[i] = [];
			for(var j = 0; j < numColumns; j++)
			{ doorFrames2[i][j] = {"x":mid + 60 + 40 * j,"y":60 + 40 * i,"rad":14,"door":null,"color":"darkBlue"}; }
		}
	}
	function mDL(e){
		var rec = gameCanvas.getBoundingClientRect();
		mX = (e.clientX - rec.left)*(gameCanvas.width/rec.width);
		mY = (e.clientY - rec.top)*(gameCanvas.height/rec.height);
		hitDoorTest(mX,mY);
		if (d){
			r = false;
			statusString = "";
			removeDoor();
			gameCanvas.addEventListener("mousemove", mML, false);
		}else if(hitRunTest())
		{ runMazeTests(); }
		gameCanvas.removeEventListener("mousedown", mDL, false);
		gameCanvas.addEventListener("mouseup", mUL, false);
		if (e.preventDefault)
		{ e.preventDefault(); }
		else if (e.returnValue)
		{ e.returnValue = false; }
		return false;
	}
	function mUL(e){
		gameCanvas.addEventListener("mousedown", mDL, false);
		gameCanvas.removeEventListener("mouseup", mUL, false);
		if (d){
			d = false;
			gameCanvas.removeEventListener("mousemove", mML, false);
			var xy = hitFramesTest(mX,mY);
			var h = xy.h;
			var i = xy.i;
			var j = xy.j;
			if(h === 0){
				door[dI].x = dTypes[i].x + 10;
				door[dI].y = dTypes[i].y + 10;
				door[dI].d = true;
			}else if((h === 1)&&(doorFrames[i][j].door == null)){
				door[dI].x = doorFrames[i][j].x;
				door[dI].y = doorFrames[i][j].y;
				addDoor(h,i,j);
			}else if((h === 2)&&(doorFrames2[i][j].door == null)){
				door[dI].x = doorFrames2[i][j].x;
				door[dI].y = doorFrames2[i][j].y;
				addDoor(h,i,j);
			}else{
				door[dI].x = sX;
				door[dI].y = sY;
				door[dI].d = sd;
				addDoor(sh,si,sj);
			}
		}
	}
	function mML(e){
		var sRad = door[dI].rad;
		var maxX = gameCanvas.width - sRad;
		var maxY = gameCanvas.height - sRad;
		var rec = gameCanvas.getBoundingClientRect();
		mX = (e.clientX - rec.left)*(gameCanvas.width/rec.width);
		mY = (e.clientY - rec.top)*(gameCanvas.height/rec.height);
		var pX = mX - dX;
		var pY = mY - dY;
		door[dI].x = (pX < sRad) ? sRad : ((pX > maxX) ? maxX : pX);
		door[dI].y = (pY < sRad) ? sRad : ((pY > maxY) ? maxY : pY);
	}
	function keyPress(e){
		var character = (e.witch?e.witch:e.keyCode);
		if(d && (character === 65||character === 97))
		{ door[dI].d = !door[dI].d; }
	}
	function addDoor(h,i,j){
		door[dI].h = h;
		door[dI].i = i;
		door[dI].j = j;
		if(h === 1){
			doorFrames[i][j].door = door[dI];
			door[dI].enterI = i;
			door[dI].exitI = i;
			if(door[dI].d){
				door[dI].enterJ = j + 1;
				door[dI].exitJ = j;
			}else{
				door[dI].enterJ = j;
				door[dI].exitJ = j + 1;
			}
		}else if(h === 2){
			doorFrames2[i][j].door = door[dI];
			door[dI].enterJ = j;
			door[dI].exitJ = j;
			if(door[dI].d){
				door[dI].enterI = i + 1;
				door[dI].exitI = i;
			}else{
				door[dI].enterI = i;
				door[dI].exitI = i + 1;
			}
		}
	}
	function removeDoor(){
		sX = door[dI].x;
		sY = door[dI].y;
		dX = mX - sX;
		dY = mY - sY;
		sd = door[dI].d
		sh = door[dI].h;
		si = door[dI].i;
		sj = door[dI].j;
		if(sh === 1)
		{ doorFrames[si][sj].door = null; }
		else if(sh === 2)
		{ doorFrames2[si][sj].door = null; }
		door[dI].h = -1;
		door[dI].i = -1;
		door[dI].j = -1;
		door[dI].enterI = -1;
		door[dI].enterJ = -1;
		door[dI].exitI = -1;
		door[dI].exitJ = -1;
	}
	function hitDoorTest(mx,my){
		var dx;
		var dy;
		var drad;
		for(var i = 0; i < numTotal; i++){
			dx = mx - door[i].x;
			dy = my - door[i].y;
			drad = door[i].rad;
			if(dx*dx + dy*dy < drad*drad){
				d = true;
				dI = i;
			}
		}
		
	}
	function hitRunTest(){
		var fx = mX - runButton.x;
		var fy = mY - runButton.y;
		return (fx > 0 && fx < runButton.w && fy > 0 && fy < runButton.h);
	}
	function hitFramesTest(mx,my){
		var fx = mx - dTypes[3].x;
		var fy = my - dTypes[3].y;
		var intColor = door[dI].color;
		if(intColor === "blue")
		{ intColor = 0; }
		else if(intColor === "red")
		{ intColor = 1; }
		else
		{ intColor = 2; }
		var frad;
		if(fx > 0 && fx < dTypes[3].w && fy > 0 && fy < dTypes[3].h)
		{ return {"h":0,"i":intColor,"j":-1}; }
		for(var i = 0; i < numRows; i++){
			for(var j = 0; j < numInWallColumns; j++){
				fx = mx - doorFrames[i][j].x;
				fy = my - doorFrames[i][j].y;
				frad = doorFrames[i][j].rad;
				if(fx*fx + fy*fy < frad*frad)
				{ return {"h":1,"i":i,"j":j}; }
			}
		}
		for(var i = 0; i < numInWallRows; i++){
			for(var j = 0; j < numColumns; j++){
				fx = mx - doorFrames2[i][j].x;
				fy = my - doorFrames2[i][j].y;
				frad = doorFrames2[i][j].rad;
				if(fx*fx + fy*fy < frad*frad)
				{ return {"h":2,"i":i,"j":j}; }
			}
		}
		return {"h":-1,"i":-1,"j":-1};
	}
	function navigateMaze(){
		var i = hero.i;
		var j = hero.j;
		var freeDoor = -1;
		var doI;
		var doJ;
		var fdoI;
		var fdoJ;
		var startCheckDoor = 0;
		var stopCheckDoor = 0;
		for(checkDoor = blueRed; checkDoor < numTotal; checkDoor++){
			doI = door[checkDoor].exitI;
			doJ = door[checkDoor].exitJ;
			if(i === doI && j === doJ){
				fdoI = doI;
				fdoJ = doJ;
				freeDoor = checkDoor;
				break;
			}
		}
		if(index >= map.path.length && freeDoor < 0){
			var atExit = ((hero.x === (mid + 60 + 40 * numInWallColumns))&&(hero.y === (40 + 40 * numInWallRows)));
			if(map.exit && atExit)
			{ statusString = "sucess: valid map got hero to exit."; }
			else if(!(map.exit || atExit))
			{ statusString = "sucess: invalid map left hero away from exit."; }
			else
			{ statusString = "fail"; }
			setTimeout(runNextMap,200 * iter);
		}else{
			var goI;
			var goJ;
			var takeDoor = map.path[index];
			var checkDoor;
			var incrimentIndex = false;
			if(takeDoor === "blue"){
				startCheckDoor = 0;
				stopCheckDoor = numBlue;
			}else if(takeDoor === "red"){
				startCheckDoor = numBlue;
				stopCheckDoor = blueRed;
			}
			if(startCheckDoor < stopCheckDoor){
				for(checkDoor = startCheckDoor; checkDoor < stopCheckDoor; checkDoor++){
					doI = door[checkDoor].exitI;
					doJ = door[checkDoor].exitJ;
					if(i === doI && j === doJ){
						fdoI = doI;
						fdoJ = doJ;
						incrimentIndex = true;
						freeDoor = checkDoor;
						break;
					}
				}
			}
			if(!incrimentIndex){
				if(freeDoor < 0){
					index++;
					goI = fdoI;
					goJ = fdoJ;
				}else{
					goJ = door[freeDoor].enterJ;
					goI = door[freeDoor].enterI;
				}
			}else{
				index++;
				goJ = door[freeDoor].enterJ;
				goI = door[freeDoor].enterI;
			}
			if(goJ === fdoJ + 1){
				iX = hero.x + 40;
				setTimeout(moveHeroRight,iter);
			}else if(goI === fdoI + 1){
				iY = hero.y + 40;
				setTimeout(moveHeroDown,iter);
			}else if(goJ === fdoJ - 1){
				iX = hero.x - 40;
				setTimeout(moveHeroLeft,iter);
			}else if(goI === fdoI - 1){
				iY = hero.y - 40;
				setTimeout(moveHeroUp,iter)
			}else
			{ setTimeout(navigateMaze(),iter); }
		}
	}
	function moveHeroRight(){
		hero.x++;
		if(hero.x >= iX){
			hero.j++;
			setTimeout(navigateMaze(),iter);
		}else
		{ setTimeout(moveHeroRight,iter); }
	}
	function moveHeroDown(){
		hero.y++;
		if(hero.y >= iY){
			hero.i++;
			setTimeout(navigateMaze(),iter);
		}else
		{ setTimeout(moveHeroDown,iter); }
	}
	function moveHeroLeft(){
		hero.x--;
		if(hero.x <= iX){
			hero.j--;
			setTimeout(navigateMaze(),iter);
		}else
		{ setTimeout(moveHeroLeft,iter); }
	}
	function moveHeroUp(){
		hero.y--;
		if(hero.y <= iY){
			hero.i--;
			setTimeout(navigateMaze(),iter);
		}else
		{ setTimeout(moveHeroUp,iter); }
	}
	function runMazeTests(){
		r = true;
		mapIndex = -1;
		dI = -1;
		runNextMap();
	}
	function runNextMap(){
		mapIndex++;
		if(mapIndex < mazeMaps.length){
			statusString = "go";
			hero.x = hStartX;
			hero.y = hStartY;
			hero.i = 0;
			hero.j = 0;
			iX = 0;
			iY = 0;
			map = mazeMaps[mapIndex];
			index = 0;
			navigateMaze();
		}
	}
	function drawBackground(){
		context.fillStyle = 'gray';
		context.fillRect(0, 0, width, hight);
		context.beginPath();
		context.rect(1, 1, mid, hight - (mid + 2));
		context.rect(mid, 1, width - mid, hight - (mid + 2));
		context.rect(1, hight-mid, width - 2, mid);
		context.closePath();
		context.lineWidth = 7;
		context.strokeStyle = 'black';
		context.stroke();
		context.fillStyle = "black";
		context.font = "14px Georgia";
		context.fillText(instructions, 15, hight-(mid-30));
		context.fillText(instructions2, 15, hight-(mid-50));
		context.font = "16px Georgia";
		context.fillText(acceptConditions, 15, hight-(mid-80));
		context.fillText(statusString, 15, hight -(mid - 120));
		if(dI >= 0){
			var stateString;
			if(door[dI].h === 1){
				if(door[dI].d)
				{ stateString = "right"; }
				else
				{ stateString = "left"; }
			}else if(door[dI].h === 2){
				if(door[dI].d)
				{ stateString = "down"; }
				else
				{ stateString = "up"; }
			}else{
				if(door[dI].d)
				{ stateString = "right/down"; }
				else
				{ stateString = "left/up"; }
			}
			context.fillText(stateString, 15, runButton.y - 19);
		}
		
	}
	function drawCenter(){
		context.fillStyle = "yellow";
		for(var i = 0; i < numRows; i++){
			for(var j = 0; j < numColumns; j++){
				context.beginPath();
				context.arc(rooms[i][j].x, rooms[i][j].y, rooms[i][j].rad, 0, 2*Math.PI, false);
				context.closePath();
				context.fill();
			}
		}
	}
	function drawFrames(){
		context.fillStyle = "darkRed";
		for(var i = 0; i < numRows; i++){
			for(var j = 0; j < numInWallColumns; j++){
				context.beginPath();
				context.arc(doorFrames[i][j].x, doorFrames[i][j].y, doorFrames[i][j].rad, 0, 2*Math.PI, false);
				context.closePath();
				context.fill();
			}
		}
		context.fillStyle = "darkBlue";
		for(var i = 0; i < numInWallRows; i++){
			for(var j = 0; j < numColumns; j++){
				context.beginPath();
				context.arc(doorFrames2[i][j].x, doorFrames2[i][j].y, doorFrames2[i][j].rad, 0, 2*Math.PI, false);
				context.closePath();
				context.fill();
			}
		}
	}
	function drawDoorTypes(){
		for(var i = 0; i < 4; i++){
			context.fillStyle = dTypes[i].color;
			context.fillRect(dTypes[i].x, dTypes[i].y, dTypes[i].w, dTypes[i].h);
		}
	}
	function drawGrid(){
		var leftWall = mid + 40;
		var leftEdge = leftWall - 1;
		var lC = leftWall + 1 + 40 * numColumns;
		var lR = 20 + 40 * numRows;
		context.beginPath();
		for(var i = 0; i <= numRows; i++){
			context.moveTo(leftEdge,20 + 40*i);
			context.lineTo(lC,20 + 40*i);
		}
		for(var i = 0; i <= numColumns; i++){
			context.moveTo(leftWall + (40*i),20);
			context.lineTo(leftWall + (40*i),lR);
		}
		context.closePath();
		context.lineWidth = 2;
		context.strokeStyle = 'DarkSlateGray';
		context.stroke();
	}
	function drawScreen(){
		context.clearRect(0, 0, width, hight);
		drawBackground();
		drawRunButton();
		drawDoorTypes();
		drawGrid();
		drawDoors();
		if(r)
		{drawHero();}
		animate = window.requestAnimationFrame(drawScreen);
	}
	function drawDoor(i){
		context.beginPath();
		context.arc(door[i].x, door[i].y, door[i].rad, 0, 2*Math.PI, false);
		context.closePath();
		context.fillStyle = door[i].color;
		context.fill();
		context.strokeStyle = "black";
		context.lineWidth = 1;
		context.stroke();
	}
	function drawDoors(){
		for(var i = 0; i < numTotal;i++)
		{ drawDoor(i); }
		if(dI >= 0)
		{ drawDoor(dI); }
		
	}
	function drawHero(){
		context.beginPath();
		context.arc(hero.x, hero.y, hero.rad, 0, 2*Math.PI, false);
		context.closePath();
		context.fillStyle = hero.color;
		context.fill();
	}
	function drawRunButton(){
		context.beginPath();
		context.rect(runButton.x, runButton.y, runButton.w, runButton.h);
		context.closePath();
		context.fillStyle = "DarkSlateGray";
		context.fill();
		context.lineWidth = 7;
		context.strokeStyle = "black";
		context.stroke();
		context.font = "16px Georgia";
		context.fillStyle = "black";
		context.fillText("Run", runButton.x + 7, runButton.y + 19);
	}
}
