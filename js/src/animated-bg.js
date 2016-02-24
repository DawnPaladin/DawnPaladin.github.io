document.getElementById('animated-bg').width = window.innerWidth;

var animatedBg = (function() {
	var exports = {};
	exports.initCanvas = (function() {
		exports.stage = new createjs.Stage('animated-bg');
		exports.stage.update();
	})();
	exports.updateCanvas = function() {
		exports.stage.update();
	};
	exports.updateCanvasWidth = function() {
		document.getElementById('animated-bg').width = window.innerWidth;
		exports.updateCanvas();
	};
	window.addEventListener('resize', exports.updateCanvasWidth);
	exports.testCanvas = function() {
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
		if (r > 0.6) { // circle
			shape.graphics.drawCircle(0, 0, radius);
		} else if (r > 0.3) { // square
			shape.graphics.drawRect(-radius, -radius, radius*2, radius*2);
		} else {
			shape.graphics.drawPolyStar(0, 0, radius, 3, 0, r * 360);
		}
		shape.x = x;
		shape.y = y;
		exports.stage.addChild(shape);
		exports.stage.update();
	};
	exports.createRandomShapes = function(minX, maxX, minY, maxY, quantity) {
		var x, y;
		for (var i = 0; i < quantity; i++) {
			x = ((maxX - minX) * Math.random()) + minX;
			y = ((maxY - minY) * Math.random()) + minY;
			exports.createRandomShape(x, y);
		}
	};
	exports.registry = {};
	exports.buildDockingTree = function(yOrigin, treeLength) {
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

		exports.registry.dockingTree = {
			object: dockingTree,
			origin: {
				x: 0,
				y: yOrigin
			},
			trunk: {
				object: trunk,
				nodes: [],
			}
		};

		for (let i = 0; i < treeLength; i++) {
			let trunkSegment = new createjs.Shape();
			trunkSegment
				.graphics.beginFill(treeColor)
				.drawRect(trunkCursor, -0.5*trunkSegmentWidth, trunkSegmentLength, trunkSegmentWidth);
			trunk.addChild(trunkSegment);
			trunkCursor = (i + 1) * trunkSegmentLength;

			let trunkNode = new createjs.Shape();
			trunkNode.graphics.beginFill(treeColor).drawCircle(trunkCursor, 0, nodeRadius);
			trunk.addChild(trunkNode);
			var registryEntry = {
				type: "trunkSegmentDescription",
				x: trunkCursor,
				y: 0,
				object: trunkNode,
			};
			exports.registry.dockingTree.trunk.nodes.push(registryEntry);
		}

		exports.stage.addChild(dockingTree);
		exports.stage.update();

		exports.registry.dockingTree.branches = [];
		var buildDescendingBranch = function(xOrigin, yOrigin) {
			var branch = new createjs.Container();
			dockingTree.addChild(branch);

			branch.x = xOrigin;
			branch.y = yOrigin;
			const branchLength = 3;
			const branchSegmentLength = trunkSegmentLength;
			const branchSegmentWidth = trunkSegmentWidth;

			var branchRegistryEntry = {
				type: "branchDescription",
				x: xOrigin,
				y: yOrigin,
				nodes: [],
			};

			var branchCursor = 0;
			for (let i = 0; i < branchLength; i++) { // create the segments
				let branchSegment = new createjs.Shape();
				branchSegment
					.graphics.beginFill(treeColor)
					.drawRect(branchSegmentWidth * -0.5, branchCursor, branchSegmentWidth, branchSegmentLength);
				branch.addChild(branchSegment);
				branchCursor += branchSegmentLength;
			}
			branchCursor = branchSegmentLength; // go back and create the nodes and documentation
			for (let i = 0; i < branchLength; i++) {
				let branchNode = new createjs.Shape();
				branchNode
					.graphics.beginFill(treeColor)
					.drawCircle(0, branchCursor, nodeRadius);
				branch.addChild(branchNode);

				var nodeRegistryEntry = {
					type: "branchNodeDescription",
					x: 0,
					y: branchCursor,
					object: branchNode,
				};
				branchRegistryEntry.nodes.push(nodeRegistryEntry);

				branchCursor += branchSegmentLength;
			}
			exports.registry.dockingTree.branches.push(branchRegistryEntry);
			exports.stage.update();
		};
		buildDescendingBranch(exports.registry.dockingTree.trunk.nodes[1].x, 0);
	};
	exports.buildDockingTree(100, 10);
	return exports;
})();
