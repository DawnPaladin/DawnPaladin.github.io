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
	exports.testCanvas();
	return exports;
})();
