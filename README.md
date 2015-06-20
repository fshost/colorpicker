# colorpicker
A jQuery UI colorpicker widget and a gradient stops widget

### Examples
See colorpicker.html and gradient.html

### About
Having been unable to find a colorpicker that I liked I decided to create my own.  Subsequently I added the option for a gradient colorpicker widget.  Currently these widgets examples make use of a couple of other minor widgets, some utility plugins, and a dependency (css/js) loader to ensure everything is loaded in the correct order as quickly as possible.  You can manually add every js and css file to your webpage if you would prefer not to use a loader - just make sure they are in the right order based on their dependencies.  Note that the actual widgets and supplementary libraries used are located in the components folder (although the examples will attempt to load jQuery libraries from the Google CDN if possible.)  Components with dependencies list those dependencies in their index.json file.  Also please note that it is not necessary to add the EJS files to your website - they are used to generate the javascript templates as part of the build process for this repo and are left for reference purposes.

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
