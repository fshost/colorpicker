/*
 * jQuery utilities
 * Copyright 2015 by Nathan Cartwright
 * MIT License
 */
(function($, undefined) {

    /***
     * jQuery.camelCase - convert dash-sep string to camelCase string
     * examples:
     *   $.camelCase('margin-left'); // => 'marginLeft'
     *   $.camelCase('border-top-width'); // => 'borderTopWidth'
     */
    $.camelCase = function(str) {
        return str.replace(/-([a-z])/ig, function(word, letter) {
            return letter.toUpperCase();
        });
    };

    /***
     * jQuery.dasherize - convert camelCase string to dash-sep string
     * examples:
     *   $.dasherize('marginLeft'); // => 'margin-left'
     *   $.dasherize('borderTopWidth'); // => 'border-top-width'
     */
    $.dasherize = function(str) {
        return $.trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
    };

    /***
     * find descendant element by classname
     * equivalent to $.fn.find('.' + className)
     */
    $.fn.findClass = function(className) {
        return this.find('.' + className);
    };

    /***
     *  jQuery.styles
     *
     *  returns a set of computed styles. Pass the names of the styles you want to
     *  retrieve as arguments.  If any argument is an object it is treated as a
     *  combined argument, e.g. { border: 'height'} for an element with a top and
     *  bottom border width of one returns { borderHeight: 2 }
     *      ( see the jQuery.combined plugin for more on combined properties )
     *  usage examples:
     *  $('div').styles('float','display'); //{ cssFloat:'left',display:'block' }
     *  $('div').styles('marginLeft', { border: 'height' })
     *
     *  extended from the jquery.styles plugin, jQuery++ [http://jquerypp.com]
     */
    $.fn.styles = function() {
        function getStyle(elem) {
            if (window.getComputedStyle) return window.getComputedStyle(elem, null);
            else return elem.currentStyle || elem.style || {};
        }

        var getComputedStyle = (document.defaultView && document.defaultView.getComputedStyle) || window.getComputedStyle,
            args = Array.prototype.slice.call(arguments),
            rupper = /([A-Z])/g,
            rfloat = /float/i,
            rnumpx = /^-?\d+(?:px)?$/i,
            rnum = /^-?\d/,
            l = args.length,
            results = {},
            camelCase,
            currentS,
            oldName,
            newKey,
            combinedName,
            combines = {},
            i = 0,
            rsLeft,
            style = [],
            temp = [],
            key,
            left,
            val,
            el = this[0];
        if (el === undefined) return;
        currentS = getStyle(el);
        var propIterator = function() {
            combinedName = name + $.capitalize(this);
            if (name == 'border') combinedName += 'Width';
            combines[newKey].push(combinedName);
            if (style.indexOf(combinedName) == -1 && args.indexOf(combinedName) == -1) {
                style.push(combinedName);
                temp.push(combinedName);
            }
        };
        var name;
        for (; i < l; i++) {
            if ($.type(args[i]) == 'object') {
                for (name in args[i]) {
                    newKey = name + $.capitalize(args[i][name]);
                    combines[newKey] = [];
                    $($.getPositions(args[i][name])).each(propIterator);
                }
            } else {
                style.push(args[i]);
            }
        }
        l = style.length;
        for (i = 0; i < l; i++) {
            name = style[i];
            oldName = $.camelCase(name);
            if (rfloat.test(name)) {
                name = jQuery.support.cssFloat ? 'float' : 'styleFloat';
                oldName = 'cssFloat';
            }
            if (getComputedStyle) {
                name = name.replace(rupper, '-$1').toLowerCase();
                val = currentS.getPropertyValue(name);
                if (name === 'opacity' && val === '') {
                    val = '1';
                }
                results[oldName] = val;
            } else {
                camelCase = $.camelCase(name);
                results[oldName] = currentS[name] || currentS[camelCase];
                if (!rnumpx.test(results[oldName]) && rnum.test(results[oldName])) {
                    left = style.left;
                    rsLeft = el.runtimeStyle.left;
                    el.runtimeStyle.left = el.currentStyle.left;
                    style.left = camelCase === 'fontSize' ? '1em' : (results[oldName] || 0);
                    results[oldName] = style.pixelLeft + 'px';
                    style.left = left;
                    el.runtimeStyle.left = rsLeft;
                }
            }
        }
        el = $(el);
        for (key in combines) {
            results[key] = 0;
            for (i = 0; i < combines[key].length; i++) {
                combinedName = combines[key][i];
                results[key] += el.toPx(results[combinedName]);
                if (temp.indexOf(combinedName) > -1)
                    delete results[combinedName];
            }
            results[key] += 'px';
        }
        return results;
    };

    /***
     * jQuery.style
     * like jQuery.styles this gets the computed style of an element, but whereas
     *   $('div').styles('color')
     * returns an object, e.g. { color: <color> }
     *   $('div').style('color')
     * simply returns a string, e.g. <color>
     */
    $.fn.style = function(propName) {
        return this.styles(propName)[propName];
    };


    /***
     * set some properties of $.support, including the document style properties and vendorPrefix
     */
    if (window.getComputedStyle) $.support.documentStyles = window.getComputedStyle(document.documentElement, '');
    else if (document.defaultView && document.defaultView.getComputedStyle)
        $.support.documentStyles = document.defaultView.getComputedStyle(document.documentElement, '');
    else if (document.documentElement.currentStyle) $.support.documentStyles = document.documentElement.currentStyle;
    else $.support.documentStyles = document.documentElement.style;
    if ($.support.documentStyles)
        $.support.vendorPrefix = (Array.prototype.slice.call($.support.documentStyles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];

    $.prefixCss = function(str) {
        if ($.support.vendorPrefix) {
            return '-' + $.support.vendorPrefix + '-' + str;
        } else return str;
    };

    $.supported = function(cssProperty) {
        function isSupported(prop) {
            return $.support.documentStyles &&
                (($.support.documentStyles.hasOwnProperty &&
                        $.support.documentStyles.hasOwnProperty(prop)) ||
                    $.support.documentStyles[prop]);
        }
        var s;
        if (typeof $.support[cssProperty] !== 'boolean') {
            s = isSupported(cssProperty);
            s = typeof s === 'boolean' ? s : isSupported($.dasherize(cssProperty));
            s = typeof s === 'boolean' ? s : isSupported($.camelCase(cssProperty));
        }
        $.support[cssProperty] = !!s;
        return $.support[cssProperty];
    };

    $.support.cssProperties = {
        backgroundSize: $.supported('backgroundSize')
    };

    /***
     * test and add $.support for rgb & rgba
     */
    $(function () {
        (function() {
            var testElement = $('<div style="width: 0; height: 0; border: 0; margin: 0; position:absolute; z-index: -1">').appendTo('body'),
                testColor = function(regex, value) {
                    var supported;
                    try {
                        testElement[0].style.color = value;
                        supported = regex.test(testElement.style('color'));
                    } catch (e) {}
                    if (supported === undefined) {
                        testElement.css('color', value);
                        supported = regex.test(testElement.style('color'));
                    }
                    return supported;
                };
            $.support.rgba = testColor(/rgba/i, 'rgba(0, 0, 0, 0.5)');
            $.support.rgb = $.support.rgba || testColor(/rgb/i, 'rgb(0, 0, 0)');
            testElement.remove();
        })();
    });

})(jQuery);