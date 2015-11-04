(function($, undefined) {

    $.widget('md.gradient', {
        options: {
            start: 'left',
            type: 'linear',
            defaultStops: [{
                color: 'white',
                position: 0
            }, {
                color: 'black',
                position: 1
            }],
            classes: {
                colorpicker: 'md-gradient-colorpicker',
                cpPreview: 'md-colorpicker-preview',
                slider: 'md-gradient-slider',
                colorStop: 'gradient-color-stop',
                csPointer: 'gradient-color-stop-pointer',
                csColor: 'gradient-color-stop-color',
                csBg: 'gradient-color-stop-bg'
            }
        },
        _template: [
            '<div class="md-gradient-colorpicker"></div>',
            '<div class="md-gradient-slider">',
            '<div class="gradient-color-stop">',
            '<div class="gradient-color-stop-pointer"></div>',
            '<div class="gradient-color-stop-color"></div>',
            '<div class="gradient-color-stop-bg"></div>',
            '</div>',
            '</div>'
        ].join(''),
        _setOptions: function(options) {
            this._superApply(arguments);
        },
        _setOption: function(key, value) {
            this._super(key, value);
        },
        _gradientCss: function(preview) {
            var o = this.options,
                gradientCss = o.type + '-gradient(',
                stops = [],
                sliderWidth = this.slider.width();
            gradientCss += preview ? 'left' : o.start;
            gradientCss += ',';
            $.each(this._stops, function() {
                var el = $(this),
                    width = el.outerWidth(),
                    posRatio = 100 / (sliderWidth - width),
                    stop = {
                        color: el.findClass(o.classes.csColor).css('backgroundColor'),
                        position: Math.round((el.position().left) * posRatio)
                    };
                stops.push(stop);
            });
            stops = stops.sort(function(stop1, stop2) {
                return stop2.position < stop1.position ? 1 : -1;
            });
            for (var stop, i = 0, l = stops.length; i < l; i++) {
                stop = stops[i];
                gradientCss += ' ' + stop.color + ' ' + stop.position + '%';
                if (i < l - 1) gradientCss += ', ';
            }
            gradientCss += ')';
            this.genericCss = gradientCss;
            gradientCss = $.prefixCss(gradientCss);
            return gradientCss;
        },
        _colorStopMousedownHandler: function() {
            var o = this.options,
                that = this;
            return function(event) {
                var curStop = $(this),
                    curStopColor = curStop.findClass(o.classes.csColor),
                    curColor = curStopColor.css('backgroundColor');
                that._lastColor = curColor;
                that._stops.css('zIndex', 0);
                curStop.css('zIndex', 1);
                that.colorpicker.options.bind = [{
                    element: curStopColor,
                    property: 'backgroundColor'
                }];
                that.colorpicker._setOption('color', curColor);
            };
        },
        cssValue: function() {
            return this._cssValue;
        },
        _change: function() {
            var o = this.options,
                event = $.Event('change'),
                data = {
                    widget: this,
                    value: this.genericCss
                };
            event.data = data;
            this._trigger('change', event, data);
            return this;
        },
        _refresh: function() {
            var oldCssValue = this._cssValue;
            this._cssValue = this._gradientCss();
            this.preview.css('background', this._cssValue);
            this._change();
        },
        _addStop: function(event, color) {
            var o = this.options,
                that = this,
                stop = this._colorStopTemplate.clone().appendTo(this.slider)
                .mousedown(this._colorStopMousedownHandler())
                .draggable({
                    containment: this.slider,
                    /* start: function(event, ui) {
                        console.log('started dragging');
                    },*/
                    grid: [1, 20],
                    drag: function(event, ui) {
                        var curStop = $(this),
                            sliderOffset = that.slider.offset(),
                            mouseTop = event.pageY - sliderOffset.top;
                        if (mouseTop > 19) {
                            curStop.css('cursor', 'not-allowed');
                            curStop.draggable('option', 'grid', false);
                        } else {
                            curStop.css('cursor', 'auto');
                            if (curStop.is('.ui-draggable'))
                                curStop.draggable('option', 'grid', [1, 20]);
                        }
                        that._refresh();
                    },
                    stop: function(event, ui) {
                        var curStop = $(this),
                            sliderOffset = that.slider.offset(),
                            mouseTop = event.pageY - sliderOffset.top;
                        curStop.css('cursor', 'auto');
                        if (ui.position.top > 5) {
                            if (that._stops.length > 2) {
                                curStop.draggable('destroy');
                                that._stops = that._stops.not(curStop);
                                curStop.remove();
                            } else {
                                curStop.css('top', 0);
                                that.disable();
                            }

                        } else if (mouseTop > 0 || ui.position.top !== 0) {
                            curStop.css('top', 0);
                        }
                        that._refresh();
                    }
                }),
                stopColorElem = stop.findClass(o.classes.csColor);
            this.colorpicker.options.bind = [{
                element: stopColorElem,
                property: 'backgroundColor'
            }];
            var left;
            if (typeof color === 'string') {
                left = event;
            } else {
                var sliderOffset = this.slider.offset(),
                    mouseLeft = event.pageX - sliderOffset.left;
                left = mouseLeft - stop.outerWidth() / 2;
                stop.css('left', left);
                color = this._lastColor;
            }
            stop.css('left', left);
            stopColorElem.css('backgroundColor', color);
            this._stops = this._stops.add(stop);
            this._refresh();
        },
        disable: function() {
            this._stops.hide();
            this.colorpicker.preview = this.preview.css('backgroundImage', 'none');
            this._colorpickerBind = this.colorpicker.options.bind;
            this.colorpicker.options.bind = null;
            this.colorpicker._refresh();
        },
        enable: function() {
            this._stops.show();
            this.preview = this.colorpicker.preview;
            this.colorpicker.options.bind = this._colorpickerBind;
            this.colorpicker.preview = $();
            this._refresh();
        },
        _init: function() {
            this._refresh();
        },
        _create: function() {
            var maxPos,
                o = this.options;
            
            this.element.append(this._template);
            this.element.findClass(o.classes.colorpicker).colorpicker();
            
            this._stops = $();
            this.colorpicker = this.element.findClass(o.classes.colorpicker).data('mdColorpicker');
            this.preview = this.colorpicker.preview;
            this.colorpicker.preview = $();
            this.slider = this.element.findClass(o.classes.slider);
            this._on(this.slider, {
                dblclick: this._addStop
            });
            this._colorStopTemplate = this.element.findClass(o.classes.colorStop);
            maxPos = this.slider.width() - this._colorStopTemplate.outerWidth();
            this._colorStopTemplate.detach();
            var that = this;
            $.each(o.defaultStops, function(i, stop) {
                that._addStop(stop.position * maxPos, stop.color);
            });
            this._lastColor = o.defaultStops[0].color;
            this.colorpicker.options.bind = [{
                element: this._stops.first().findClass(o.classes.csColor),
                property: 'backgroundColor'
            }];
            this.colorpicker.options.change = function(event, data) {
                that._lastColor = data.value;
                that._refresh();
            };
            this.colorpicker._setOption('color', this._lastColor);
        },
        _destroy: function() {
            this.element.remove();
        }
    });

})(jQuery);