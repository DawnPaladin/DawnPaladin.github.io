"use strict";

document.getElementById('animated-bg').width = window.innerWidth - 20;

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
	const strokeWeight = 7;
	const strokeColor = "white";
	const fillColor = "#292929";
	const radius = 17;
	const nodeRadius = 7;
	const treeColor = "#f89c2a";
	const nodeColor = fillColor;
	const trunkSegmentWidth = 8;
	const trunkSegmentLength = 50; // originates at the center of the previous node
	exports.createRandomShape = function (x, y) {
		var shape = new createjs.Shape();
		shape.graphics.setStrokeStyle(strokeWeight).beginStroke(strokeColor).beginFill(fillColor);
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
		return shape;
	};
	exports.createRandomShapes = function (minX, maxX, minY, maxY, quantity) {
		var shapes = [];
		var x, y;
		for (var i = 0; i < quantity; i++) {
			x = (maxX - minX) * Math.random() + minX;
			y = (maxY - minY) * Math.random() + minY;
			var shape = exports.createRandomShape(x, y);
			shapes.push(shape);
		}
		return shapes;
	};
	exports.registry = {};
	exports.initDockingTree = function (yOrigin) {
		var dockingTree = new createjs.Container();
		dockingTree.name = "dockingTree";
		dockingTree.y = yOrigin;
		exports.stage.addChild(dockingTree);
		var origin = new createjs.Shape();
		origin.graphics.beginFill(treeColor).drawCircle(0, 0, nodeRadius);
		dockingTree.addChild(origin);
		var trunk = new createjs.Container();
		trunk.name = "trunk";
		dockingTree.addChild(trunk);
		exports.stage.update();

		exports.registry.trunkCursor = 0;
		exports.registry.dockingTree = {
			object: dockingTree,
			origin: {
				x: 0,
				y: yOrigin
			},
			trunk: {
				object: trunk,
				nodes: []
			},
			paused: true
		};
		exports.registry.dockingTree.branches = [];
		exports.registry.dockingTree.leaves = [];
	};
	exports.extendDockingTree = function (treeLength) {
		for (let i = 0; i < treeLength; i++) {
			var trunk = exports.registry.dockingTree.trunk.object;
			let trunkSegment = new createjs.Shape();
			trunkSegment.graphics.beginFill(treeColor).drawRect(exports.registry.trunkCursor, -0.5 * trunkSegmentWidth, trunkSegmentLength, trunkSegmentWidth);
			trunk.addChild(trunkSegment);
			exports.registry.trunkCursor += trunkSegmentLength;

			let trunkNode = new createjs.Shape();
			trunkNode.graphics.beginFill(treeColor).drawPolyStar(exports.registry.trunkCursor, 0, nodeRadius, 6, 0);
			trunk.addChild(trunkNode);
			var registryEntry = {
				type: "trunkSegmentDescription",
				x: exports.registry.trunkCursor,
				y: 0,
				object: trunkNode
			};
			exports.registry.dockingTree.trunk.nodes.push(registryEntry);
		}
		exports.stage.update();
	};
	exports.buildDescendingBranch = function (xOrigin, yOrigin) {
		var buildLeaf = function (xOrigin, yOrigin) {
			const stemWidth = 2;
			const stemLength = trunkSegmentLength;
			var leafStem = new createjs.Shape();
			leafStem.graphics.beginFill(treeColor).drawRect(xOrigin, yOrigin - stemWidth / 2, stemLength, stemWidth);
			branch.addChild(leafStem);
			const leafRadius = nodeRadius;
			const leafStrokeWeight = 2;
			var leaf = new createjs.Shape();
			var leafCenterX = xOrigin + stemLength;
			var leafCenterY = yOrigin;
			leaf.graphics.setStrokeStyle(leafStrokeWeight);
			leaf.graphics.beginStroke(treeColor);
			leaf.graphics.beginFill(fillColor).drawCircle(leafCenterX, leafCenterY, leafRadius);
			branch.addChild(leaf);
			var leafRegistryEntry = {
				type: "leafDescription",
				branch: branch,
				x: leafCenterX,
				y: leafCenterY,
				object: leaf
			};
			exports.registry.dockingTree.leaves.push(leafRegistryEntry);
		};
		var branch = new createjs.Container();
		exports.registry.dockingTree.object.addChild(branch);

		branch.x = xOrigin;
		branch.y = yOrigin;
		const branchLength = 3;
		const branchSegmentLength = trunkSegmentLength;
		const branchSegmentWidth = trunkSegmentWidth;

		var branchRegistryEntry = {
			type: "branchDescription",
			x: xOrigin,
			y: yOrigin,
			object: branch,
			nodes: []
		};

		var branchCursor = 0;
		for (let i = 0; i < branchLength; i++) {
			// create the segments
			let branchSegment = new createjs.Shape();
			branchSegment.graphics.beginFill(treeColor).drawRect(branchSegmentWidth * -0.5, branchCursor, branchSegmentWidth, branchSegmentLength);
			branch.addChild(branchSegment);
			branchCursor += branchSegmentLength;
		}
		branchCursor = branchSegmentLength; // go back and create the nodes and documentation
		for (let i = 0; i < branchLength; i++) {
			let branchNode = new createjs.Shape();
			branchNode.graphics.beginFill(treeColor).drawPolyStar(0, branchCursor, nodeRadius, 6, 0, 90);
			branch.addChild(branchNode);

			var nodeRegistryEntry = {
				type: "branchNodeDescription",
				x: 0,
				y: branchCursor,
				object: branchNode
			};
			branchRegistryEntry.nodes.push(nodeRegistryEntry);

			buildLeaf(0, branchCursor);

			branchCursor += branchSegmentLength;
		}
		exports.registry.dockingTree.branches.push(branchRegistryEntry);
		exports.stage.update();
	};
	exports.circlePath = function (minX, minY, maxX, maxY) {
		var midX = (minX + maxX) / 2;
		var midY = (minY + maxY) / 2;
		return [minX, midY, minX, maxY, midX, maxY, maxX, maxY, maxX, midY, maxX, minY, midX, minY, minX, minY, minX, midY];
	};
	exports.plusOrMinus = function (base, variance) {
		var randomSign = (0.5 - Math.random()) * 2; // between -1 and 1
		return base + variance * randomSign;
	};
	exports.animTest = function () {
		const Ease = createjs.Ease;
		const xOffsetPerSecond = -0.025;
		const treeExtensionInterval = 2000;
		const intervalBetweenBranches = 3;
		var timeOfLastTreeExtension = 0;
		function tick(event) {
			var timeElapsed = createjs.Ticker.getTime();
			var trunkLength = exports.registry.dockingTree.trunk.nodes.length;
			if (!exports.registry.dockingTree.paused) {
				// drift tree to the left
				var xOffset = timeElapsed * xOffsetPerSecond;
				exports.registry.dockingTree.object.x = xOffset;

				// extend tree periodically
				var timeSinceLastTreeExtension = timeElapsed - timeOfLastTreeExtension;
				if (timeSinceLastTreeExtension > treeExtensionInterval) {
					exports.extendDockingTree(1);
					timeOfLastTreeExtension = timeElapsed;
					if (trunkLength - intervalBetweenBranches >= exports.registry.dockingTree.lastNodeWithABranch) {
						exports.buildDescendingBranch(exports.registry.dockingTree.trunk.nodes[trunkLength].x, 0);
						exports.registry.dockingTree.lastNodeWithABranch = trunkLength;
					}
				}
			}
			exports.stage.update();
		}
		function animationComplete(shape, leaf, container) {
			shape.x = leaf.x;
			shape.y = leaf.y;
			container.addChild(shape);
		}

		exports.initDockingTree(100);
		exports.extendDockingTree(7);
		exports.buildDescendingBranch(exports.registry.dockingTree.trunk.nodes[0].x, 0);
		exports.buildDescendingBranch(exports.registry.dockingTree.trunk.nodes[3].x, 0);
		exports.buildDescendingBranch(exports.registry.dockingTree.trunk.nodes[6].x, 0);
		exports.registry.dockingTree.lastNodeWithABranch = 6;
		var shapeZone = {
			minX: 800,
			maxX: 1000,
			minY: 100,
			maxY: 300
		};
		var shapes = exports.createRandomShapes(shapeZone.minX, shapeZone.maxX, shapeZone.minY, shapeZone.maxY, 18);
		var leaves = exports.registry.dockingTree.leaves;
		createjs.MotionGuidePlugin.install();
		// shapes.forEach(function(shape, i) {
		// 	const variance = 50;
		// 	var myPath = exports.circlePath(
		// 		exports.plusOrMinus(shapeZone.minX, variance),
		// 		exports.plusOrMinus(shapeZone.minY, variance),
		// 		exports.plusOrMinus(shapeZone.maxX, variance),
		// 		exports.plusOrMinus(shapeZone.maxY, variance)
		// 	);
		// 	createjs.Tween.get(shape).to({
		// 		guide: {
		// 			path: myPath
		// 		}
		// 	}, 7000);
		// });
		leaves.forEach(function (leaf, i) {
			var leafInfo = leaves[i];
			var leafObj = leafInfo.object;
			var container = leafObj.parent;
			var destination = container.localToGlobal(leafInfo.x, leafInfo.y);
			var shape = shapes.shift();
			destination.x = destination.x + xOffsetPerSecond * 1000; // compensate for drift
			createjs.Tween.get(shape).to(destination, 1000, Ease.quintInOut).call(animationComplete, [shape, leafInfo, container]);
		});
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Ticker.setFPS(60);
	}();
	return exports;
}();