
$(function () {

	$('.demo').colorpicker({
		// you can specify a starting color (default is white, i.e. #FFFFFF)
		// valid values are name, e.g. blue
		//					hex, e.g. #6464C8
		//					rgb, e.g. rgb(100, 100, 200)
		//					rgba, e.g. rgba(100, 100, 200, .5)
		color: 'lightgreen',
		// you can bind to the change event and get the color value from ui.value, e.g.
		change: function (event, ui) {
			console.log(ui.value);
		}
	});

});