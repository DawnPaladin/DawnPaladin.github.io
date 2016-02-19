document.getElementById('animated-bg').width = window.innerWidth;

var animatedBg = function () {
	var exports = {};
	exports.initCanvas = function () {
		exports.stage = new createjs.Stage('animated-bg');
		exports.stage.update();
	}();
	exports.updateCanvas = function () {
		exports.stage.update();
	};
	exports.updateCanvasWidth = function () {
		document.getElementById('animated-bg').width = window.innerWidth;
		exports.updateCanvas();
	};
	window.addEventListener('resize', exports.updateCanvasWidth);
	exports.testCanvas = function () {
		var circle = new createjs.Shape();
		circle.graphics.beginFill("red").drawCircle(0, 0, 40);
		circle.x = circle.y = 50;
		exports.stage.addChild(circle);
		exports.stage.update();
	};
	var strokeWeight = 10;
	var strokeColor = "silver";
	var fillColor = "white";
	var radius = 20;
	exports.createRandomShape = function (x, y) {
		var shape = new createjs.Shape();
		shape.graphics.setStrokeStyle("8").beginStroke("silver").beginFill("white");
		var r = Math.random();
		if (r > 0.6) {
			// circle
			shape.graphics.drawCircle(0, 0, radius);
		} else if (r > 0.3) {
			// square
			shape.graphics.drawRect(-radius, -radius, radius * 2, radius * 2);
		} else {
			shape.graphics.drawPolyStar(0, 0, radius, 3, 0, r * 360);
		}
		shape.x = x;
		shape.y = y;
		exports.stage.addChild(shape);
		exports.stage.update();
	};
	exports.createRandomShapes = function (minX, maxX, minY, maxY, quantity) {
		var x, y;
		for (var i = 0; i < quantity; i++) {
			x = (maxX - minX) * Math.random() + minX;
			y = (maxY - minY) * Math.random() + minY;
			exports.createRandomShape(x, y);
		}
	};
	exports.buildDockingTree = function (yOrigin, treeLength) {
		const nodeRadius = 10;
		const treeColor = "silver";
		const trunkSegmentWidth = 8;
		const trunkSegmentLength = 50; // originates at the center of the previous node

		var dockingTree = new createjs.Container();
		dockingTree.name = "dockingTree";
		dockingTree.y = yOrigin;
		var origin = new createjs.Shape();
		origin.graphics.beginFill(treeColor).drawCircle(0, 0, nodeRadius);
		dockingTree.addChild(origin);
		var trunk = new createjs.Container();
		trunk.name = "trunk";
		dockingTree.addChild(trunk);
		var trunkCursor = 0;

		for (let i = 0; i < treeLength; i++) {
			let trunkSegment = new createjs.Shape();
			trunkSegment.graphics.beginFill(treeColor).drawRect(trunkCursor, -0.5 * trunkSegmentWidth, trunkSegmentLength, trunkSegmentWidth);
			trunk.addChild(trunkSegment);
			trunkCursor = (i + 1) * trunkSegmentLength;

			let trunkNode = new createjs.Shape();
			trunkNode.graphics.beginFill(treeColor).drawCircle(trunkCursor, 0, nodeRadius);
			trunk.addChild(trunkNode);
		}

		exports.stage.addChild(dockingTree);
		exports.stage.update();
	};
	exports.buildDockingTree(300, 10);
	return exports;
}();