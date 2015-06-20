(function($, undefined) {

 $.fn.triangle = function (options) {
        var defaults = {
            color: '#000',
            width: 8,
            height: 8,
            direction: 'e'
        },
        settings = $.extend(defaults, options),
        css = {
            height: 0,
            width: 0,
            borderStyle: 'solid',
            borderColor: settings.color,
            transform: 'rotate(360deg)',
            '-moz-transform': 'scale(1.1)'
        };
        if (settings.class !== false && !settings.class) {
            settings.class = 'triangle-' + settings.direction;
        }
        if ((/e|w/).test(settings.direction)) {
            var halfHeight = settings.height / 2;
            css.borderTopWidth = halfHeight + 'px';
            css.borderBottomWidth = halfHeight + 'px';
            css.borderTopColor = 'transparent';
            css.borderBottomColor = 'transparent';
            css.borderLeftWidth = (/e/).test(settings.direction) ? settings.width + 'px': 0;
            css.borderRightWidth = (/w/).test(settings.direction) ? settings.width + 'px': 0;
        }
        else {
            var halfWidth = settings.width / 2;
            css.borderRightWidth = halfWidth + 'px';
            css.borderLeftWidth = halfWidth + 'px';
            css.borderRightColor = 'transparent';
            css.borderLeftColor = 'transparent';
            css.borderTopWidth = (/s/).test(settings.direction) ? settings.height + 'px': 0;
            css.borderBottomWidth = (/n/).test(settings.direction) ? settings.height + 'px': 0;
        }
        var tri = this.css(css);
        if (settings.class) tri.addClass(settings.class);
        return tri;
    };
    

})(jQuery);