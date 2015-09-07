(function () {
	// Foundation 5 require this
	$(document).foundation();
	
	var canvas = $('canvas'),
		canvasCtx = canvas[0].getContext('2d'),
		mousePos, // For tracking position of last mouse click
		sizeSlide = $('.size'),
		fillSlider = $('.fill'),
		historyNum = 0; // For tracking position in drawHistory array

	// Set the canvas h & w to fix pointer issue when resizing window
	function resizeCanvas() {
		canvasCtx.canvas.height = canvas.height();
		canvasCtx.canvas.width = canvas.width();
		tools.reDraw();
	}

	$(window).resize(resizeCanvas);

	// Set initial values of sliders
	sizeSlide.foundation('slider', 'set_value', 1);
	fillSlider.foundation('slider', 'set_value', 9);

	var tools = {
		inuseColor: $('.color'),

		colorPalette: {
			togglePalette: function () {
				var palette = $('.color-palette');
				/* Uses 'CSS visibility' rather than 'CSS display: none'
				   as there's a bug on Foundation 5 RGB sliders when sliding it
				   after setting colorPalette to 'display: block' using 'toggle() of JQuery' */
				if (palette.css('visibility') == 'hidden') {
					palette.css('visibility', 'visible');
				} else {
					palette.css('visibility', 'hidden');
				}
			},

			prevColor: $('.prev-color'),

			rgbSliding: false,

			changePrevColor: function () {
				// When slider handle is move
				if (this.rgbSliding) {
					// Get current RGB values
					var red = $('#red').attr('data-slider'),
						green = $('#green').attr('data-slider'),
						blue = $('#blue').attr('data-slider');
					/* Then concatenate with value of other rgb sliders
					   and use the result as background color of prevColor */
					this.prevColor.css('background', 'rgba(' + red + ',' + green +
									   ',' + blue + ', ' + tools.fill.fillValue + ')');
				}
			},

			confirmNewColor: function () {
				// Set the inuseColor bgcolor equal to prevColor bgcolor
				tools.inuseColor.css('background', this.prevColor.css('background'));
			}
		},

		size: {
			sizeSliding: false,

			sizeValue: sizeSlide.attr('data-slider'),

			changeSize: function () {
				// Check if size slider is active then set sizeValue = current
				if (this.sizeSliding) this.sizeValue = sizeSlide.attr('data-slider');
			}
		},

		fill: {
			fillSliding: false,
			
			// Value of slider is from 1 to 9
			//   so if value == 10, then 9 * 0.1 = 0.9
			fillValue: fillSlider.attr('data-slider') * 0.1,

			changeFill: function () {
				this.fillValue = fillSlider.attr('data-slider') * 0.1;
				var color = tools.inuseColor.css('backgroundColor');
				// Concatenate current RGB values with fillValue
				tools.inuseColor.css('backgroundColor', color.slice(0, color.lastIndexOf(' ')) +
									 " " + this.fillValue + ')');
			}
		},

		drawHistory: [], // Store here draw history

		saveDraw: function () {
			if (this.canvas.isDrawing) {
				// Limit drawHistory length to 20 items
				if (this.drawHistory.length > 20) this.drawHistory.shift();
				// Save URI of canvas image to drawHistory
				this.drawHistory.push(canvasCtx.canvas.toDataURL());
				// Set historyNum to always be the last item num
				//   so when users press UNDO, they will get back to last draw history
				historyNum = this.drawHistory.length - 1;
			}
		},

		reDraw: function () {
			var canvasImg = new Image();
			// Set src to last item in drawHistory
			canvasImg.src = this.drawHistory[historyNum];
			// Make sure image is fully loaded first
			canvasImg.onload = function () {
				// Clear canvas
				tools.deleteAll();
				// then re draw the image
				canvasCtx.drawImage(canvasImg, 0, 0, canvas.width(), canvas.height());
			};
		},

		undo: function () {
			// Prevent UNDOing to -1
			if (historyNum > 0) {
				historyNum--;
				this.reDraw();
			}
		},

		deleteAll: function () {
			canvasCtx.clearRect(0, 0, canvas.width(), canvas.height());
		},

		canvas: {
			isDrawing: false,

			draw: function (event) {
				if (this.isDrawing) {
					canvasCtx.beginPath();
					// Previous mousepos
					canvasCtx.moveTo(mousePos.offsetX, mousePos.offsetY);
					mousePos = event;
					// Current mousepos
					canvasCtx.lineTo(event.offsetX, event.offsetY);
					canvasCtx.strokeStyle = tools.inuseColor.css('backgroundColor');
					canvasCtx.lineWidth = tools.size.sizeValue;
					// Round will prevent line breaks
					canvasCtx.lineCap = 'round';
					canvasCtx.stroke();
				}
			}
		}
	};

	// Toggle color palette
	$('.color').click(tools.colorPalette.togglePalette);

	// Color palette controls
	$('.rgb-sliders .range-slider').mousedown(function () {
		// Set rgbSliding = true to indicate mousedown is active
		tools.colorPalette.rgbSliding = true;
	}).mousemove(function () {
		// Call the method everytime mouse is move while on mousedown
		tools.colorPalette.changePrevColor();
	}).mouseup(function () {
		// Set rgbSliding = false to deactivate changePrevColor method
		tools.colorPalette.rgbSliding = false;
	});

	// Change the inuseColor to the prevColor
	$('.confirm').click(function () {
		tools.colorPalette.confirmNewColor();
        $('.color').click();
	});

	// Listen on mouse events to draw on canvas
	canvas.mousedown(function (e) {
		mousePos = e;
		tools.canvas.isDrawing = true;
	}).mousemove(function (e) {
		tools.canvas.draw(e); // Pass current mousePos
	}).mouseup(function () {
		// Save to draw history
		tools.saveDraw();
		// Indicate mouse
		tools.canvas.isDrawing = false;
	}).mouseleave(function () {
		canvas.mouseup();
	});

	// Size changer
	sizeSlide.mousedown(function () {
		tools.size.sizeSliding = true;
	}).mousemove(function () {
		tools.size.changeSize();
	}).mouseup(function () {
		tools.size.sizeSliding = false;
	});

	// Fill changer
	fillSlider.mousedown(function () {
		tools.fill.fillSliding = true;
	}).mousemove(function () {
		tools.fill.changeFill();
	}).mouseup(function () {
		tools.fill.fillSliding = false;
	});

	// Show dialog box when X button is clicked
	$('.delete').click(function () {
		$('.confirm-delete').css('visibility', 'visible');
	});
	// Hides dialog box when No is clicked
	$('.confirm-delete input[value=No]').click(function () {
		$('.confirm-delete').css('visibility', 'hidden');
	});
	// Hides dialog box and Clear canvas when Yes is clicked
	$('.confirm-delete input[value=Yes]').click(function () {
		tools.deleteAll();
		$('.confirm-delete').css('visibility', 'hidden');
	});

	// Undo
	$('.undo').click(function () {
		tools.undo();
	});

	$('document').ready(function () {
		// Save empty canvas to drawHistory
		//   so users can UNDO after first draw
		tools.drawHistory.push(canvasCtx.canvas.toDataURL());
		resizeCanvas();
	});
})();
