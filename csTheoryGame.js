window.addEventListener("load", main, false);
/*
 *
 */
function main(){
	var gameCanvas = document.getElementById('gameCanvas');
	var context = gameCanvas.getContext("2d");
	var anamate;
	var width = gameCanvas.width;
	var hight = gameCanvas.height;
	var fileList;
	var levelList;
	var levelIndex;
	var mX;
	var mY;
	var mouseIsDown = false;
	gameCanvas.addEventListener("mousedown", mouseButtonDown, false);
	var chooseLevelButton = {"x":300,"y":250,"w":200,"h":100,"color":"DarkSlateGray"};
	var nextLevelButton = {"x1":650,"y1":300,"x2":600,"y2":250,"x3":600,"y3":350,"color":"DarkSlateGray"};
	var previousLevelButton = {"x1":150,"y1":300,"x2":200,"y2":250,"x3":200,"y3":350,"color":"DarkSlateGray"};
	menu();
	/*
	 *
	 */
	function menu(){
		fileList = [];
		levelList = [];
		levelIndex = 0;
		$.get("levels/",function(data){
			$(data).find("a:contains(.json)").each(function(){
				var url = this.href;
				var filename = url.substr(url.lastIndexOf("/")+1);
				fileList.push(filename);
			});
			var numFiles = fileList.length;
			if(numFiles > 0){
				var fileIndex = 0;
				loadLevels();
				function loadLevels(){
					var value = fileList[fileIndex];
					var levelFile = "levels/".concat(value);
					$.getJSON(levelFile,function(data){
						data.doors = mInitDoors(data);
						levelList.push(data);
						fileIndex++;
						if(fileIndex >= numFiles){
							animate = window.requestAnimationFrame(mDrawScreen);
							gameCanvas.addEventListener("click", onClick, false);
						}else
						{ loadLevels(); }
					}).fail(function()
					{ mDrawError("Could not access new level: " + value + " "); });
				}
			}else
			{ mDrawError("No levels found"); }
		}).fail(function()
		{ mDrawError("Could not access levels directory"); });
	}
	/*
	 *
	 */
	function mouseButtonDown(e){
		mouseIsDown = true;
		gameCanvas.removeEventListener("mousedown", mouseButtonDown, false);
		gameCanvas.addEventListener("mouseup", mouseButtonUp, false);
	}
	/*
	 *
	 */
	function mouseButtonUp(e){
		mouseIsDown = false;
		gameCanvas.removeEventListener("mouseup", mouseButtonUp, false);
		gameCanvas.addEventListener("mousedown", mouseButtonDown, false);
	}
	/*
	 *
	 */
	function mInitDoors(data){
		var numBlue = data.numBlue;
		var numRed = data.numRed;
		var numFree = data.numFree;
		var numGoals = data.numGoals;
		var numDB = data.numDB;
		var numDR = data.numDR;
		var blueRed = numBlue + numRed;
		var numDoors = blueRed + numFree;
		var startPos = numDoors + 1;
		var goalPos = startPos + numGoals;
		var rlPos = goalPos + numDB;
		var numTotal = rlPos + numDR;
		var doors = [];
		var i = 0;
		for(; i < numBlue; i++)
		{ doors[i] = {"x":50, "y":50, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"blue"}; }
		for(; i < blueRed; i++)
		{ doors[i] = {"x":50, "y":90, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"red"}; }
		for(; i < numDoors; i++)
		{ doors[i] = {"x":50, "y":130, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"green"}; }
		doors[i] = {"x":50, "y":170, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"gold"};
		i++;
		for(;i < goalPos; i++)
		{ doors[i] = {"x":90, "y":50, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"yellow"}; }
		for(;i < rlPos; i++)
		{ doors[i] = {"x":90, "y":90, "rad":6,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"darkBlue"}; }
		for(;i < numTotal; i++)
		{ doors[i] = {"x":90, "y":130, "rad":6,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"darkRed"}; }
		return doors;
	}
	/*
	 *
	 */
	function mDrawScreen(){
		context.clearRect(0, 0, width, hight);
		mDrawBackground();
		mDrawTriangleButton(nextLevelButton);
		mDrawTriangleButton(previousLevelButton);
		mDrawRectangularButton(chooseLevelButton,levelList[levelIndex].levelName);
		animate = window.requestAnimationFrame(mDrawScreen);
	}
	/*
	 *
	 */
	function mDrawError(errorText){
		var recBorder = 50;
		context.clearRect(0, 0, width, hight);
		mDrawBackground();
		context.fillStyle = 'red';
		context.fillRect(recBorder, recBorder, width - (2 * recBorder), hight - (2 * recBorder));
		context.font = "30px Georgia";
		context.fillStyle = "black";
		context.textAlign = "center";
		context.textBaseline = "middle";
		wrapText("ERROR: " + errorText + "!", width/2, height/2, width - ((2 * recBorder) + 2));
		context.textAlign = "start";
		context.textBaseline = "alphabetic";
	}
	/*
	 *
	 */
	function mDrawTriangleButton(triangle){
		context.beginPath();
		context.moveTo(triangle.x1, triangle.y1);
		context.lineTo(triangle.x2, triangle.y2);
		context.lineTo(triangle.x3, triangle.y3);
		context.closePath();
		context.fillStyle = triangle.color;
		context.fill();
		context.lineWidth = 3;
		context.strokeStyle = "black";
		context.stroke();
	}
	/*
	 * 
	 * 
	 */
	function mDrawCircle(circle){
		context.beginPath();
		context.arc(circle.x, circle.y, circle.rad, 0, 2*Math.PI, false);
		context.closePath();
		context.fillStyle = circle.color;
		context.fill();
	}
	/*
	 *
	 * 
	 */
	function mDrawBackground(){
		context.fillStyle = 'gray';
		context.fillRect(0, 0, width, hight);
		context.beginPath();
		context.rect(1, 1, width - 2, hight - 2);
		context.closePath();
		context.lineWidth = 7;
		context.strokeStyle = 'black';
		context.stroke();
	}
	/*
	 *
	 * 
	 */
	function mDrawRectangularButton(recButton,recText){
		var x = recButton.x;
		var y = recButton.y;
		var w = recButton.w;
		var h = recButton.h;
		context.beginPath();
		context.rect(x, y, w, h);
		context.closePath();
		context.fillStyle = recButton.color;
		context.fill();
		context.lineWidth = 7;
		context.strokeStyle = "black";
		context.stroke();
		context.font = "16px Georgia";
		context.fillStyle = "black";
		context.textAlign = "center";
		context.textBaseline = "middle";
		wrapText(recText, x + w/2, y + h/2, w - 4);
		context.textAlign = "start";
		context.textBaseline = "alphabetic";
	}
	/*
	 *
	 */
	function hitTriangleTest(triangle){
		var x1 = triangle.x1;
		var x2 = triangle.x2;
		var x3 = triangle.x3;
		var y1 = triangle.y1;
		var y2 = triangle.y2;
		var y3 = triangle.y3;
		var m1x = mX-x1;
		var m1y = mY-y1;
		var m12 = ((x2-x1)*m1y-(y2-y1)*m1x > 0);
		return ((((x3-x1)*m1y-(y3-y1)*m1x > 0) != m12) && (((x3-x2)*(mY-y2)-(y3-y2)*(mX-x2) > 0) == m12));
	}
	/*
	 *
	 */
	function hitRectangleTest(rectangle){
		var fx = mX - rectangle.x;
		var fy = mY - rectangle.y;
		return (fx > 0 && fx < rectangle.w && fy > 0 && fy < rectangle.h);
	}
	/*
	 *
	 */
	function hitCircleTest(circle){
		var fx = mX - circle.x;
		var fy = mY - circle.y;
		var frad = circle.rad;
		return (fx*fx + fy*fy < frad*frad);
	}
	/*
	 *
	 */
	function wrapText(textLine, x, y, maxWidth) {
		var textLineWidth = context.measureText(textLine).width;
		var line = textLine;
		var nY = y;
		if(textLineWidth > maxWidth){
			var lineHeight = 1 + parseInt(context.font,10);
			if(context.textBaseline === "middle")
			{ nY = y - Math.floor(Math.floor(textLineWidth / maxWidth) * lineHeight / 2); }
			var words = textLine.split(' ');
			var numWords = words.length;
			line = '';
			for(var i = 0; i < numWords; i++){
				var word = words[i];
				var testLine = line + word + ' ';
				if((context.measureText(testLine).width > maxWidth) && (i > 0)){
					context.fillText(line, x, nY, maxWidth);
					line = word + ' ';
					nY += lineHeight;
				}else
				{ line = testLine; }
			}
        }
        context.fillText(line, x, nY, maxWidth);
    }
	/*
	 *
	 */
	function getMousePosition(e){
		var rec = gameCanvas.getBoundingClientRect();
		mX = (e.clientX - rec.left)*(gameCanvas.width/rec.width);
		mY = (e.clientY - rec.top)*(gameCanvas.height/rec.height);
	}
	/*
	 *
	 */
	function onClick(e){
		getMousePosition(e);
		var maxIndex = levelList.length - 1;
		if(hitRectangleTest(chooseLevelButton)){
			gameCanvas.removeEventListener("click", onClick, false);
			window.cancelAnimationFrame(animate);
			level(levelList[levelIndex]);
		}else if(hitTriangleTest(previousLevelButton)){
			if(levelIndex == 0)
			{ levelIndex = maxIndex; }
			else
			{ levelIndex--; }
		}else if(hitTriangleTest(nextLevelButton)){
			if(levelIndex == maxIndex)
			{ levelIndex = 0; }
			else
			{ levelIndex++; }
		}
	}
	/*
	 *
	 */
	function level(levelConfig){
		var mid = width/5;
		var hStartX = mid + 60;
		var hStartY = 40;
		var roomSize = 40;
		var mazeMaps = levelConfig.mazeMaps;
		var numBlue = levelConfig.numBlue;
		var numRed = levelConfig.numRed;
		var numFree = levelConfig.numFree;
		var numGoals = levelConfig.numGoals;
		var numDB = levelConfig.numDB;
		var numDR = levelConfig.numDR;
		var blueRed = numBlue + numRed;
		var numDoors = blueRed + numFree;
		var startPos = numDoors + 1;
		var goalPos = startPos + numGoals;
		var rlPos = goalPos + numDB;
		var numTotal = rlPos + numDR;
		var numColumns = 14;
		var numRows = 10;
		var numInWallColumns = numColumns - 1;
		var numInWallRows = numRows - 1;
		var numRight;
		var hero = {"x":hStartX, "y":hStartY, "rad":4, "i":0, "j":0, "color":"orange"};
		var instructions = "Drag the colored doors to the inner walls of the maze. The doors are directional, so use the \"a\" key to change that direction. Green doors do not use up characters of the color string.";
		var acceptConditions = levelConfig.acceptConditions;
		var sBh = 30;
		var sBy = hight - (mid + sBh);
		var offMid = 45;
		var menuButton = {"x":2,"y": sBy,"w":55,"h":sBh, "color":"DarkSlateGray"};
		var clearButton = {"x":menuButton.x + menuButton.w,"y": sBy,"w":55,"h":sBh, "color":"DarkSlateGray"};
		var runButton = {"x":mid - offMid,"y": sBy,"w":offMid,"h":sBh, "color":"DarkSlateGray"};
		var iter = 10;
		var d = false;
		var r = false;
		var dI = -1;
		var statusString = "";
		var door = levelConfig.doors;
		var dTypes;
		var rooms;
		var doorFrames;
		var doorFrames2;
		var iX;
		var iY;
		var index;
		var incIndex;
		var mapIndex;
		var map = null;
		var finished;
		var dX;
		var dY;
		var sX;
		var sY;
		var sd;
		var sh;
		var si;
		var sj;
		levInit();
		/*
		 *
		 */
		function levInit(){
			levInitDoorFrames();
			levInitDoorTypes();
			var lenDoor = door.length
			for(var i = 0; i < lenDoor; i++){
				var curDoor = door[i];
				var curDoorH = curDoor.h;
				if(curDoorH === 1)
				{ doorFrames[curDoor.i][curDoor.j].door = curDoor; }
				else if(curDoorH === 2)
				{ doorFrames2[curDoor.i][curDoor.j].door = curDoor; }
				else if(curDoorH === 3)
				{ rooms[curDoor.i][curDoor.j].door = curDoor; }
				else if(curDoorH === 4)
				{ rooms[curDoor.i][curDoor.j].bl = curDoor; }
				else if(curDoorH === 5)
				{ rooms[curDoor.i][curDoor.j].rl = curDoor; }
			}
			gameCanvas.addEventListener("mousedown", levelMouseDown, false);
			window.addEventListener("keypress", keyPress, false);
			animate = window.requestAnimationFrame(drawScreen);
		}
		/*
		 * 
		 */
		function levInitDoors(){
			door = [];
			var i = 0;
			for(; i < numBlue; i++)
			{ door[i] = {"x":50, "y":50, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"blue"}; }
			for(; i < blueRed; i++)
			{ door[i] = {"x":50, "y":90, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"red"}; }
			for(; i < numDoors; i++)
			{ door[i] = {"x":50, "y":130, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"green"}; }
			door[i] = {"x":50, "y":170, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"gold"};
			i++;
			for(;i < goalPos; i++)
			{ door[i] = {"x":90, "y":50, "rad":8,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"yellow"}; }
			for(;i < rlPos; i++)
			{ door[i] = {"x":90, "y":90, "rad":6,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"darkBlue"}; }
			for(;i < numTotal; i++)
			{ door[i] = {"x":90, "y":130, "rad":6,"d":true,"h":-1,"i":-1,"j":-1,"exitI":-1,"exitJ":-1,"enterI":-1,"enterJ":-1,"color":"darkRed"}; }
		}
		/*
		 *
		 */
		function levInitDoorTypes(){
			var offset = 40;
			var side = 20;
			dTypes = [];
			var colors = [];
			colors[0] = "darkBlue";
			colors[1] = "darkRed";
			colors[2] = "darkGreen";
			colors[3] = "gold";
			colors[4] = "gold";
			colors[5] = "blue";
			colors[6] = "red";
			colors[7] = "orange";
			var i = 0;
			var lenC = colors.length;
			var hlenC = lenC/2;
			for(; i < hlenC; i++)
			{ dTypes[i] = {"x":offset,"y":offset + roomSize*i,"w":side,"h":side,"color":colors[i]}; }
			var offr = offset + roomSize;
			for(; i < lenC; i++)
			{ dTypes[i] = {"x":offr,"y":offset + roomSize*(i - hlenC),"w":side,"h":side,"color":colors[i]}; }
		}
		/*
		 *
		 */
		function levInitDoorFrames(){
			rooms = [];
			doorFrames = [];
			doorFrames2 = [];
			var dRad = 14;
			for(var i = 0; i < numRows; i++){
				rooms[i] = [];
				for(var j = 0; j < numColumns; j++)
				{ rooms[i][j] = {"x":hStartX + (roomSize * j),"y":hStartY + (roomSize * i),"rad":10,"door":null,"bl":null,"rl":null,"color":"yellow"}; }
			}
			for(var i = 0; i < numRows; i++){
				doorFrames[i] = [];
				for(var j = 0; j < numInWallColumns; j++)
				{ doorFrames[i][j] = {"x":hStartX + 20 + (roomSize * j),"y":hStartY + (roomSize * i),"rad":dRad,"door":null,"color":"darkRed"}; }
			}
			for(var i = 0; i < numInWallRows; i++){
				doorFrames2[i] = [];
				for(var j = 0; j < numColumns; j++)
				{ doorFrames2[i][j] = {"x":hStartX + (roomSize * j),"y":60 + (roomSize * i),"rad":dRad,"door":null,"color":"darkBlue"}; }
			}
		}
		/*
		 *
		 */
		function levelMouseDown(e){
			getMousePosition(e);
			gameCanvas.removeEventListener("mousedown", levelMouseDown, false);
			if(hitRectangleTest(menuButton)){
				gameCanvas.addEventListener("mouseup", backToMenu, false);
			}else if(hitRectangleTest(clearButton)){
				r = false;
				statusString = "";
				gameCanvas.addEventListener("mouseup", reInit, false);
			}else if(hitDoorTest()){
				r = false;
				statusString = "";
				removeDoor();
				gameCanvas.addEventListener("mousemove", moveDoorDI, false);
				gameCanvas.addEventListener("mouseup", placeDoorDI, false);
			}else if(hitRectangleTest(runButton))
			{ runMazeTests(); }
			else
			{ gameCanvas.addEventListener("mouseup", releaseMouse, false); }
			if (e.preventDefault)
			{ e.preventDefault(); }
			else if (e.returnValue)
			{ e.returnValue = false; }
			return false;
		}
		/*
		 *
		 */
		function releaseMouse(e){
			gameCanvas.removeEventListener("mouseup", releaseMouse, false);
			gameCanvas.addEventListener("mousedown", levelMouseDown, false);
		}
		/*
		 *
		 */
		function placeDoorDI(e){
			getMousePosition(e);
			gameCanvas.removeEventListener("mouseup", placeDoorDI, false);
			gameCanvas.removeEventListener("mousemove", moveDoorDI, false);
			d = false;
			var xy = hitFramesTest();
			var h = xy.h;
			var i = xy.i;
			var j = xy.j;
			var offset = 6;
			if(h === 0){
				var doorType = dTypes[i]
				door[dI].x = doorType.x + (doorType.w)/2;
				door[dI].y = doorType.y + (doorType.h)/2;
				door[dI].d = true;
			}else if((h === 1)&&(doorFrames[i][j].door == null)){
				door[dI].x = doorFrames[i][j].x;
				door[dI].y = doorFrames[i][j].y;
				addDoor(h,i,j);
			}else if((h === 2)&&(doorFrames2[i][j].door == null)){
				door[dI].x = doorFrames2[i][j].x;
				door[dI].y = doorFrames2[i][j].y;
				addDoor(h,i,j);
			}else if((h === 3)&&(rooms[i][j].door == null)){
				door[dI].x = rooms[i][j].x;
				door[dI].y = rooms[i][j].y;
				addDoor(h,i,j);
			}else if((h === 4)&&(rooms[i][j].bl == null)){
				door[dI].x = rooms[i][j].x - offset;
				door[dI].y = rooms[i][j].y + offset;
				addDoor(h,i,j);
			}else if((h === 5)&&(rooms[i][j].rl == null)){
				door[dI].x = rooms[i][j].x + offset;
				door[dI].y = rooms[i][j].y - offset;
				addDoor(h,i,j);
			}else{
				door[dI].x = sX;
				door[dI].y = sY;
				door[dI].d = sd;
				addDoor(sh,si,sj);
			}
			dI = -1;
			gameCanvas.addEventListener("mousedown", levelMouseDown, false);
		}
		/*
		 *
		 */
		function moveDoorDI(e){
			var sRad = door[dI].rad;
			var maxX = gameCanvas.width - sRad;
			var maxY = gameCanvas.height - sRad;
			getMousePosition(e);
			var pX = mX - dX;
			var pY = mY - dY;
			door[dI].x = Math.max(sRad,Math.min(maxX,pX));
			door[dI].y = Math.max(sRad,Math.min(maxY,pY));
		}
		/*
		 *
		 */
		function reInit(e){
			gameCanvas.removeEventListener("mouseup", reInit, false);
			levInitDoors();
			levInitDoorFrames();
			levInitDoorTypes();
			gameCanvas.addEventListener("mousedown", levelMouseDown, false);
		}
		/*
		 *
		 */
		function backToMenu(e){
			window.cancelAnimationFrame(animate);
			gameCanvas.removeEventListener("mouseup", backToMenu, false);
			window.removeEventListener("keypress", keyPress, false);
			animate = window.requestAnimationFrame(mDrawScreen);
			gameCanvas.addEventListener("click", onClick, false);
		}
		/*
		 *
		 */
		function keyPress(e){
			var character = (e.witch?e.witch:e.keyCode);
			if(d && (character === 65||character === 97))
			{ door[dI].d = !door[dI].d; }
		}
		/*
		 *
		 */
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
			else if(h === 3)
			{ rooms[i][j].door = door[dI]; }
			else if(h === 4)
			{ rooms[i][j].bl = door[dI]; }
			else if(h === 5)
			{ rooms[i][j].rl = door[dI]; }
		}
		/*
		 *
		 */
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
			else if(sh === 3)
			{ rooms[si][sj].door = null; }
			else if(sh === 4)
			{ rooms[si][sj].bl = null; }
			else if(sh === 5)
			{ rooms[si][sj].rl = null; }
			door[dI].h = -1;
			door[dI].i = -1;
			door[dI].j = -1;
			door[dI].enterI = -1;
			door[dI].enterJ = -1;
			door[dI].exitI = -1;
			door[dI].exitJ = -1;
		}
		/*
		 *
		 */
		function hitDoorTest(){
			d = false;
			var doorLen = door.length;
			for(var i = 0; i < doorLen; i++){
				if(hitCircleTest(door[i])){
					d = true;
					dI = i;
				}
			}
			return d;
		}
		/*
		 *
		 */
		function hitFramesTest(){
			var intColor = door[dI].color;
			if(dI >= 0){
				var numdoors = (dI < numDoors);
				var goalpos = (dI < goalPos);
				var rlpos = (dI < rlPos);
				if(dI < numBlue)
				{ intColor = 0; }
				else if(dI < blueRed)
				{ intColor = 1; }
				else if(numdoors)
				{ intColor = 2; }
				else if(dI < startPos)
				{ intColor = 3 }
				else if(goalpos)
				{ intColor = 4; }
				else if(rlpos)
				{ intColor = 5; }
				else if(dI < numTotal)
				{ intColor = 6; }
				var frad;
				var tIndex = dTypes.length - 1;
				if(hitRectangleTest(dTypes[tIndex])){
					return {"h":0,"i":intColor,"j":-1};
				}else if(numdoors){
					for(var i = 0; i < numRows; i++){
						for(var j = 0; j < numInWallColumns; j++){
							if(hitCircleTest(doorFrames[i][j]))
							{ return {"h":1,"i":i,"j":j}; }
						}
					}
					for(var i = 0; i < numInWallRows; i++){
						for(var j = 0; j < numColumns; j++){
							if(hitCircleTest(doorFrames2[i][j])){ return {"h":2,"i":i,"j":j}; }
						}
					}
				}else{
					var vWall = mid + 40;
					var hWall = 20;
					if((vWall <= mX) && (hWall <= mY)){
						vWall += roomSize;
						hWall += roomSize;
						for(var i = 0; i < numRows; i++){
							if(mY < hWall){
								for(var j = 0; j < numColumns; j++){
									if(mX < vWall){
										var curH = 3;
										if(!goalpos){
											curH++;
											if(!rlpos)
											{ curH++; }
										}
										return {"h":curH,"i":i,"j":j};
									}else
									{ vWall += roomSize; }
								}
								break;
							}else
							{ hWall += roomSize; }
						}
					}
				}
			}
			return {"h":-1,"i":-1,"j":-1};
		}
		/*
		 *
		 */
		function heroAtExitTest(){
			var useCorner = false;
			for(var i = startPos; i < goalPos;i++){
				var curDoor = door[i];
				var uc = (curDoor.h === 3)
				useCorner = useCorner || uc;
				if(uc &&(hero.x === curDoor.x)&&(hero.y === curDoor.y))
				{ return true; }
			}
			return useCorner && ((hero.x === (hStartX + roomSize * numInWallColumns))&&(hero.y === (hStartY + roomSize * numInWallRows)));
		}
		/*
		 *
		 */
		function navigateMaze(){
			var i = hero.i;
			var j = hero.j;
			var freeDoor = -1;
			var doI;
			var doJ;
			var fdoI;
			var fdoJ;
			var checkDoor;
			var startCheckDoor = 0;
			var stopCheckDoor = 0;
			for(checkDoor = blueRed; checkDoor < numDoors; checkDoor++){
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
				var atExit = heroAtExitTest();
				var mapExit = map.exit;
				if(mapExit && atExit){
					numRight++;
					statusString = "sucess: valid map got hero to exit.";
				}else if(!(mapExit || atExit)){
					numRight++;
					statusString = "sucess: invalid map left hero away from exit.";
				}else
				{ statusString = "fail"; }
				setTimeout(runNextMap,200 * iter);
			}else{
				var goI;
				var goJ;
				var takeDoor = map.path[index];
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
						incIndex = (((takeDoor === "blue")&&(rooms[i][j].bl !== null))||((takeDoor === "red")&&(rooms[i][j].rl !== null)));
						goI = fdoI;
						goJ = fdoJ;
						
					}else{
						incIndex = false;
						goJ = door[freeDoor].enterJ;
						goI = door[freeDoor].enterI;
					}
				}else{
					incIndex = true;
					goJ = door[freeDoor].enterJ;
					goI = door[freeDoor].enterI;
				}
				if(goJ === fdoJ + 1){
					iX = hero.x + roomSize;
					setTimeout(moveHeroRight,iter);
				}else if(goI === fdoI + 1){
					iY = hero.y + roomSize;
					setTimeout(moveHeroDown,iter);
				}else if(goJ === fdoJ - 1){
					iX = hero.x - roomSize;
					setTimeout(moveHeroLeft,iter);
				}else if(goI === fdoI - 1){
					iY = hero.y - roomSize;
					setTimeout(moveHeroUp,iter)
				}else{
					if((!incIndex) &&(freeDoor < 0))
					{ index = map.path.length; }
					var timout = 40 * iter;
					setTimeout(noMoveHero,timout);
				}
			}
		}
		/*
		 *
		 */
		function moveHeroRight(){
			hero.x++;
			if(hero.x >= iX){
				hero.j++;
				incrimentIndex();
			}else
			{ setTimeout(moveHeroRight,iter); }
		}
		/*
		 *
		 */
		function moveHeroDown(){
			hero.y++;
			if(hero.y >= iY){
				hero.i++;
				incrimentIndex();
			}else
			{ setTimeout(moveHeroDown,iter); }
		}
		/*
		 *
		 */
		function moveHeroLeft(){
			hero.x--;
			if(hero.x <= iX){
				hero.j--;
				incrimentIndex();
			}else
			{ setTimeout(moveHeroLeft,iter); }
		}
		/*
		 *
		 */
		function moveHeroUp(){
			hero.y--;
			if(hero.y <= iY){
				hero.i--;
				incrimentIndex();
			}else
			{ setTimeout(moveHeroUp,iter); }
		}
		/*
		 *
		 */
		function noMoveHero(){
			if(true){
				incrimentIndex();
			}else
			{ setTimeout(noMoveHero,iter); }
		}
		/*
		 *
		 */
		function runMazeTests(){
			window.cancelAnimationFrame(animate);
			r = true;
			mapIndex = -1;
			dI = -1;
			numRight = 0;
			animate = window.requestAnimationFrame(drawRunScreen);
			runNextMap();
		}
		/*
		 *
		 */
		function incrimentIndex(){
			if(incIndex)
			{ index++; }
			setTimeout(navigateMaze,iter);
		}
		/*
		 *
		 */
		function runNextMap(){
			mapIndex++;
			var numMaps = mazeMaps.length;
			if(mapIndex < numMaps){
				statusString = "go";
				var startDoor = door[numDoors];
				if(startDoor.h == 3){
					hero.x = startDoor.x;
					hero.y = startDoor.y;
					hero.i = startDoor.i;
					hero.j = startDoor.j;
				}else{
					hero.x = hStartX;
					hero.y = hStartY;
					hero.i = 0;
					hero.j = 0;
				}
				iX = 0;
				iY = 0;
				map = mazeMaps[mapIndex];
				index = 0;
				setTimeout(navigateMaze,50 * iter);;
			}else{
				window.cancelAnimationFrame(animate);
				if(numRight == numMaps)
				{ statusString = "All tests pased!  The maze is correct!"; }
				else
				{ statusString = "Only " + numRight + " out of " + numMaps + " are correct.  This is not the correct maze"; }
				map = null;
				if(mouseIsDown)
				{ gameCanvas.addEventListener("mouseup", releaseMouse, false); }
				else
				{ gameCanvas.addEventListener("mousedown", levelMouseDown, false); }
				animate = window.requestAnimationFrame(drawScreen);
			}
		}
		/*
		 *
		 */
		function drawBackground(){
			var hmm = hight - (mid + 2);
			var border = 1;
			var leftBorder = 15;
			context.fillStyle = 'gray';
			context.fillRect(0, 0, width, hight);
			context.beginPath();
			context.rect(border, border, mid, hmm);
			context.rect(mid, border, width - mid, hmm);
			context.rect(border, hight-mid, width - 2 * border, mid - border);
			context.closePath();
			context.lineWidth = 7;
			context.strokeStyle = 'black';
			context.stroke();
			context.fillStyle = "black";
			context.font = "14px Georgia";
			context.textAlign = "start";
			context.textBaseline = "alphabetic";
			wrapText(instructions, leftBorder, hight-(mid-30), width - (2 * leftBorder));
			context.font = "16px Georgia";
			context.fillText(acceptConditions, leftBorder, hight-(mid-80));
			context.fillText(statusString, leftBorder, hight -(mid - 120));
			if((dI >= 0)&&(dI < numDoors)){
				var stateString;
				var ddIh = door[dI].h;
				if(ddIh === 1){
					if(door[dI].d)
					{ stateString = "right"; }
					else
					{ stateString = "left"; }
				}else if(ddIh === 2){
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
				context.fillText(stateString, leftBorder, runButton.y - 19);
			}
		}
		/*
		 *
		 */
		function drawCenter(){
			context.fillStyle = "yellow";
			for(var i = 0; i < numRows; i++){
				for(var j = 0; j < numColumns; j++)
				{ mDrawCircle(rooms[i][j]); }
			}
		}
		/*
		 *
		 */
		function drawFrames(){
			context.fillStyle = "darkRed";
			for(var i = 0; i < numRows; i++){
				for(var j = 0; j < numInWallColumns; j++)
				{ mDrawCircle(doorFrames[i][j]); }
			}
			context.fillStyle = "darkBlue";
			for(var i = 0; i < numInWallRows; i++){
				for(var j = 0; j < numColumns; j++)
				{ mDrawCircle(doorFrames2[i][j]); }
			}
		}
		/*
		 *
		 */
		function drawDoorTypes(){
			var dtLen = dTypes.length;
			for(var i = 0; i < dtLen; i++){
				context.fillStyle = dTypes[i].color;
				context.fillRect(dTypes[i].x, dTypes[i].y, dTypes[i].w, dTypes[i].h);
			}
		}
		/*
		 *
		 */
		function drawGrid(){
			var leftWall = mid + 40;
			var leftEdge = leftWall - 1;
			var topWall = 20;
			var lC = leftWall + 1 + roomSize * numColumns;
			var lR = topWall + roomSize * numRows;
			context.beginPath();
			for(var i = 0; i <= numRows; i++){
				context.moveTo(leftEdge,topWall + roomSize*i);
				context.lineTo(lC,topWall + roomSize*i);
			}
			for(var i = 0; i <= numColumns; i++){
				context.moveTo(leftWall + (roomSize*i),topWall);
				context.lineTo(leftWall + (roomSize*i),lR);
			}
			context.closePath();
			context.lineWidth = 2;
			context.strokeStyle = 'DarkSlateGray';
			context.stroke();
		}
		/*
		 *
		 */
		function drawScreen(){
			context.clearRect(0, 0, width, hight);
			drawBackground();
			mDrawRectangularButton(runButton,"Run");
			mDrawRectangularButton(menuButton,"Menu");
			mDrawRectangularButton(clearButton,"Clear");
			drawDoorTypes();
			drawGrid();
			drawDoors();
			if(r)
			{ mDrawCircle(hero); }
			animate = window.requestAnimationFrame(drawScreen);
		}
		/*
		 *
		 */
		function drawRunScreen(){
			context.clearRect(0, 0, width, hight);
			drawBackground();
			drawDoorTypes();
			drawGrid();
			drawDoors();
			mDrawCircle(hero);
			drawPath();
			animate = window.requestAnimationFrame(drawRunScreen);
		}
		/*
		 *
		 */
		function drawDoor(i){
			mDrawCircle(door[i]);
			context.strokeStyle = "black";
			context.lineWidth = 1;
			context.stroke();
		}
		/*
		 *
		 */
		function drawDoors(){
			var doorLen = door.length;
			for(var i = 0; i < doorLen;i++)
			{ drawDoor(i); }
			if(dI >= 0)
			{ drawDoor(dI); }	
		}
		/*
		 *
		 */
		function drawPath(){
			if(map !== null){
				var path = map.path;
				var pLen = path.length;
				var side = 10;
				var step = 20;
				var pIndex = index;
				if((pIndex < pLen)&&(pIndex >= 0)){
					for(var i = 0;i < 10;i++){
						for(var j = 0;j < 7;j++){
							context.fillStyle = path[pIndex];
							context.fillRect(10 + (step * j), 190 + (step * i), side, side);
							pIndex++;
							if(pIndex >= pLen)
							{ break; }
						}
						if(pIndex >= pLen)
						{ break; }
					}
				}
			}
		}
	}
}
