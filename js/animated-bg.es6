document.getElementById('animated-bg').width = window.innerWidth - 20;

const animatedBg = function() {
	const exports = {};
	exports.initCanvas = function() {
		exports.stage = new createjs.Stage('animated-bg');
		exports.stage.name = 'stage';
		exports.stage.update();
	}();
	exports.updateCanvas = function() {
		exports.stage.update();
	};
	exports.updateCanvasWidth = function() {
		document.getElementById('animated-bg').width = window.innerWidth;
		exports.updateCanvas();
	};
	window.addEventListener('resize', exports.updateCanvasWidth);
	const strokeWeight = 7;
	const strokeColor = "white";
	const fillColor = "#1f0009";
	const radius = 17;
	const nodeRadius = 7;
	const treeColor = "#f89c2a";
	const nodeColor = fillColor;
	const trunkSegmentWidth = 8;
	const trunkSegmentLength = 50; // originates at the center of the previous node
	exports.createShape = function(shapeType, x, y, color) {
		const shape = new createjs.Shape();
		shape.graphics.setStrokeStyle(strokeWeight).beginStroke(strokeColor).beginFill(color || fillColor);
		if (shapeType == "circle") {
			shape.graphics.drawCircle(0, 0, radius);
		} else if (shapeType == "square") {
			shape.graphics.drawRect(-radius, -radius, radius * 2, radius * 2);
		} else if (shapeType == "triangle") {
			shape.graphics.drawPolyStar(0, 0, radius, 3, 0, 270);
		} else { // random shape
			const r = Math.random();
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
		shape.rotation = 0;
		shape.name = "shape";
		shape.type = shapeType;
		exports.stage.addChild(shape);
		exports.stage.update();
		return shape;
	}
	exports.createShapes = function(shapeType, quantity, color) {
		const {minX, maxX, minY, maxY} = shapeZone;
		const shapes = [];
		for (let i = 0; i < quantity; i++) {
			const x = (maxX - minX) * Math.random() + minX;
			const y = (maxY - minY) * Math.random() + minY;
			const shape = exports.createShape(shapeType, x, y, color);
			shapes.push(shape);
		}
		return shapes;
	}
	exports.registry = {};
	exports.initDockingTree = function(yOrigin) {
		const dockingTree = new createjs.Container();
		dockingTree.name = "dockingTree";
		dockingTree.y = yOrigin;
		exports.stage.addChild(dockingTree);
		const origin = new createjs.Shape();
		origin.graphics.beginFill(treeColor).drawCircle(0, 0, nodeRadius);
		dockingTree.addChild(origin);
		const trunk = new createjs.Container();
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
	exports.extendDockingTree = function(treeLength, callback = function() {}) {
		for (let i = 0; i < treeLength; i++) {
			const trunk = exports.registry.dockingTree.trunk.object;
			const trunkSegment = new createjs.Shape();
			trunkSegment.name = "trunkSegment";
			trunkSegment.graphics.beginFill(treeColor).drawRect(0, -0.5 * trunkSegmentWidth, trunkSegmentLength, trunkSegmentWidth).moveTo(exports.registry.trunkCursor);
			trunk.addChild(trunkSegment);

			const trunkNode = new createjs.Shape();
			trunkNode.name = "trunkNode";
			trunkNode.graphics.beginFill(treeColor).drawPolyStar(0, 0, nodeRadius, 6, 0).moveTo(exports.registry.trunkCursor + trunkSegmentLength);
			trunk.addChild(trunkNode);
			createjs.Tween.get(trunkSegment).to({ x: exports.registry.trunkCursor }, 1000, createjs.Ease.quintInOut);
			createjs.Tween.get(trunkNode).to({ x: exports.registry.trunkCursor + trunkSegmentLength }, 1000, createjs.Ease.quintInOut).call(callback);
			const registryEntry = {
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
	exports.buildDescendingBranch = function(xOrigin, yOrigin) {
		const buildLeaf = function(xOrigin, yOrigin) {
			const stemWidth = 2;
			const stemLength = trunkSegmentLength;
			const leafStem = new createjs.Shape();
			leafStem.name = "leafStem";
			leafStem.graphics.beginFill(treeColor).drawRect(xOrigin, 0, stemLength, stemWidth);
			createjs.Tween.get(leafStem).to({ y: yOrigin - stemWidth / 2 }, 1000, createjs.Ease.quintInOut);
			branch.addChild(leafStem);
			const leafRadius = nodeRadius;
			const leafStrokeWeight = 2;
			const leaf = new createjs.Shape();
			const leafCenterX = xOrigin + stemLength;
			const leafCenterY = yOrigin;
			leaf.name = "leaf";
			leaf.graphics.setStrokeStyle(leafStrokeWeight);
			leaf.graphics.beginStroke(treeColor);
			leaf.graphics.beginFill(fillColor).drawCircle(leafCenterX, 0, leafRadius);
			createjs.Tween.get(leaf).to({ y: leafCenterY }, 1000, createjs.Ease.quintInOut);
			branch.addChild(leaf);
			const leafRegistryEntry = {
				type: "leafDescription",
				branch: branch,
				x: leafCenterX,
				y: leafCenterY,
				object: leaf
			};
			exports.registry.dockingTree.leaves.push(leafRegistryEntry);
		};
		const branch = new createjs.Container();
		exports.registry.dockingTree.object.addChild(branch);

		branch.name = "branch";
		branch.x = xOrigin;
		branch.y = yOrigin;
		const branchLength = 3;
		const branchSegmentLength = trunkSegmentLength;
		const branchSegmentWidth = trunkSegmentWidth;

		const branchRegistryEntry = {
			type: "branchDescription",
			x: xOrigin,
			y: yOrigin,
			object: branch,
			nodes: []
		};

		let branchCursor = 0;
		for (let i = 0; i < branchLength; i++) {
			// create the segments
			const branchSegment = new createjs.Shape();
			branchSegment.name = "branchSegment";
			branchSegment.graphics.beginFill(treeColor).drawRect(branchSegmentWidth * -0.5, 0, branchSegmentWidth, branchSegmentWidth);
			createjs.Tween.get(branchSegment).to({ y: branchCursor, scaleY: branchSegmentLength / branchSegmentWidth }, 1000, createjs.Ease.quintInOut);
			branch.addChild(branchSegment);
			branchCursor += branchSegmentLength;
		}
		branchCursor = branchSegmentLength; // go back and create the nodes and documentation
		for (let j = 0; j < branchLength; j++) {
			const branchNode = new createjs.Shape();
			branchNode.name = "branchNode";
			branchNode.graphics.beginFill(treeColor).drawPolyStar(0, 0, nodeRadius, 6, 0, 90);
			createjs.Tween.get(branchNode).to({ y: branchCursor }, 1000, createjs.Ease.quintInOut);
			branch.addChild(branchNode);

			const nodeRegistryEntry = {
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
	exports.circlePath = function(minX, minY, maxX, maxY) {
		const midX = (minX + maxX) / 2;
		const midY = (minY + maxY) / 2;

		// These 4 paths are the same, they just start at different points.
		const path1 = [minX, midY, minX, maxY, midX, maxY, maxX, maxY, maxX, midY, maxX, minY, midX, minY, minX, minY, minX, midY];
		const path2 = [midX, maxY, maxX, maxY, maxX, midY, maxX, minY, midX, minY, minX, minY, minX, midY, minX, maxY, midX, maxY];
		const path3 = [maxX, midY, maxX, minY, midX, minY, minX, minY, minX, midY, minX, maxY, midX, maxY, maxX, maxY, maxX, midY];
		const path4 = [midX, minY, minX, minY, minX, midY, minX, maxY, midX, maxY, maxX, maxY, maxX, midY, maxX, minY, midX, minY];
		const paths = [path1, path2, path3, path4];

		return paths[Math.floor(Math.random() * 4)]; // choose one of the 4 paths randomly
	};
	exports.plusOrMinus = function(base, variance) {
		const randomSign = (0.5 - Math.random()) * 2; // between -1 and 1
		return base + variance * randomSign;
	};
	exports.removeOffstage = function() {
		const regDockingTree = exports.registry.dockingTree;
		for (let b = 0; b < regDockingTree.branches.length; b++) {
			let branch = regDockingTree.branches[b].object;
			if (branch && regDockingTree.object.localToGlobal(branch.x, branch.y).x < radius * -4) {
				let success = regDockingTree.object.removeChild(branch);
				regDockingTree.branches.splice(b, 1);
				break;
			}
		}
	};
	const shapeZone = {
		minX: 800,
		maxX: 1000,
		minY: 100,
		maxY: 300
	};
	exports.shapeCycle = {
		shapes: ["circle", "square", "triangle"],
		index: 0,
		getCurrentShape: function() { return this.shapes[this.index] },
		advance: function() {
			this.index++;
			if (this.index >= this.shapes.length) this.index = 0;
		}
	}
	exports.run = function() {
		createjs.MotionGuidePlugin.install();

		const Ease = createjs.Ease;
		const xOffsetPerSecond = -0.025;
		const treeExtensionInterval = 2000;
		const intervalBetweenBranches = 3;
		let timeOfLastTreeExtension = 0;

		function moveInCircle(shape, i, myPath) {
			const variance = 50;
			if (!myPath || myPath.length !== 18) { // if myPath isn't being passed in from a previous call
				var myPath = exports.circlePath(
					exports.plusOrMinus(shapeZone.minX, variance), exports.plusOrMinus(shapeZone.minY, variance), exports.plusOrMinus(shapeZone.maxX, variance), exports.plusOrMinus(shapeZone.maxY, variance)
				);
			}
			createjs.Tween.get(shape).to({ alpha: 1 }, 500);
			createjs.Tween.get(shape).to({
				guide: { path: myPath },
				rotation: shape.rotation + 180,
			}, 7000)
				.call(moveInCircle, [shape, i, myPath]);
		}
		function extractShape(shapeType) {
			const shapeIndex = exports.shapes.findIndex(shape => shape.type == shapeType);
			if (shapeIndex == -1) throw new Error("Can't find shape of type " + shapeType); // TODO: remove
			const [shape] = exports.shapes.splice(shapeIndex, 1);
			return shape;
		}
		function attractShape(leafInfo, shapeType) {
			const leafObj = leafInfo.object;
			const container = leafObj.parent;
			const destination = container.localToGlobal(leafInfo.x, leafInfo.y);
			const shape = extractShape(shapeType);
			destination.x = destination.x + xOffsetPerSecond * 1000; // compensate for drift
			createjs.Tween
				.get(shape, { override: true })
				.to(destination, 1000, Ease.quintInOut)
				.call(animationComplete, [shape, leafInfo, container])
			;
			createjs.Tween.get(shape).to({ alpha: 1 }, 500);
			createjs.Tween.get(shape).to({ rotation: -360*2 }, 1500, Ease.quintInOut);
		}
		function tick(event) {
			const timeElapsed = createjs.Ticker.getTime(true);
			const trunkLength = exports.registry.dockingTree.trunk.nodes.length;
			let driftLock = false;
			if (!createjs.Ticker.getPaused()) {
				// drift tree to the left
				const xOffset = timeElapsed * xOffsetPerSecond + exports.registry.dockingTree.xCorrection;
				exports.registry.dockingTree.object.x = xOffset;

				// extend tree periodically
				const timeSinceLastTreeExtension = timeElapsed - timeOfLastTreeExtension;
				if (timeSinceLastTreeExtension > treeExtensionInterval) {
					exports.removeOffstage();
					exports.extendDockingTree(1, function() {
						if (trunkLength - intervalBetweenBranches >= exports.registry.dockingTree.lastNodeWithABranch) {
							exports.buildDescendingBranch(exports.registry.dockingTree.trunk.nodes[trunkLength].x, 0);
							exports.registry.dockingTree.lastNodeWithABranch = trunkLength;
							const currentShape = exports.shapeCycle.getCurrentShape();
							while (exports.registry.dockingTree.leaves.length > 0) {
								const leaf = exports.registry.dockingTree.leaves.pop();
								attractShape(leaf, currentShape);
							}
							const newShapes = exports.createShapes(currentShape, 3);
							newShapes.forEach((shape) => moveInCircle(shape));
							exports.shapes = exports.shapes.concat(newShapes);
							exports.shapeCycle.advance();
						}
					});
					timeOfLastTreeExtension = timeElapsed;

					// auto-throttle rate of drift
					const nodes = exports.registry.dockingTree.trunk.nodes;
					const lastNode = nodes[nodes.length - 1];
					const treeTip = exports.registry.dockingTree.object.localToGlobal(lastNode.x, lastNode.y);
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
			window.addEventListener('blur', function() {
				createjs.Ticker.setPaused(true);
			});
			window.addEventListener('focus', function() {
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
		exports.shapes = exports.createShapes("random", 18);
		exports.shapes.push(...exports.createShapes("square", 3));
		exports.shapes.push(...exports.createShapes("circle", 3));
		exports.shapes.push(...exports.createShapes("triangle", 3));
		exports.shapes.forEach((shape) => moveInCircle(shape));
		let leavesAttached = 0;
		while (exports.registry.dockingTree.leaves.length > 0) {
			const leaf = exports.registry.dockingTree.leaves.pop();
			attractShape(leaf, exports.shapeCycle.getCurrentShape());
			leavesAttached++;
			if (leavesAttached % 3 == 0) exports.shapeCycle.advance(); // We want to attract 3 of each shape.
		}
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Ticker.setFPS(30);
	}();
	return exports;
}();
