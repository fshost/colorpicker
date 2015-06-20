/* veeslider widget
 * creates a slider that uses a precision indicator v-style knob, like '>  <' for vertical
 */
(function($, undefined) {

    $.fn.findClass = function(className) {
        return this.find('.' + className);
    };

    $.widget('md.veeslider', {
        options: {
            orientation: 'vertical',
            max: 100,
            min: 0,
            value: 0,
            integer: true,
            fill: false,
            size: {
                width: 24,
                length: 144
            },
            knob: {
                width: 5,
                length: 24
            },

            // for default knobs, if true will not shrink their width
            noKnobResize: false,

            // do not resize the slider if true
            noResize: false,

            centerKnob: true,
            knobHandle: false,
            knobColor: 'black',
            overflow: 'hidden',
            knobHoverOutline: 'white',
            classes: {
                slider: 'md-veeslider',
                knob: 'md-veeslider-knob',
                containment: 'md-veeslider-containment'
            }
        },
        _setOptions: function(options) {
            this._superApply(arguments);

        },
        _setOption: function(key, value) {
            var o = this.options;
            if (key === 'value') {
                if (o.value === value) return;
                if (value >= o.min && value <= o.max) {
                    o.value = value;
                    this._setPosition();
                } else {
                    var err = new Error('Invalid value: ' + value + ', value must be between ' + o.min + ' and ' + o.max);
                    throw err;
                }
            } else {
                this._super(key, value);
                this.refresh();
            }
        },
        _setPosition: function() {
            var o = this.options;
            var cssProp = o.orientation === 'horizontal' ? 'left' : 'top';
            var knobPosition = Math.round((o.value - o.min) * (o.size.length / (o.max - o.min))) - this.knobOffset;
            this.knob.css(cssProp, knobPosition);
        },
        _setValueFromPosition: function(event, data) {
            var setPosition;
            var o = this.options;
            var cssProp = o.orientation === 'horizontal' ? 'left' : 'top';
            var knobPosition = this.knob.position()[cssProp] + this.knobOffset;
            var range = o.max - o.min;
            var value = knobPosition * range / o.size.length;
            if (o.integer) value = Math.round(value);
            value += o.min;
            if (value < o.min) {
                value = o.min;
                setPosition = true;
            }
            if (value > o.max) {
                value = o.max;
                setPosition = true;
            }
            if (o.value !== value) {
                o.value = value;
                if (setPosition) this._setPosition();
                var _event = $.Event('change');
                data = data || {};
                data.value = value;
                if (event) {
                    _event.originalEvent = event;
                    event.data = data;
                }
                this._trigger('change', event, data);
            } else if (setPosition) this._setPosition();
        },
        value: function(_value) {
            if (arguments.length === 0) {
                return this.options.value;
            } else {
                this._setOption('value', _value);
            }
        },
        refresh: function() {
            var autoKnob,
                o = this.options,
                horz = o.orientation === 'horizontal';
            if (o.fill) {
                if (horz) {
                    o.size.width = this.element.height();
                    o.size.length = this.element.width();
                } else {
                    o.size.width = this.element.width();
                    o.size.length = this.element.height();
                }
            }
            this.element.findClass(o.classes.knob)
                .filter('.ui-draggable').draggable('destroy')
                .end().remove();

            // knob option can be an html string or other jquery object to append to the slider
            if (typeof o.knob === 'string') {
                this.knob = $(o.knob).appendTo(this.element);
            }
            // knobHandle option can be a selector or other jquery reference to an existing element in slider to use as the knob
            // if it does not exist in the slider it is assumed to be a css class to add to a generated div
            else if (o.knobHandle) {
                this.knob = this.element.find(o.knobHandle);
                if (this.knob.length === 0) {
                    this.knob = $('<div>', {
                        class: o.knobHandle.replace(/^\./, '')
                    }).appendTo(this.element);
                }
            } else {
                var veeClass = 'md-vee-knob-' + o.orientation;
                this.knob = $('<div>', {
                    class: veeClass
                }).appendTo(this.element);
                autoKnob = true;
            }

            if (horz) {
                o.knob = {
                    width: this.knob.outerWidth(true),
                    length: this.knob.outerHeight(true)
                };
            } else {
                o.knob = {
                    width: this.knob.outerHeight(true),
                    length: this.knob.outerWidth(true)
                };
            }

            // ensure valid calc values
            if (o.min > o.max) o.max = o.min + 1;
            if (o.size.width < o.knob.width) {
                o.size.width = o.knob.width;
            }
            if (o.size.length < o.knob.length) {
                o.size.length = o.knob.length;
            }
            // refresh containment for knob draggable
            this.element.addClass(o.classes.slider)
                .findClass(o.classes.containment).remove();
            if (this.element.css('position') === 'static') {
                this.element.css('position', 'relative');
            }
            this.containElem = $('<div>').addClass(o.classes.containment)
                .appendTo(this.element);

            this.knobOffset = Math.round(o.knob.width / 2);
            // set sizes of slider and knob draggable container
            if (horz) {
                if (!o.noResize) {
                    this.element.css({
                        width: o.size.length,
                        height: o.size.width
                    });
                }
                this.containElem.css({
                    width: o.size.length + o.knob.width,
                    height: o.size.width,
                    left: -(this.knobOffset)
                });
            } else {
                if (!o.noResize) {
                    this.element.css({
                        width: o.size.width,
                        height: o.size.length
                    });
                }
                this.containElem.css({
                    width: o.size.width,
                    height: o.size.length + o.knob.width,
                    top: -(this.knobOffset)
                });
            }

            // shrink width of auto-knobs if needed
            if (autoKnob && !o.noKnobResize) {
                var elWidth, knobWidth, widthDiff;
                if (horz) {
                    elWidth = this.element.height();
                    knobWidth = this.knob.outerHeight();
                    widthDiff = knobWidth - elWidth;
                    if (widthDiff > 0) {
                        this.knob.css('height', '-=' + widthDiff);
                    }
                } else {
                    elWidth = this.element.width();
                    knobWidth = this.knob.outerWidth();
                    widthDiff = knobWidth - elWidth;
                    if (widthDiff > 0) {
                        this.knob.css('width', '-=' + widthDiff);
                    }
                }
            }

            var that = this;
            var dragOptions = {
                axis: horz ? 'x' : 'y',
                containment: this.containElem,
                drag: function(event, ui) {
                    that._setValueFromPosition(event, ui);
                }
            };
            if (o.draggableOptions) {
                dragOptions = $.extend(true, dragOptions, o.draggableOptions);
            }
            // add knob class and make draggable
            this.knob.addClass(o.classes.knob)
                .draggable(dragOptions);

            if (o.centerKnob) {
                var khalf;
                if (horz) {
                    khalf = Math.round((this.knob.outerHeight(true) - this.element.height()) / 2);
                    if (this.knob.css('marginTop') === 'auto') this.knob.css('marginTop', -khalf);
                    else this.knob.css('marginTop', '-=' + khalf);
                } else {
                    khalf = Math.round((this.knob.outerWidth(true) - this.element.width()) / 2);
                    if (this.knob.css('marginLeft') === 'auto') this.knob.css('marginLeft', -khalf);
                    else this.knob.css('marginLeft', '-=' + khalf);
                }
            }
            try {
                this._off('mousedown');
            } catch (ex) {}
            this._on({
                mousedown: function(event, data) {
                    if (this.knob.is(event.target) || this.knob.has(event.target).length ||
                        (data && data.manualTrigger)) return;
                    var pos, cssProp;
                    if (horz) {
                        pos = event.offsetX;
                        cssProp = 'left';
                    } else {
                        pos = event.offsetY;
                        cssProp = 'top';
                    }
                    pos -= (that.knobOffset * 2);
                    that.knob.css(cssProp, pos);
                    that._setValueFromPosition(event, data);
                    this.knob.trigger(event, {
                        manualTrigger: true
                    });
                }
            });
            // set knob to correct position based on value option
            this._setPosition();
        },
        _create: function() {
            var o = this.options;
            o.value = o.value === undefined || o.value === null ||
                o.value > o.max || o.value < o.min ? o.min : o.value;
        },
        _init: function() {
            this.refresh();
        }

    });


})(jQuery);