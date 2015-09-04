(function () {
  $(document).foundation();
  var canvas = $('canvas');
  var canvasCtx = canvas[0].getContext('2d');
  var mousepos;
  var sizeSlide = $('.size');
  var fillSlider = $('.fill');

  // Set the canvas h x w to fix pixelating issue when drawing on canvas
  canvasCtx.canvas.height = canvas.height();
  canvasCtx.canvas.width = canvas.width();

  // Set values of sliders
  $('.size').foundation('slider', 'set_value', 1);
  $('.fill').foundation('slider', 'set_value', 9);

  var tools = {
    inuseColor: $('.color'),

    togglePalette: function () {
      var palette = $('.color-palette');
      if (palette.css('visibility') == 'hidden') {
        palette.css('visibility', 'visible');
      } else {
        palette.css('visibility', 'hidden');
      }
    },

    colorPalette: {
      prevColor: $('.prev-color'),

      rgbSliding: false,

      changePrevColor: function () {
        if (this.rgbSliding) {
          // When slider handle is move, get rbg values
          var red = $('#red').attr('data-slider'),
            green = $('#green').attr('data-slider'),
            blue = $('#blue').attr('data-slider');
          /* concatenate with value of other rgb sliders
             and use the result as background color of prev-color */
          this.prevColor.css('background', 'rgba(' + red + ',' + green + ',' + blue + ', ' + tools.fill.fillValue + ')');
        }
      },

      confirmNewColor: function () {
        // When OK button is clicked, set that = colorPalette
        // Note: 'this' in this case refers to button
        var that = tools.colorPalette;
        // set the inuseColor bgcolor equal to prevColor bgcolor
        tools.inuseColor.css('background', that.prevColor.css('background'));
      }
    },

    size: {
      sizeSliding: false,

      sizeValue: sizeSlide.attr('data-slider'),

      changeSize: function () {
        this.sizeValue = sizeSlide.attr('data-slider');
      }
    },

    fill: {
      fillSliding: false,

      fillValue: fillSlider.attr('data-slider') * 0.1,

      changeFill: function () {
        this.fillValue = fillSlider.attr('data-slider') * 0.1;
        var color = tools.inuseColor.css('backgroundColor');
        tools.inuseColor.css('backgroundColor', color.slice(0, color.lastIndexOf(' ')) + " " + this.fillValue + ')');
      }
    },

    deleteAll: function () {
      canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
    },

    canvas: {
      isDrawing: false,
      draw: function (event) {
        if (this.isDrawing) {
          canvasCtx.beginPath();
          canvasCtx.moveTo(mousepos.offsetX, mousepos.offsetY);
          mousepos = event;
          canvasCtx.lineTo(event.offsetX, event.offsetY);
          canvasCtx.strokeStyle = tools.inuseColor.css('backgroundColor');
          canvasCtx.lineWidth = tools.size.sizeValue;
          canvasCtx.lineCap = 'round';
          canvasCtx.stroke();
        }
      }
    }
  };

  // Toggle color palette
  $('.color').click(tools.togglePalette);

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
  $('.confirm').click(tools.colorPalette.confirmNewColor);

  // Listen on mouse events to draw on canvas
  canvas.mousedown(function (e) {
    mousepos = e;
    tools.canvas.isDrawing = true;
  }).mousemove(function (e) {
    tools.canvas.draw(e);
  }).mouseup(function () {
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
})();
