# colorpicker
A jQuery UI colorpicker widget and a gradient stops widget

### Examples
See colorpicker.html and gradient.html in the demos directory

### About
Having been unable to find a colorpicker that I liked I decided to create my own.  Subsequently I added the option for a gradient colorpicker widget.  These widgets makes use of another minor widget - the veeslider, as well as some utility plugins.

### Colorpicker
The colorpicker widget has the following options:

- color: the initial color to set the colorpicker to. Defaults to white.
- presets: An array of 16 colors to use for the colorpicker presets.  See source or example for defaults.
- change: a function to call when the color changes

To initialize a colorpicker widget, just create an empty div, reference that with jQuery, and invoke the colorpicker method, e.g.

$('.my-colorpicker').colorpicker();

### Gradient
The gradient widget has the following options:

- start: A valid css gradient start.  Defaults to 'left'.
- type: A valid css gradient type.  Defaults to 'linear'. Other types should be considered experimental.
- defaultStops: An object specifying the default stops to use initially.  Defaults to white and black.
- change: a function to call when the gradient changes.

To initialize a gradient widget, just create an empty div, reference that with jQuery, and invoke the gradient method, e.g.

$('.my-gradient-colorpicker').gradient();

### License
MIT License - see LICENSE for more
