document.getElementById('animated-bg').width = window.innerWidth - 20;

var animatedBg = function () {
	var exports = {};
	exports.initCanvas = function () {
		exports.stage = new createjs.Stage('animated-bg');
		exports.stage.name = `stage`;
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
	var strokeWeight = 7;
	var strokeColor = "white";
	var fillColor = "#1f0009";
	var radius = 17;
	var nodeRadius = 7;
	var treeColor = "#f89c2a";
	var nodeColor = fillColor;
	var trunkSegmentWidth = 8;
	var trunkSegmentLength = 50; // originates at the center of the previous node
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
		shape.alpha = 0;
		shape.name = "shape";
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
			paused: false,
			xCorrection: 0
		};
		exports.registry.dockingTree.branches = [];
		exports.registry.dockingTree.leaves = [];
	};
	exports.extendDockingTree = function (treeLength, callback) {
		if (!callback) {
			callback = function () {};
		}
		for (var i = 0; i < treeLength; i++) {
			var trunk = exports.registry.dockingTree.trunk.object;
			var trunkSegment = new createjs.Shape();
			trunkSegment.name = "trunkSegment";
			trunkSegment.graphics.beginFill(treeColor).drawRect(0, -0.5 * trunkSegmentWidth, trunkSegmentLength, trunkSegmentWidth).moveTo(exports.registry.trunkCursor);
			trunk.addChild(trunkSegment);

			var trunkNode = new createjs.Shape();
			trunkNode.name = "trunkNode";
			trunkNode.graphics.beginFill(treeColor).drawPolyStar(0, 0, nodeRadius, 6, 0).moveTo(exports.registry.trunkCursor + trunkSegmentLength);
			trunk.addChild(trunkNode);
			createjs.Tween.get(trunkSegment).to({ x: exports.registry.trunkCursor }, 1000, createjs.Ease.quintInOut);
			createjs.Tween.get(trunkNode).to({ x: exports.registry.trunkCursor + trunkSegmentLength }, 1000, createjs.Ease.quintInOut).call(callback);
			var registryEntry = {
				type: "trunkSegmentDescription",
				x: exports.registry.trunkCursor + trunkSegmentLength,
				y: 0,
				object: trunkNode
			};
			exports.registry.dockingTree.trunk.nodes.push(registryEntry);
			exports.registry.trunkCursor += trunkSegmentLength;
		}
		exports.stage.update();
	};
	exports.buildDescendingBranch = function (xOrigin, yOrigin) {
		var buildLeaf = function (xOrigin, yOrigin) {
			var stemWidth = 2;
			var stemLength = trunkSegmentLength;
			var leafStem = new createjs.Shape();
			leafStem.name = "leafStem";
			leafStem.graphics.beginFill(treeColor).drawRect(xOrigin, 0, stemLength, stemWidth);
			createjs.Tween.get(leafStem).to({ y: yOrigin - stemWidth / 2 }, 1000, createjs.Ease.quintInOut);
			branch.addChild(leafStem);
			var leafRadius = nodeRadius;
			var leafStrokeWeight = 2;
			var leaf = new createjs.Shape();
			var leafCenterX = xOrigin + stemLength;
			var leafCenterY = yOrigin;
			leaf.name = "leaf";
			leaf.graphics.setStrokeStyle(leafStrokeWeight);
			leaf.graphics.beginStroke(treeColor);
			leaf.graphics.beginFill(fillColor).drawCircle(leafCenterX, 0, leafRadius);
			createjs.Tween.get(leaf).to({ y: leafCenterY }, 1000, createjs.Ease.quintInOut);
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

		branch.name = "branch";
		branch.x = xOrigin;
		branch.y = yOrigin;
		var branchLength = 3;
		var branchSegmentLength = trunkSegmentLength;
		var branchSegmentWidth = trunkSegmentWidth;

		var branchRegistryEntry = {
			type: "branchDescription",
			x: xOrigin,
			y: yOrigin,
			object: branch,
			nodes: []
		};

		var branchCursor = 0;
		for (var i = 0; i < branchLength; i++) {
			// create the segments
			var branchSegment = new createjs.Shape();
			branchSegment.name = "branchSegment";
			branchSegment.graphics.beginFill(treeColor).drawRect(branchSegmentWidth * -0.5, 0, branchSegmentWidth, branchSegmentWidth);
			createjs.Tween.get(branchSegment).to({ y: branchCursor, scaleY: branchSegmentLength / branchSegmentWidth }, 1000, createjs.Ease.quintInOut);
			branch.addChild(branchSegment);
			branchCursor += branchSegmentLength;
		}
		branchCursor = branchSegmentLength; // go back and create the nodes and documentation
		for (var j = 0; j < branchLength; j++) {
			var branchNode = new createjs.Shape();
			branchNode.name = "branchNode";
			branchNode.graphics.beginFill(treeColor).drawPolyStar(0, 0, nodeRadius, 6, 0, 90);
			createjs.Tween.get(branchNode).to({ y: branchCursor }, 1000, createjs.Ease.quintInOut);
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
	exports.removeOffstage = function () {
		var branch, success;
		var regDockingTree = exports.registry.dockingTree;
		for (var b = 0; b < regDockingTree.branches.length; b++) {
			branch = regDockingTree.branches[b].object;
			if (branch && regDockingTree.object.localToGlobal(branch.x, branch.y).x < radius * -4) {
				success = regDockingTree.object.removeChild(branch);
				regDockingTree.branches.splice(b, 1);
				break;
			}
		}
	};
	exports.run = function () {
		createjs.MotionGuidePlugin.install();

		var Ease = createjs.Ease;
		var xOffsetPerSecond = -0.025;
		var treeExtensionInterval = 2000;
		var intervalBetweenBranches = 3;
		var timeOfLastTreeExtension = 0;

		function moveInCircle(shape, i, myPath) {
			var variance = 50;
			if (!myPath || myPath.length !== 18) {
				// if myPath isn't being passed in from a previous call
				var myPath = exports.circlePath( // eslint-disable-line
				exports.plusOrMinus(shapeZone.minX, variance), exports.plusOrMinus(shapeZone.minY, variance), exports.plusOrMinus(shapeZone.maxX, variance), exports.plusOrMinus(shapeZone.maxY, variance));
			}
			createjs.Tween.get(shape).to({ alpha: 1 }, 500);
			createjs.Tween.get(shape).to({
				guide: { path: myPath }
			}, 7000) // eslint-disable-line
			.call(moveInCircle, [shape, i, myPath]);
		}
		function attractShape(leafInfo) {
			var leafObj = leafInfo.object;
			var container = leafObj.parent;
			var destination = container.localToGlobal(leafInfo.x, leafInfo.y);
			var shape = exports.shapes.shift();
			destination.x = destination.x + xOffsetPerSecond * 1000; // compensate for drift
			createjs.Tween.get(shape, { override: true }).to(destination, 1000, Ease.quintInOut).call(animationCompvare, [shape, leafInfo, container]);
			createjs.Tween.get(shape).to({ alpha: 1 }, 500);
		}
		function tick(event) {
			var timeElapsed = createjs.Ticker.getTime();
			var trunkLength = exports.registry.dockingTree.trunk.nodes.length;
			var driftLock = false;
			if (!exports.registry.dockingTree.paused) {
				// drift tree to the left
				var xOffset = timeElapsed * xOffsetPerSecond + exports.registry.dockingTree.xCorrection;
				exports.registry.dockingTree.object.x = xOffset;

				// extend tree periodically
				var timeSinceLastTreeExtension = timeElapsed - timeOfLastTreeExtension;
				if (timeSinceLastTreeExtension > treeExtensionInterval) {
					exports.removeOffstage();
					exports.extendDockingTree(1, function () {
						if (trunkLength - intervalBetweenBranches >= exports.registry.dockingTree.lastNodeWithABranch) {
							exports.buildDescendingBranch(exports.registry.dockingTree.trunk.nodes[trunkLength].x, 0);
							exports.registry.dockingTree.lastNodeWithABranch = trunkLength;
							while (exports.registry.dockingTree.leaves.length > 0) {
								var leaf = exports.registry.dockingTree.leaves.pop();
								attractShape(leaf);
							}
							var newShapes = exports.createRandomShapes(shapeZone.minX, shapeZone.maxX, shapeZone.minY, shapeZone.maxY, 3);
							newShapes.forEach(moveInCircle);
							exports.shapes = exports.shapes.concat(newShapes);
						}
					});
					timeOfLastTreeExtension = timeElapsed;
					// auto-throttle rate of drift
					var nodes = exports.registry.dockingTree.trunk.nodes;
					var lastNode = nodes[nodes.length - 1];
					var treeTip = exports.registry.dockingTree.object.localToGlobal(lastNode.x, lastNode.y);
					//console.log("Tree tip:", treeTip.x);
					if (treeTip.x < 350) {
						exports.registry.dockingTree.xCorrection += 0.5;
						//console.log("Docking tree x-correction raised to", exports.registry.dockingTree.xCorrection);
					} else if (treeTip.x > 355) {
						exports.registry.dockingTree.xCorrection -= 1;
						//console.log("Docking tree x-correction lowered to", exports.registry.dockingTree.xCorrection);
					}
				}
			} // end if paused
			window.onfocus = function () {
				var treeRoot = exports.registry.dockingTree.object.x;
				var trunkPixelLength = trunkLength * trunkSegmentLength;
				var trunkTarget = 300;
				var drift = trunkTarget - trunkPixelLength - treeRoot;
				if (drift > 100 && driftLock == false) {
					exports.registry.dockingTree.xCorrection += drift;
					driftLock = true; // onfocus() gets called twice in Safari. Need to keep the above line from being run twice.
					console.log({
						name: "Drift correction",
						drift: drift,
						trunkTarget: trunkTarget,
						trunkPixelLength: trunkPixelLength,
						treeRoot: treeRoot
					});
				}
			};
			exports.stage.update();
		}
		function animationCompvare(shape, leaf, container) {
			shape.x = leaf.x;
			shape.y = leaf.y;
			container.addChild(shape);
		}

		exports.initDockingTree(150);
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
		exports.shapes = exports.createRandomShapes(shapeZone.minX, shapeZone.maxX, shapeZone.minY, shapeZone.maxY, 18);
		window.setTimeout(function () {
			exports.shapes.forEach(moveInCircle);
		}, 1000);
		while (exports.registry.dockingTree.leaves.length > 0) {
			var leaf = exports.registry.dockingTree.leaves.pop();
			attractShape(leaf);
		}
		exports.registry.dockingTree.leaves;
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Ticker.setFPS(30);
	}();
	return exports;
}();
