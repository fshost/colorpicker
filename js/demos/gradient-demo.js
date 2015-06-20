
$(function () {

	$('.demo').gradient({
		change: function (event, ui) {
			console.log(ui.value);
		}
	});

});