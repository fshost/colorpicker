(function($, undefined) {

        $.widget('md.colorpicker', $.ui.mouse, {
            options: {
                color: 'white',
                format: 'rgba',
                presets: ['white', 'black', 'red', 'orangered', 'orange', 'gold', 'yellow', 'lime',
                    'limegreen', 'darkgreen', 'seagreen', 'dodgerblue', 'darkblue', 'indigo', 'purple', 'crimson'
                ],
                bind: null,
                classes: {
                    slSlider: 'md-cp-lightness-saturation-slider',
                    hueSlider: 'md-cp-hue-slider',
                    alphaSlider: 'md-cp-alpha-slider',
                    preview: 'md-colorpicker-preview',
                    preset: 'md-colorpicker-preset',
                    presetsContainer: 'md-colorpicker-presets',
                    presetsRow: 'md-cp-presets-row',
                    inputs: {
                        red: 'md-colorpicker-input-r',
                        green: 'md-colorpicker-input-g',
                        blue: 'md-colorpicker-input-b',
                        alpha: 'md-colorpicker-input-a',
                        value: 'md-colorpicker-input-value',
                    }
                }
            },
            _setOptions: function() {
                this._superApply(arguments);
            },
            _setOption: function(key, value) {
                var o = this.options;
                if (key === 'color') {
                    this._setColor(value);
                } else {
                    this._super(key, value);
                    this.refresh();
                }
            },
            _change: function() {
                var oldRgba = this.rgba;
                this.rgba = this.color.toRgbaString();
                if (this.rgba !== oldRgba) {
                    var o = this.options,
                        event = $.Event('change'),
                        color = this.color,
                        data = {
                            color: color,
                            colorpicker: this,
                            value: o.format === 'hex' ? color.toHexString() : color.toRgbaString()
                        };
                    event.data = data;
                    this._trigger('change', event, data);
                }
                return this;
            },
            _init: function() {
                this.refresh();
            },
            _setColor: function(color) {
                var o = this.options;
                if (color) o.color = color;
                else color = o.color;
                this.color = $.Color(color);
                this.refresh();
            },
            _inputChange: function(event, data) {
                var o = this.options,
                    target = $(event.target),
                    colorProp = target.data('color-property'),
                    propVal = target.val();
                colorProp = colorProp && colorProp.toLowerCase() || 'value';
                if (!colorProp || colorProp === 'value') {
                    if (o.color !== propVal) {
                        this._setColor(propVal);
                    }
                } else if ((/^(red|green|blue|alpha)$/).test(colorProp)) {
                    if (colorProp == 'alpha') {
                        propVal = parseFloat(propVal);
                    } else {
                        propVal = parseInt(propVal, 10);
                    }
                    if (this[colorProp] !== propVal) {
                        this[colorProp] = propVal;
                        this.color = this.color[colorProp](propVal);
                        this.refresh();
                    }
                }
            },
            syncPreview: function() {
                var o = this.options,
                    color = $.support.rgba || ($.support.rgb && this.color.alpha() === 1) ?
                        this.color.toRgbaString() : this.color.toHexString();
                this.preview.css('background', color);
                if (o.bind) {
                    $.each(o.bind, function(i, binding) {
                        $(binding.element).css(binding.property, color);
                    });
                }
                return this;
            },
            syncSLSlider: function(syncPosition) {
                var satColor = new HSVColor(this.color.hue(), 100, 100).getCSSHexadecimalRGB();
                this.slSlider.css('backgroundColor', satColor);
                if (syncPosition) {
                    var sliderSize = {
                        width: this.slSlider.width(),
                        height: this.slSlider.height()
                    };
                    this.slKnob.css({
                        left: this.color.saturation() * sliderSize.width,
                        top: (1 - this.color.lightness()) * sliderSize.height
                    });
                }
                return this;
            },
            syncHueSlider: function() {
                var hue = this.color.hue();
                if (this.hueSlider.veeslider('option', 'value') !== hue) {
                    this.hueSlider.veeslider('option', 'value', 359 - hue);
                }
                return this;
            },
            syncAlphaSlider: function() {
                var alphaValue = 100 - parseFloat(this.color.alpha().toFixed(2) * 100);
                if (this.alphaSlider.veeslider('option', 'value') !== alphaValue) {
                    this.alphaSlider.veeslider('option', 'value', alphaValue);
                }
                this.alphaSlider.css('backgroundColor', this.color.toHexString());
                return this;
            },
            syncInputs: function(syncVals) {
                if (syncVals) {
                    var inputClass, cval,
                        o = this.options;
                    this._inputs = {};
                    for (var key in o.classes.inputs) {
                        inputClass = o.classes.inputs[key];
                        this._inputs[key] = this.element.findClass(inputClass);
                        this._off(this._inputs[key], 'change');
                        if (key === 'value') {
                            cval = this.color.toHexString();
                        } else {
                            cval = this.color[key]();
                            cval = key === 'alpha' ? parseFloat(cval).toFixed(2) : parseInt(cval, 10);
                        }
                        this._inputs[key].val(cval);
                        this._on(this._inputs[key], {
                            change: this._inputChange
                        });
                    }
                }
                return this;
            },

            _refreshPresets: function() {
                var o = this.options;
                if (this._presets) this._off(this._presets);
                this._presetsContainer = this.element.findClass(o.classes.presetsContainer);
                if (o.presets && o.presets.length) {
                    this._presetsContainer.findClass(o.classes.preset).remove();
                    var presets = $(),
                        half = o.presets.length / 2,
                        row = this._presetsContainer.findClass(o.classes.presetsRow).first(),
                        addPresets = function(i, l) {
                            for (var presetElem, presetColor; i < l; i++) {
                                presetColor = o.presets[i];
                                presetElem = $('<div class="' + o.classes.preset + '">')
                                    .css('background', $.Color(presetColor).toHexString())
                                    .appendTo(row);
                                presets = presets.add(presetElem);
                            }
                            row = row.next();
                            return addPresets;
                        };
                    addPresets(0, half)(half, o.presets.length);
                    this._presets = presets;
           

                        var that = this;
                        this._on(this._presets, {
                            click: function(event) {
                                var newColor = $(event.target).style('backgroundColor') || $(event.target).css('backgroundColor');
                                that.color = $.Color(newColor);
                                that.refresh();
                            }
                        });

                        this._presetsContainer.show();
                    } else this._presetsContainer.hide();
                            return this;
                    },

                    refresh: function(notInputs, notSaturation) {
                        this.syncSLSlider(!notSaturation)
                            .syncHueSlider()
                            .syncAlphaSlider()
                            .syncInputs(!notInputs)
                            .syncPreview()
                            ._refreshPresets()
                            ._change();
                    },
                    _mouseDown: function(event) {
                        var o = this.options,
                            target = $(event.target),
                            zone = target.closest('div');
                        if ($(event.target).closest('div').is(this.slSlider)) {
                            var offset = this.slSlider.offset();
                            this.slKnob.css({
                                left: event.pageX - offset.left,
                                top: event.pageY - offset.top
                            });
                            var doc = $(this.document);
                            this._on(doc, {
                                mousemove: $.proxy(this._mouseMove, this),
                                mouseup: $.proxy(this._mouseUp, this)
                            });
                            this._setColorFromSlSlider(event);
                            return false;
                        }
                        return true;
                    },
                    _mouseUp: function(event) {
                        this._off($(document), 'mousemove mouseup');
                    },
                    _mouseMove: function(event) {
                        var offset = this.slSlider.offset(),
                            sliderSize = {
                                width: this.slSlider.width(),
                                height: this.slSlider.height()
                            };
                        this.slKnob.css({
                            left: Math.max(0, Math.min(sliderSize.width, event.pageX - offset.left)),
                            top: Math.max(0, Math.min(sliderSize.height, event.pageY - offset.top))
                        });
                        this._setColorFromSlSlider(event);
                    },
                    _setColorFromSlSlider: function(event) {
                        var offset = this.slSlider.offset(),
                            sliderSize = {
                                width: this.slSlider.width(),
                                height: this.slSlider.height()
                            },
                            lmax = Math.min(sliderSize.height, event.pageY - offset.top),
                            ltop = Math.max(0, lmax),
                            lratio = 100 / sliderSize.height,
                            lval = (sliderSize.height - ltop) / 100,
                            color = this.color.saturation(100 / sliderSize.width * Math.max(0, Math.min(sliderSize.width, event.pageX - offset.left)) / 100);
                        this.color = color.lightness(lratio * lval);
                        this.refresh(false, true);
                    },
                    _create: function() {
                        var o = this.options;
                        var templHtml = templates.colorpicker();
                        var templ = $(templHtml);
                        this.element.append(templ);
                        this.slSlider = this.element.findClass(o.classes.slSlider);
                        this.slKnob = this.slSlider.find('i');
                        this.hueSlider = this.element.findClass(o.classes.hueSlider);
                        this.alphaSlider = this.element.findClass(o.classes.alphaSlider);
                        this.preview = this.element.findClass(o.classes.preview);
                        var that = this;
                        this.hueSlider.veeslider({
                            max: 359,
                            change: function(event, data) {
                                that.color = that.color.hue(359 - data.value);
                                that.refresh(false, true);
                            }
                        });
                        this.alphaSlider.veeslider({
                            change: function(event, data) {
                                that.color = that.color.alpha((100 - data.value) / 100);
                                that.refresh();
                            }
                        });
                        this._setColor();
                        this._mouseInit();
                    },
                    _destroy: function() {
                        this._mouseDestroy();
                    }
                });


            /**************************************************************************
             *  HSVColor - a class derived from the Colour.js library by Stephen Morley
             *  http://code.stephenmorley.org/javascript/colour-handling-and-processing
             */

            function HSVColor(h, s, v, a) {
                var alpha = (a === undefined ? 1 : Math.max(0, Math.min(1, a))),
                    hsv = {
                        'h': (h % 360 + 360) % 360,
                        's': Math.max(0, Math.min(100, s)),
                        'v': Math.max(0, Math.min(100, v))
                    },
                    rgb = null,
                    hsl = null;

                function calculateRGB() {
                    var r, g, b;
                    if (hsv.s === 0) {
                        r = hsv.v;
                        g = hsv.v;
                        b = hsv.v;

                    } else {
                        var f = hsv.h / 60 - Math.floor(hsv.h / 60);
                        var p = hsv.v * (1 - hsv.s / 100);
                        var q = hsv.v * (1 - hsv.s / 100 * f);
                        var t = hsv.v * (1 - hsv.s / 100 * (1 - f));
                        switch (Math.floor(hsv.h / 60)) {
                            case 0:
                                r = hsv.v;
                                g = t;
                                b = p;
                                break;
                            case 1:
                                r = q;
                                g = hsv.v;
                                b = p;
                                break;
                            case 2:
                                r = p;
                                g = hsv.v;
                                b = t;
                                break;
                            case 3:
                                r = p;
                                g = q;
                                b = hsv.v;
                                break;
                            case 4:
                                r = t;
                                g = p;
                                b = hsv.v;
                                break;
                            case 5:
                                r = hsv.v;
                                g = p;
                                b = q;
                                break;
                        }

                    }
                    rgb = {
                        'r': r * 2.55,
                        'g': g * 2.55,
                        'b': b * 2.55
                    };
                }

                function calculateHSL() {
                    var l = (2 - hsv.s / 100) * hsv.v / 2;
                    hsl = {
                        'h': hsv.h,
                        's': hsv.s * hsv.v / (l < 50 ? l * 2 : 200 - l * 2),
                        'l': l
                    };
                    if (isNaN(hsl.s)) hsl.s = 0;
                }
                this.getRGB = function() {
                    if (rgb === null) calculateRGB();
                    return {
                        'r': rgb.r,
                        'g': rgb.g,
                        'b': rgb.b,
                        'a': alpha
                    };

                };
                this.getHSV = function() {
                    return {
                        'h': hsv.h,
                        's': hsv.s,
                        'v': hsv.v,
                        'a': alpha
                    };
                };
                this.getHSL = function() {
                    if (hsl === null) calculateHSL();
                    return {
                        'h': hsl.h,
                        's': hsl.s,
                        'l': hsl.l,
                        'a': alpha
                    };
                };
            }

            HSVColor.prototype.getIntegerRGB = function() {
                var rgb = this.getRGB();
                return {
                    'r': Math.round(rgb.r),
                    'g': Math.round(rgb.g),
                    'b': Math.round(rgb.b),
                    'a': rgb.a
                };
            };

            HSVColor.prototype.getCSSHexadecimalRGB = function() {
                var rgb = this.getIntegerRGB();
                var r16 = rgb.r.toString(16);
                var g16 = rgb.g.toString(16);
                var b16 = rgb.b.toString(16);
                return '#' + (r16.length == 2 ? r16 : '0' + r16) + (g16.length == 2 ? g16 : '0' + g16) + (b16.length == 2 ? b16 : '0' + b16);
            };

            /***
             * jQuery Color Animations SVG Color Names
             * https://github.com/jquery/jquery-color
             *
             * Remaining HTML/CSS color names per W3C's CSS Color Module Level 3.
             * http://www.w3.org/TR/css3-color/#svg-color
             *
             * Copyright 2013 jQuery Foundation and other contributors
             * Released under the MIT license.
             * http://jquery.org/license
             */
            jQuery.extend(jQuery.Color.names, {
                // 4.3. Extended color keywords (minus the basic ones in core color plugin)
                aliceblue: "#f0f8ff",
                antiquewhite: "#faebd7",
                aquamarine: "#7fffd4",
                azure: "#f0ffff",
                beige: "#f5f5dc",
                bisque: "#ffe4c4",
                blanchedalmond: "#ffebcd",
                blueviolet: "#8a2be2",
                brown: "#a52a2a",
                burlywood: "#deb887",
                cadetblue: "#5f9ea0",
                chartreuse: "#7fff00",
                chocolate: "#d2691e",
                coral: "#ff7f50",
                cornflowerblue: "#6495ed",
                cornsilk: "#fff8dc",
                crimson: "#dc143c",
                cyan: "#00ffff",
                darkblue: "#00008b",
                darkcyan: "#008b8b",
                darkgoldenrod: "#b8860b",
                darkgray: "#a9a9a9",
                darkgreen: "#006400",
                darkgrey: "#a9a9a9",
                darkkhaki: "#bdb76b",
                darkmagenta: "#8b008b",
                darkolivegreen: "#556b2f",
                darkorange: "#ff8c00",
                darkorchid: "#9932cc",
                darkred: "#8b0000",
                darksalmon: "#e9967a",
                darkseagreen: "#8fbc8f",
                darkslateblue: "#483d8b",
                darkslategray: "#2f4f4f",
                darkslategrey: "#2f4f4f",
                darkturquoise: "#00ced1",
                darkviolet: "#9400d3",
                deeppink: "#ff1493",
                deepskyblue: "#00bfff",
                dimgray: "#696969",
                dimgrey: "#696969",
                dodgerblue: "#1e90ff",
                firebrick: "#b22222",
                floralwhite: "#fffaf0",
                forestgreen: "#228b22",
                gainsboro: "#dcdcdc",
                ghostwhite: "#f8f8ff",
                gold: "#ffd700",
                goldenrod: "#daa520",
                greenyellow: "#adff2f",
                grey: "#808080",
                honeydew: "#f0fff0",
                hotpink: "#ff69b4",
                indianred: "#cd5c5c",
                indigo: "#4b0082",
                ivory: "#fffff0",
                khaki: "#f0e68c",
                lavender: "#e6e6fa",
                lavenderblush: "#fff0f5",
                lawngreen: "#7cfc00",
                lemonchiffon: "#fffacd",
                lightblue: "#add8e6",
                lightcoral: "#f08080",
                lightcyan: "#e0ffff",
                lightgoldenrodyellow: "#fafad2",
                lightgray: "#d3d3d3",
                lightgreen: "#90ee90",
                lightgrey: "#d3d3d3",
                lightpink: "#ffb6c1",
                lightsalmon: "#ffa07a",
                lightseagreen: "#20b2aa",
                lightskyblue: "#87cefa",
                lightslategray: "#778899",
                lightslategrey: "#778899",
                lightsteelblue: "#b0c4de",
                lightyellow: "#ffffe0",
                limegreen: "#32cd32",
                linen: "#faf0e6",
                mediumaquamarine: "#66cdaa",
                mediumblue: "#0000cd",
                mediumorchid: "#ba55d3",
                mediumpurple: "#9370db",
                mediumseagreen: "#3cb371",
                mediumslateblue: "#7b68ee",
                mediumspringgreen: "#00fa9a",
                mediumturquoise: "#48d1cc",
                mediumvioletred: "#c71585",
                midnightblue: "#191970",
                mintcream: "#f5fffa",
                mistyrose: "#ffe4e1",
                moccasin: "#ffe4b5",
                navajowhite: "#ffdead",
                oldlace: "#fdf5e6",
                olivedrab: "#6b8e23",
                orange: "#ffa500",
                orangered: "#ff4500",
                orchid: "#da70d6",
                palegoldenrod: "#eee8aa",
                palegreen: "#98fb98",
                paleturquoise: "#afeeee",
                palevioletred: "#db7093",
                papayawhip: "#ffefd5",
                peachpuff: "#ffdab9",
                peru: "#cd853f",
                pink: "#ffc0cb",
                plum: "#dda0dd",
                powderblue: "#b0e0e6",
                rosybrown: "#bc8f8f",
                royalblue: "#4169e1",
                saddlebrown: "#8b4513",
                salmon: "#fa8072",
                sandybrown: "#f4a460",
                seagreen: "#2e8b57",
                seashell: "#fff5ee",
                sienna: "#a0522d",
                skyblue: "#87ceeb",
                slateblue: "#6a5acd",
                slategray: "#708090",
                slategrey: "#708090",
                snow: "#fffafa",
                springgreen: "#00ff7f",
                steelblue: "#4682b4",
                tan: "#d2b48c",
                thistle: "#d8bfd8",
                tomato: "#ff6347",
                turquoise: "#40e0d0",
                violet: "#ee82ee",
                wheat: "#f5deb3",
                whitesmoke: "#f5f5f5",
                yellowgreen: "#9acd32"
            });
        
        })(jQuery);