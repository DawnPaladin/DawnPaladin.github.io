'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

document.getElementById('animated-bg').width = window.innerWidth - 20;

var animatedBg = function () {
	var exports = {};
	exports.initCanvas = function () {
		exports.stage = new createjs.Stage('animated-bg');
		exports.stage.name = 'stage';
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
	exports.createShape = function (shapeType, x, y, color) {
		var shape = new createjs.Shape();
		shape.graphics.setStrokeStyle(strokeWeight).beginStroke(strokeColor).beginFill(color || fillColor);
		if (shapeType == "circle") {
			shape.graphics.drawCircle(0, 0, radius);
		} else if (shapeType == "square") {
			shape.graphics.drawRect(-radius, -radius, radius * 2, radius * 2);
		} else if (shapeType == "triangle") {
			shape.graphics.drawPolyStar(0, 0, radius, 3, 0, Math.random() * 360);
		} else {
			// random shape
			var r = Math.random();
			if (r > 0.6) {
				return exports.createShape("circle", x, y, color);
			} else if (r > 0.3) {
				return exports.createShape("square", x, y, color);
			} else {
				return exports.createShape("triangle", x, y, color);
			}
		}
		shape.name = "shape";
		shape.x = x;
		shape.y = y;
		shape.alpha = 0;
		shape.name = "shape";
		shape.type = shapeType;
		exports.stage.addChild(shape);
		exports.stage.update();
		return shape;
	};
	exports.createShapes = function (shapeType, quantity, color) {
		var minX = shapeZone.minX,
		    maxX = shapeZone.maxX,
		    minY = shapeZone.minY,
		    maxY = shapeZone.maxY;

		var shapes = [];
		for (var i = 0; i < quantity; i++) {
			var x = (maxX - minX) * Math.random() + minX;
			var y = (maxY - minY) * Math.random() + minY;
			var shape = exports.createShape(shapeType, x, y, color);
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
			xCorrection: 0
		};
		exports.registry.dockingTree.branches = [];
		exports.registry.dockingTree.leaves = [];
	};
	exports.extendDockingTree = function (treeLength) {
		var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

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
		var buildLeaf = function buildLeaf(xOrigin, yOrigin) {
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
	// Returns a series of 9 X/Y coordinates describing a circle path.
	exports.circlePath = function (minX, minY, maxX, maxY) {
		var midX = (minX + maxX) / 2;
		var midY = (minY + maxY) / 2;

		// These 4 paths are the same, they just start at different points.
		var path1 = [minX, midY, minX, maxY, midX, maxY, maxX, maxY, maxX, midY, maxX, minY, midX, minY, minX, minY, minX, midY];
		var path2 = [midX, maxY, maxX, maxY, maxX, midY, maxX, minY, midX, minY, minX, minY, minX, midY, minX, maxY, midX, maxY];
		var path3 = [maxX, midY, maxX, minY, midX, minY, minX, minY, minX, midY, minX, maxY, midX, maxY, maxX, maxY, maxX, midY];
		var path4 = [midX, minY, minX, minY, minX, midY, minX, maxY, midX, maxY, maxX, maxY, maxX, midY, maxX, minY, midX, minY];
		var paths = [path1, path2, path3, path4];

		return paths[Math.floor(Math.random() * 4)]; // choose one of the 4 paths randomly
	};
	exports.plusOrMinus = function (base, variance) {
		var randomSign = (0.5 - Math.random()) * 2; // between -1 and 1
		return base + variance * randomSign;
	};
	exports.removeOffstage = function () {
		var regDockingTree = exports.registry.dockingTree;
		for (var b = 0; b < regDockingTree.branches.length; b++) {
			var branch = regDockingTree.branches[b].object;
			if (branch && regDockingTree.object.localToGlobal(branch.x, branch.y).x < radius * -4) {
				var success = regDockingTree.object.removeChild(branch);
				regDockingTree.branches.splice(b, 1);
				break;
			}
		}
	};
	var shapeZone = {
		minX: 800,
		maxX: 1000,
		minY: 100,
		maxY: 300
	};
	exports.shapeCycle = {
		shapes: ["circle", "square", "triangle"],
		index: 0,
		getCurrentShape: function getCurrentShape() {
			return this.shapes[this.index];
		},
		advance: function advance() {
			this.index++;
			if (this.index >= this.shapes.length) this.index = 0;
		}
	};
	exports.run = function () {
		var _exports$shapes, _exports$shapes2, _exports$shapes3;

		createjs.MotionGuidePlugin.install();

		var Ease = createjs.Ease;
		var xOffsetPerSecond = -0.025;
		var treeExtensionInterval = 2000;
		var intervalBetweenBranches = 3;
		var timeOfLastTreeExtension = 0;

		function moveInCircle(shape, i, myPath) {
			var variance = 50;
			if (!myPath || myPath.length !== 27) {
				// if myPath isn't being passed in from a previous call
				var myPath = exports.circlePath(exports.plusOrMinus(shapeZone.minX, variance), exports.plusOrMinus(shapeZone.minY, variance), exports.plusOrMinus(shapeZone.maxX, variance), exports.plusOrMinus(shapeZone.maxY, variance));
			}
			createjs.Tween.get(shape).to({ alpha: 1 }, 500);
			createjs.Tween.get(shape).to({
				guide: { path: myPath }
			}, 7000).call(moveInCircle, [shape, i, myPath]);
		}
		function extractShape(shapeType) {
			var shapeIndex = exports.shapes.findIndex(function (shape) {
				return shape.type == shapeType;
			});
			if (shapeIndex == -1) throw new Error("Can't find shape of type " + shapeType); // TODO: remove

			var _exports$shapes$splic = exports.shapes.splice(shapeIndex, 1),
			    _exports$shapes$splic2 = _slicedToArray(_exports$shapes$splic, 1),
			    shape = _exports$shapes$splic2[0];

			return shape;
		}
		function attractShape(leafInfo, shapeType) {
			var leafObj = leafInfo.object;
			var container = leafObj.parent;
			var destination = container.localToGlobal(leafInfo.x, leafInfo.y);
			var shape = extractShape(shapeType);
			destination.x = destination.x + xOffsetPerSecond * 1000; // compensate for drift
			createjs.Tween.get(shape, { override: true }).to(destination, 1000, Ease.quintInOut).call(animationComplete, [shape, leafInfo, container]);
			createjs.Tween.get(shape).to({ alpha: 1 }, 500);
		}
		function tick(event) {
			var timeElapsed = createjs.Ticker.getTime(true);
			var trunkLength = exports.registry.dockingTree.trunk.nodes.length;
			var driftLock = false;
			if (!createjs.Ticker.getPaused()) {
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
							var currentShape = exports.shapeCycle.getCurrentShape();
							while (exports.registry.dockingTree.leaves.length > 0) {
								var leaf = exports.registry.dockingTree.leaves.pop();
								attractShape(leaf, currentShape);
							}
							var newShapes = exports.createShapes(currentShape, 3);
							newShapes.forEach(function (shape) {
								return moveInCircle(shape);
							});
							exports.shapes = exports.shapes.concat(newShapes);
							exports.shapeCycle.advance();
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
			window.addEventListener('blur', function () {
				createjs.Ticker.setPaused(true);
			});
			window.addEventListener('focus', function () {
				createjs.Ticker.setPaused(false);
			});
			exports.stage.update();
		}
		function animationComplete(shape, leaf, container) {
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
		exports.shapes = exports.createShapes("random", 18, "yellow");
		(_exports$shapes = exports.shapes).push.apply(_exports$shapes, _toConsumableArray(exports.createShapes("square", 3, "red")));
		(_exports$shapes2 = exports.shapes).push.apply(_exports$shapes2, _toConsumableArray(exports.createShapes("circle", 3, "red")));
		(_exports$shapes3 = exports.shapes).push.apply(_exports$shapes3, _toConsumableArray(exports.createShapes("triangle", 3, "red")));
		exports.shapes.forEach(function (shape) {
			return moveInCircle(shape);
		});
		var leavesAttached = 0;
		while (exports.registry.dockingTree.leaves.length > 0) {
			var leaf = exports.registry.dockingTree.leaves.pop();
			attractShape(leaf, exports.shapeCycle.getCurrentShape());
			leavesAttached++;
			if (leavesAttached % 3 == 0) exports.shapeCycle.advance(); // We want to attract 3 of each shape.
		}
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Ticker.setFPS(30);
	}();
	return exports;
}();