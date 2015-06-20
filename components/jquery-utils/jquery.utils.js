/*
 * Mashdraggin utilities
 * Copyright 2013 by Mashdraggin
 * MIT License
 */
(function($, undefined) {



    /***
     * jQuery.namespace
     * allows creating namespaces safely for plugins
     * http://stackoverflow.com/questions/1537848/jquery-plugin-namespace#answer-11441340
     * example usage:
     * $.namespace('milosz', {
     *   redify: function() {
     *      $(this).css('color', '#ff0000');
     *  }});
     * // then to execute the namespaced plugin
     *  $('.mydiv').milosz().redify();
     */


    $.namespace = function(namespaceName, closures) {
        if ($.fn[namespaceName] === undefined) {
            $.fn[namespaceName] = function executor(context) {
                if (this instanceof executor) {
                    this.__context__ = context;
                } else {
                    return new executor(this);
                }
            };
        }
        $.each(closures, function(closureName, closure) {
            $.fn[namespaceName].prototype[closureName] = function() {
                closure.apply(this.__context__, arguments);
            };
        });
    };

    // detemine if elements are after/before current element
    $.fn.isAfter = function(sel) {
        return this.prevAll(sel).length !== 0;
    };
    $.fn.isBefore = function(sel) {
        return this.nextAll(sel).length !== 0;
    };

    // select text nodes within an element
    $.fn.textNodes = function(notInChildren) {
        var nodes = this.find(':not(iframe)').addBack().contents().filter(function() {
            return this.nodeType == 3;
        });
        if (notInChildren) {
            nodes = nodes.not(this.children().find(nodes));
        }
        return nodes;
    };

    /*--------------------------------------------------------------------
        jQuery.opposite - returns the opposite of positions and complement of dimensions
        will match on lowercase, Capitalized, or ALLCAPS
        matches partials (e.g. 'myRight' => 'myLeft') due to Right & Left substrings
        examples:
        $.opposite('left') => 'right'
        $.opposite('marginBottomWidth') => 'marginTopWidth'
        $.opposite('HEIGHT') => 'WIDTH'
    *--------------------------------------------------------------------*/
    $.opposite = function(property) {
        var opposites = {
            left: 'right',
            top: 'bottom',
            width: 'height'
        };
        var key, thisOpp, result;
        var getOpposite = function(p) {
            if (opposites[p] !== undefined) {
                return opposites[p];
            } else {
                for (var k2 in opposites) {
                    if (opposites.hasOwnProperty(k2)) {
                        if (opposites[k2] === p) {
                            return k2;
                        }
                    }
                }
            }
        };
        // on the first call, store the pattern and matches for future calls
        if ($._opposite === undefined) {
            $._opposite = {};
            var propIterator = function(i, val) {
                var firstChar = val.substr(0, 1),
                    firstCharUp = firstChar.toUpperCase(),
                    wordRight = val.replace(firstChar, ''),
                    wordUp = val.toUpperCase();
                $._opposite[val] = {
                    pattern: new RegExp(['[', firstCharUp, '|', firstChar, ']', wordRight, '|', wordUp].join('')),
                    matches: {}
                };
                $._opposite[val].matches[val] = getOpposite(val);
                $._opposite[val].matches[val.toUpperCase()] = getOpposite(val).toUpperCase();
                $._opposite[val].matches[$.capitalize(val)] = $.capitalize(getOpposite(val));
            };
            for (key in opposites) {
                if (opposites.hasOwnProperty(key)) {
                    $([key, opposites[key]]).each();
                }
            }
        }
        // iterate patterns until a match is found
        for (key in $._opposite) {
            if ($._opposite.hasOwnProperty(key)) {
                result = property.match($._opposite[key].pattern);
                if (result) {
                    thisOpp = $._opposite[key].matches[result[0]];
                    thisOpp = property.replace(result[0], thisOpp);
                    return thisOpp;
                }
            }
        }
        return null;
    };

    // get all attributes of an element that have a value
    $.fn.getAttributes = function() {
        var elem = this,
            attr = {};
        if (elem.length) $.each(elem[0].attributes, function(v, n) {
            n = n.nodeName || n.name;
            v = elem.attr(n);
            if (v !== undefined) attr[n] = v;
        });
        return attr;
    };

    // find descendant element by classname
    // equivalent to $.fn.find('.' + className)
    $.fn.findClass = function(className) {
        return this.find('.' + className);
    };

    // append a new element with class specified (default tag is div)
    // options can include attributes and/or children
    $.fn.appendClass = function(className, options) {
        tag = tag || 'div';
        var defaults = {
                tag: 'div'
            },
            settings = options ? $.extend(true, defaults, options) : defaults,
            html = '<' + settings.tag;
        if (settings.attributes) {
            for (var key in settings.attributes) {
                html += ' ' + key + '="' + settings.attributes[key] + '"';
            }
        }
        html += '>';
        $(html).addClass(className).append(settings.children).appendTo(this);
        return this;
    };

    /*--------------------------------------------------------------------
    getGenId - a plugin to get and/or generate an id for an element
    generated id's are based on the UUID specification (to the extent it
    can be followed in a javascript client environment)
    options
    prefix                  - if asData is false, will prepend the id generated
    asData                  - store the id as data attribute
    propagateToId           - if storing as data attribute, also set id attribute
    forcePropagationToId    - will cause generated id to overwrite existing one
        
    if stored as data attribute, will set data-[prefix] attribute to [generatedId]
        
    *--------------------------------------------------------------------*/
    $.fn.getGenId = function(options) {
        if (this.length != 1) return; // must be called on exactly one element
        var defaultPrefix = 'md-uuid',
            uuidGen = function() {
                var S4 = function() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };
                return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
            },
            elemId = this.attr('id'),
            candidate,
            settings = $.extend({
                prefix: false,
                asData: false,
                propagateToId: true, // only if non-existant id, unless forced
                forcePropagationToId: false // force overwrite existing id
            }, options);
        // if element has an id, and not asked to store as a data attribute and not forcing, just return it
        if (!settings.asData && elemId && !(settings.propagateToId && settings.forcePropagationToId))
            return elemId;
        if (settings.asData) {
            settings.prefix = settings.prefix || defaultPrefix;
            do {
                candidate = uuidGen();
                // generate ids until we get one that is unique
            } while ($('#' + candidate).length > 0 && $(document).find('[data-' + settings.prefix + '="' + candidate + '"]').length > 0);
            if (settings.propagateToId && (!elemId || settings.forcePropagationToId)) {
                this.attr('id', candidate);
            }
            this.attr('data-' + settings.prefix, candidate);
        } else {
            // either the element has no id or forced to propagate generated one
            do {
                candidate = settings.prefix ? settings.prefix : '';
                candidate += uuidGen();
            } while ($('#' + candidate).length > 0);
            if (settings.propagateToId && (!elemId || settings.forcePropagationToId)) {
                this.attr('id', candidate);
            }
        }
        return candidate;
    };
    /*--------------------------------------------------------------------
     * adds aspect-oriented event triggers for the addClass, removeClass, toggleClass, and switchClass methods
     * -------------------------------------------------------------------- */
    $.each(['addClass', 'removeClass', 'toggleClass', 'switchClass'], function(i, methodName) {
        var origMethod = $.fn[methodName];
        $.fn[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            var capMethName = $.capitalize(methodName);
            this.trigger('before' + capMethName, args);
            origMethod.apply(this, args);
            this.trigger('after' + capMethName, args);
            return this;
        };
    });

    /*--------------------------------------------------------------------
    jQuery.renameProperty - rename property of an object
    if obj argument is omitted, renames property of the current context
    examples:
    $.renameProperty({ name: 'jane'}, 'name', 'firstname'); 
    // => { firstName: 'jane' }
    *--------------------------------------------------------------------*/
    $.renameProperty = function(obj, origName, newName, xformer) {
        var xformerType = typeof xformer;
        if ((arguments.length == 3 && typeof newName == 'function') || (arguments.length == 2)) {
            xformer = newName;
            newName = origName;
            origName = obj;
            obj = this;
        }
        if (xformerType == 'string' && typeof newName[xformer] == 'function')
            newName = newName[xformer]();
        else if (xformerType == 'function')
            newName = xformer(newName);
        obj[newName] = obj[origName];
        delete obj[origName];
        return obj;
    };

    /*--------------------------------------------------------------------
    jQuery.renameProperties - rename properties of an object
    arguments:
    obj         the object on which to rename properties
    props       an object, array or a regular expression
    newProps    a string or array of string
    xformer     optional function or method to transform new property names
    (note: if obj is omitted, renames properties of the current context)
    returns:
    obj         the modified object after renaming properties
    examples:
    $.renameProperties({ name: 'jane', dob: '1/1/1980' }, { name: 'firstName', dob: 'birthdate' }); 
    // => { firstName: 'jane', birthdate: '1/1/1980' }
    $.renameProperties({ borderTopWidth: 1, borderBottomWidth: 1 }, /^border|Width$/g, '', 'toLowerCase')
    // => { top: 1, bottom: 1 }
    *--------------------------------------------------------------------*/
    $.renameProperties = function(obj, props, newProps, xformer) {
        var i, l, key, propsType = $.type(props);
        if (arguments.length == 2 && !($.type(obj) == propsType && propsType == 'object')) {
            newProps = props;
            props = obj;
            propsType = $.type(props);
            obj = this;
        }
        if (propsType == 'object') {
            for (key in props) {
                obj = $.renameProperty(obj, key, props[key], xformer);
            }
        } else if (propsType == 'regexp') {
            for (key in obj) {
                if (obj.hasOwnProperty(key))
                    obj = $.renameProperty(obj, key, key.replace(props, newProps), xformer);
            }
        } else if (propsType == $.type(newProps) == 'array') {
            l = props.length;
            for (i = 0; i < l; i++) {
                obj = $.renameProperty(props[i], newProps[i], obj);
            }
        } else throw new TypeError('missing or unknown argument(s)');
        return obj;
    };

    /*--------------------------------------------------------------------
    * jQuery.callWith - calls a function/method with specified arguments
    *                    as an array for the first argument
    *                    optionally define a last argument as a 2nd argument
    *   arguments: (args, callback, lastArg)
    *       args - an array or arguments object
    *       callback - the function (or method, plugin, etc.) to call
    *       lastArg -   if the last argument can be an option, what its type
    *                   must be to determine whether to pass it as an option
    * example:
        function maybeSquared(args, squared) {
            if (squared) return args.map(function(v) { return v*v; });
            return args;
        }
        function someFunk() {
            return $.callWith(arguments, maybeSquared, 'boolean');
        }
        someFunk(3, 4, 5);       // => [ 3, 4, 5 ]
        someFunk(3, 4, 5, true);  // => [ 9, 16, 25 ]
    *--------------------------------------------------------------------*/
    $.callWith = function(args, callback, lastArg) {
        var opt;
        args = Array.prototype.slice.call(args);
        if (typeof callback == 'string') {
            if (typeof this[callback] == 'function')
                callback = this[callback];
            else if (typeof $[callback] == 'function')
                callback = $[callback];
        }
        if (typeof callback != 'function')
            throw new TypeError('second argument must be a function or method name');
        if (lastArg === true || (lastArg == $.type(args[args.length - 1]))) {
            opt = args.pop();
            return callback(args, opt);
        } else
            return callback(args);
    };


    /*--------------------------------------------------------------------
        jQuery.sum : returns the sum of values passed as an array, arguments, or object
        if 1 argument and it is an array, returns sum of its elements
        if 1 argument and it is an object, returns the sum of its property values
        if multiple arguments, returns sum of arguments (assumes they can be added)
        dependencies:
        jQuery.toArray plugin
        jQuery.reduce plugin
        examples:
        $.sum(1,2);     // => 3
        $.sum([1,2]);   // => 3
    *--------------------------------------------------------------------*/
    $.sum = function() {
        var args = arguments.length > 1 ? $.toArray(arguments) : $.toArray(arguments[0]);
        return $.reduce(args, function(a, b) {
            return a + b;
        });
    };


    /*------------------------------------------------------------------------------------
    jQuery.getDimension - returns dimension based on a property name    
    examples:
    $.getDimension('borderTopWidth');                        // => 'height'
    $.getDimension('beebop', 'unknown');                     // => 'unknown'
    $.getDimension('boobeep', { error: 'invalid property' }; // => throws Error
    $.getDimension('bopeep', function blah(p) { console.log('unknown property',p); });
    *----------------------------------------------------------------------------------*/
    $.getDimension = function(prop, defaultDim) {
        var defaultType = typeof defaultDim;
        if (/[T|t]op|[B|b]ottom/.test(prop)) return 'height';
        if (/[L|l]eft|[R|r]ight/.test(prop) || defaultDim === undefined) return 'width';
        if (defaultType == 'object' && defaultDim.error)
            throw new Error(defaultDim.error);
        if (defaultType == 'function') defaultDim(prop);
        return defaultDim;
    };

    /*--------------------------------------------------------------------
    jQuery.getPositions - returns property names based on a dimension
    if 2nd argument is true, returns wrapped as jQuery object
    examples:
    $.getPositions('height'); // => ['top','bottom']
    $.getPositions('width'); // => ['left','right']
    // below, 'each' method works in all browsers as it is the jQuery method
    $.getPositions('width', true).each(function() { 
    return $.capitalize(this);
    }); // => $(['Left','Right'])
    *--------------------------------------------------------------------*/
    $.getPositions = function(dimension, wrap) {
        var positions = {
            height: ['top', 'bottom'],
            width: ['left', 'right']
        }[dimension.toLowerCase()];
        return wrap ? $(positions) : positions;
    };

    // toPx, toEm, and tokenizeCss plugins for jQuery

    /*--------------------------------------------------------------------
     * tokenizeCss plugin
     * example: $.tokenizeCss('30px') => [30, 'px']
     *--------------------------------------------------------------------*/
    $.tokenizeCss = function(str) {
        if (!isNaN(str)) return [parseFloat(str), 'px'];
        var result = str.match(/^([\+\-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/);
        if (result) {
            result = result.splice(1);
            result[0] = parseFloat(result[0]);
        }
        return result;
    };

    /*--------------------------------------------------------------------
     * jQuery.toEm
     * original by Scott Jehl (scott@filamentgroup.com), http://www.filamentgroup.com
     * Modified to return numeric value only by default with additional options
     *       options
     *           includeUnit -   if set to true returns css string value, e.g. '1em'
     *                           default is false
     *           scope -         specify selector for element on which to base calculation
     *                           default is 'body'
     * examples:
     *   $(myPixelValue).toEm();                     // calculates based on body element
     *   $(myPixelValue).toEm({ scope: '#myDiv' });  // calculates based on #myDiv element
     *   $(myPixelValue).toEm({ includeUnit: true }); // value as css string e.g. '1em'
     *--------------------------------------------------------------------*/
    $.fn.toEm = function(settings) {
        settings = $.extend({
            scope: 'body',
            includeUnit: true
        }, settings);
        var that = parseInt(this[0], 10);
        var scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>')
            .appendTo(settings.scope);
        var scopeVal = scopeTest.height();
        scopeTest.remove();
        var finalVal = (that / scopeVal).toFixed(8);
        finalVal = (settings.includeUnit) ? finalVal + 'em' : finalVal;
        return finalVal;
    };

    /*--------------------------------------------------------------------
    jQuery.toPx plugin
    return numeric value of pixels equivalent for px, em, %, mm, cm, pt, pc, in
    arguments:
    cssVal  -   a css value to convert to pixels
    options
    dimension   'height'    required for conversion from %
    includeUnit false       append 'px' to return value
    round       true        round floats up to integer
    dpi         96          dots per inch (96 is standard for most displays)
    examples:
    $.toPx('30px');// => 30 (only purpose of this example is to show how it works)
    $('#myDiv').toPx('3em');
    $('#myDiv').toPx('25%'{ dimension: 'width', includeUnit: true });
    *--------------------------------------------------------------------*/
    $.fn.toPx = function toPx(cssVal, options) {
        var addValTo = {
                object: function(indexKey, val, unit) {
                    val = settings.round ? Math.ceil(val) : val;
                    val = settings.includeUnit ? val + unit : val;
                    retVal[indexKey] = val;
                    return retVal;
                },
                array: function(i, val, unit) {
                    i = parseInt(i, 10);
                    return addValTo.object(i, val, unit);
                }
            },
            settings = $.extend({
                dimension: 'height',
                includeUnit: false,
                round: true,
                dpi: 96
            }, options),
            dim = /height/.test(settings.dimension.toLowerCase()) ? 'height' : 'width',
            cratio,
            ratios = {
                'in': settings.dpi,
                mm: settings.dpi / 25.4,
                cm: settings.dpi / 2.54,
                pt: settings.dpi / 72,
                pc: settings.dpi / 6
            },
            valType = $.type(cssVal),
            addVal = addValTo[valType],
            testElem,
            parseVal,
            elemVal,
            retVal,
            unit,
            val,
            i;
        if (valType == 'number') return settings.includeUnit ? cssVal + 'px' : cssVal;
        if (valType == 'string') {
            cssVal = [cssVal];
            addVal = addValTo.array;
            retVal = [];
        } else if (valType == 'array') {
            retVal = [];
        } else if (valType == 'object') {
            retVal = {};
        }
        for (i in cssVal) {
            if (cssVal.hasOwnProperty(i)) {
                parseVal = $.tokenizeCss(cssVal[i]);
                if (parseVal === null && isNaN(cssVal[i])) {
                    // style property name, get computed value
                    retVal = addVal(i, this.stylesInt(cssVal[i])[$.camelCase(cssVal[i])], 'px');
                } else {
                    val = parseVal[0];
                    unit = parseVal[1];
                    if (unit == 'em') {
                        testElem = $('<div style="display: none; font-size: 1em; margins: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>')
                            .appendTo(this);
                        elemVal = testElem[dim]();
                        testElem.remove();
                        retVal = addVal(i, val * elemVal, 'px');
                    } else if (unit == '%') {
                        retVal = addVal(i, this[dim]() / 100 * val, 'px');
                    } else {
                        cratio = ratios[unit];
                        if (cratio !== undefined) retVal = addVal(i, val * cratio, 'px');
                        else retVal = addVal(i, val, unit); // 'px' already or can't convert
                    }
                }
            }
        }
        return valType == 'string' ? retVal[0] : retVal;
    };
    $.toPx = function(cssVal, options) {
        var settings = $.extend({
            refElem: 'body'
        }, options);
        return $(settings.refElem).toPx(cssVal, settings);
    };


    /*--------------------------------------------------------------------------
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
     *------------------------------------------------------------------------*/
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

    // jQuery.stylesInt - like styles except returns numeric values only, useful for calcs
    // note: non-numeric properties like color values will throw errors if used here
    $.fn.stylesInt = function() {
        var name, styles = this.styles.apply(this, arguments);
        for (name in styles) {
            if (styles.hasOwnProperty(name)) {
                if (styles[name] === '' || styles[name] === undefined || styles[name] === null)
                    styles[name] = 0;
                else
                    styles[name] = $.tokenizeCss(styles[name])[0];
            }
        }
        return styles;
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

    // sames as jQuery.stylesInt but for single property (see jQuery.style)
    $.fn.styleInt = function(propName) {
        return this.stylesInt(propName)[propName];
    };

    /*--------------------------------------------------------------------
     * jQuery.camelCase - convert dash-sep string to camelCase string
     * examples:
     *   $.camelCase('margin-left'); // => 'marginLeft'
     *   $.camelCase('border-top-width'); // => 'borderTopWidth'
     *--------------------------------------------------------------------*/
    $.camelCase = function(str) {
        return str.replace(/-([a-z])/ig, function(word, letter) {
            return letter.toUpperCase();
        });
    };

    /*--------------------------------------------------------------------
     * jQuery.dasherize - convert camelCase string to dash-sep string
     * examples:
     *   $.dasherize('marginLeft'); // => 'margin-left'
     *   $.dasherize('borderTopWidth'); // => 'border-top-width'
     *--------------------------------------------------------------------*/
    $.dasherize = function(str) {
        return $.trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
    };

    /*--------------------------------------------------------------------
     * jQuery.capitalize : will capitalize the first character of a string
     * example:
     *   $.capitalize('foo is boring'); // => 'Foo is boring'
     *--------------------------------------------------------------------*/
    // capitalize a string (capitalizes only the first word)
    $.capitalize = function(str) {
        return str.replace(/([a-z])/, function(word, letter) {
            return letter.toUpperCase();
        });
    };

    /***
     * jQuery.getType
     * alternative to jQuery type which correctly identifies the JavaScript
     * [[Class]] 'argument' type, created due to the fact that as of
     * jQuery 1.10.3, jQuery.type incorrectly returns 'object' for the
     * 'arguments' object in webkit browsers. This alternative uses the ES5.1
     * Spec to correctly return class type values, with a jQuery.type fallback
     */
    $.getType = function(o) {
        try {
            return Object.prototype.toString.call(o).replace('[object ', '').replace(']', '').toLowerCase();
        } catch (ex) {
            return $.type(o);
        }
    };

    /*--------------------------------------------------------------------
    * rootChild
    * a quick method of finding nth child of a single root element
    * (this is not the fastest method if there is more than one root element)
    * arguments: 'first', 'last', or an integer
    * examples:
    $('#id').rootChild('first');// returns 1st child
    $('#id').rootChild(7);      // returns 7th child
    $('#id').rootChild('last'); // returns 7th child
    *--------------------------------------------------------------------*/
    $.fn.rootChild = function(which) {
        var childElems = this.children(),
            n = childElems.length - 1,
            whichType = typeof which;
        if (whichType == 'undefined') which = 0;
        if (whichType == 'string') {
            which = which.toLowerCase();
            if (which == 'first')
                which = 0;
            else if (which == 'last')
                which = n;
            else
                which = parseInt(which, 10);
        }
        if (isNaN(which)) which = 0;
        else if (which > n) which = n;
        return $(childElems[n]);
    };

    /*--------------------------------------------------------------------
     * jQuery.toArray
     * converts objects values to arrays or jQuery objects
     * similar to the method for jQuery objects but works on any object
     * if o is null or undefined it is simply returned as-is
     * if o is an arguments object returns it as an array
     * if o has a toArray method returns value of that method
     * if o is an object and 2nd argument is the string 'keys', this becomes
     * functionally equivalent to Object.keys but is supported in all browsers.
     * if o is an object and a map function is provided as 2nd argument,
     * values are mapped before being pushed, map sig is (key, value, object)
     * all other values are simply wrapped in an array and returned
     * examples:
     * $.toArray(1); // => [1]
     * $.toArray({ a: 1, b: 2 }); // => [1,2]
     * $.toArray({ a: 1, b: 2 }, 'keys'); // => ['a', 'b']
     * $.toArray({ a: 1, b: 2 }, true);
     * $.toArray({ a: 1, b: 2 }, 'value'); // => [{ value: 1 }, { value: 2 }]
     *   // => [{ key: 'a', value: 1 }, { key: 'b', value: 2 }]
     * $.toArray({ a: 1, b: 2 }, function (key, value, obj) {
     *   return { value: value, squared: value * value }
     * }); // => [{ value: 1, squared: 1 }, { value: 2, squared: 4 }]
     *--------------------------------------------------------------------*/
    $.toArray = function(o, map) {
        if (o === undefined || o === null) return o;
        if ($.type(o.toArray) === 'function') return o.toArray();
        switch ($.getType(o)) {
            case 'array':
                return o;
            case 'object':
                var mo, keyName;
                if (map) {
                    if (map === 'keys') {
                        if (typeof Object.keys === 'function') return Object.keys(o);
                    } else if (map === true) map = function(k, v) {
                        return {
                            key: k,
                            value: v
                        };
                    };
                    else keyName = map;
                }
                var array = [];
                for (var key in o) {
                    if (map === 'keys') array.push(key);
                    else {
                        if (typeof map === 'function') array.push(map(key, o[key], o));
                        else if (keyName) {
                            mo = {};
                            mo[keyName] = o[key];
                            array.push(mo);
                        } else array.push(o[key]);
                    }
                }
                return array;
            case 'arguments':
                return Array.prototype.slice.call(o);
            default:
                return [o];
        }
    };


    /**
     * jQuery.keys
     * requires $.toArray
     * Object.keys with less typing and old browser support
     */
    $.keys = function(o) {
        return typeof Object.keys == 'function' ? Object.keys(o) : $.toArray(o, 'keys');
    };

    /***
     * jQuery.collect
     * although you can use jQuery's 'map' & 'each' methods with objects, the
     * 'add' method, if used on an object, normally returns an array.  This
     * plugin lets you create jQuery collections from objects that stores each
     * key/value hash as an object with two properties - key and value.
     * this allows you to use add in a useful way for objects in that each
     * object is distinct. Since the collection is a jQuery object, can also
     * chain other jQuery methods for collections like map, each, etc.
     * just remember that each object consists of two properties - e.g.
     * { key: <key>, value: <value> } when using these methods
     *
     * example:
     * var total = 0, c = $.collect({ border: 1, margin: 2})
     *      .add({ key: 'padding', value: 3})
     *      .each(function () {
     *          total += this.value;
     *      });
     * console.log(total); // => 6
     */
    $.collect = function(o) {
        return $($.toArray(o, true));
    };

    /*----------------------------------------------------------------------------------
     * jQuery.reduce
     * the same method as JS1.8 Array.reduce (provided here for non-compliant browsers)
     * the source and a complete description for this method can be found on MDN:
     * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/Reduce
     * example:
     *   $.reduce([1,2,3], function(a,b) { return a+b; }); // => 6 (the sum of this array)
     *   // (although this is more easily obtained with the 'sum' plugin)
     *----------------------------------------------------------------------------------*/
    $.reduce = function(a, callback, curr) {
        if (a === null || a === undefined)
            throw new TypeError('Array is null or undefined');
        if ($.type(a) == 'object')
            a = $(a).toArray();
        var i = 0,
            l = a.length >> 0;
        // ES5 : 'If IsCallable(callback) is false, throw a TypeError exception.'
        if (typeof callback !== 'function')
            throw new TypeError('second argument is not a function');
        if (curr === undefined) {
            if (l === 0) throw new TypeError('Array length is 0 and no initial value');
            curr = a[0];
            i = 1; // start accumulating at the second element
        }
        while (i < l) {
            if (i in a) curr = callback.call(undefined, curr, a[i], i, this);
            ++i;
        }
        return curr;
    };

    /*--------------------------------------------------------------------
    jQuery.combined : returns the sum of matched top/bottom or left/right properties
    for border, padding, or margins
                            
    required arguments (in order)
    property - string - a css property name, e.g. 'border'
    dimension - string - 'width' or 'height'
    optional arguments
    withUnit    - boolean - whether to include 'px' in return value
    examples:
    $('div').css('border', '1px solid black');  // setup for example
    $('div').combined('border','width');        // => 2
    $('div').combined('border','width', true); // => '2px'
    *--------------------------------------------------------------------*/
    $.fn.combined = function(property, dimension, includePx) {
        var subProperty = (property == 'border') ? 'Width' : '',
            positions = $.getPositions(dimension).map(function(v) {
                return $.capitalize(v);
            }),
            p1, p2;
        p1 = property + positions[0] + subProperty;
        p2 = property + positions[1] + subProperty;
        var sum = this.combinedCss(p1, p2);
        return includePx ? sum + 'px' : sum;
    };

    /*--------------------------------------------------------------------
    jQuery.combinedCss : returns the sum of numeric portion of properties
    for border, padding, or margins
                                
    required arguments (in order)
    property - string - a css property name, e.g. 'border'
    dimension - string - 'width' or 'height'
    optional arguments
    withUnit    - boolean - whether to include 'px' in return value
    examples:
    $('div').css('border', '1px solid black');
    $('div').combinedCss('topBorderWidth','leftBorderWidth');   // => 2
    *--------------------------------------------------------------------*/
    $.fn.combinedCss = function() {
        var total = $.sum(this.stylesInt.apply(this, arguments));
        return total;
    };

    /*--------------------------------------------------------------------
    jQuery.outerWidth 
    jQuery.outerHeight
    extends outerWidth and outerHeight to allow setting to values
    accounting for padding, and optionally border and/or margin
    arguments:
    value:  numeric pixel value to set height or width to
    includeBorder:  boolean, if true, considers border part of the height
    includeMargin:  boolean, if true, considers margin part of the height
    examples:
    $('div').outerWidth(100);
    $('div').outerWidth(100, true);
    $('div').outerHeight(50, true, true);
      
    Also allows for getting and setting these values using jQuery.css()
    propertyNames:
    outerWidth, outerHeight                         - returns size including padding
    outerBorderWidth, outerBorderHeight             - returns size including padding and border
    outerMarginWidth, outerMarginHeight             - returns size including padding and margin
    outerBorderMarginWidth, outerBorderMarginHeight - returns size including padding, border, and margin
    ( Additionally, jQuery.animate can be used with these properties as well )
    *--------------------------------------------------------------------*/
    $.each(['width', 'height'], function(i, dim) {
        var upDim = $.capitalize(dim),
            origOuter = 'origOuter' + upDim,
            outer = 'outer' + upDim;
        $.fn[origOuter] = $.fn[outer];
        $.fn[outer] = function(value, includeBorder, includeMargins) {
            var outer;
            // so as not to affect existing code, current behavior is maintained
            if (arguments.length < 2 && (value === undefined || $.type(value) == 'boolean'))
                return this[origOuter].apply(this, arguments);
            else {
                outer = this.combined('padding', dim);
                if (includeBorder) outer += this.combined('border', dim);
                if (includeMargins && !/button|select/i.test(this[0].nodeName)) outer += this.combined('margin', dim);
                value -= outer;
                this[dim](value);
                return this;
            }
        };
        if (!$.cssHooks) {
            throw ('jQuery 1.4.3 or above is required for this plugin to work');
        }
        $.cssNumber[outer] = true;
        $.fx.step[outer] = function(fx) {
            $.cssHooks[outer].set(fx.elem, fx.now + fx.unit);
        };
        $.cssHooks[outer] = {
            get: function(elem) {
                elem = $(elem);
                return elem[dim]() + elem.combined('padding', dim) + 'px';
            },
            set: function(elem, value) {
                $(elem)[outer](value);
            }
        };
        var outerBorderName = 'outerBorder' + upDim;
        $.cssNumber[outerBorderName] = true;
        $.fx.step[outerBorderName] = function(fx) {
            $.cssHooks[outerBorderName].set(fx.elem, fx.now + fx.unit);
        };
        $.cssHooks[outerBorderName] = {
            get: function(elem) {
                elem = $(elem);
                return elem[dim]() + elem.combined('padding', dim) + elem.combined('border', dim) + 'px';
            },
            set: function(elem, value) {
                $(elem)[outer](value, true);
            }
        };
        var outerMarginName = 'outerMargin' + upDim;
        $.cssNumber[outerMarginName] = true;
        $.fx.step[outerMarginName] = function(fx) {
            $.cssHooks[outerBorderMarginName].set(fx.elem, fx.now + fx.unit);
        };
        $.cssHooks[outerMarginName] = {
            get: function(elem) {
                elem = $(elem);
                return elem[dim]() + elem.combined('padding', dim) + elem.combined('margin', dim) + 'px';
            },
            set: function(elem, value) {
                $(elem)[outer](value, false, true);
            }
        };
        var outerBorderMarginName = 'outerBorderMargin' + upDim;
        $.cssNumber[outerBorderMarginName] = true;
        $.fx.step[outerBorderMarginName] = function(fx) {
            $.cssHooks[outerBorderMarginName].set(fx.elem, fx.now + fx.unit);
        };
        $.cssHooks[outerBorderMarginName] = {
            get: function(elem, computed, extra) {
                elem = $(elem);
                return elem[dim]() + elem.combined('padding', dim) + elem.combined('border', dim) + elem.combined('margin', dim) + 'px';
            },
            set: function(elem, value) {
                $(elem)[outer](value, true, true);
            }
        };
    });

    // find the nearest matching element
    // search order - siblings, parent, parent siblings
    $.fn.nearest = function(selector, level) {
        var candidate, nephews,
            closest = this.closest(selector),
            isOriginal = level === undefined;
        if (isOriginal) level = 0;
        else level++;

        function sendback(elem) {
            if (isOriginal) return elem;
            else return {
                element: elem,
                level: level
            };
        }
        var parent = this.parent();
        if (parent.is(selector)) return sendback(parent);
        var children = this.children();
        candidate = children.filter(selector);
        if (candidate.length) return sendback(candidate);
        var siblings = this.siblings();
        if (siblings.length) {
            candidate = siblings.filter(selector);
            if (candidate.length) return sendback(candidate);
            nephews = siblings.children();
            candidate = nephews.filter(selector);
            if (candidate.length) return sendback(candidate);
        }
        if (closest.length) return sendback(closest);
        candidate = null;
        var lowLevel = null;
        [parent.nearest(selector),
            nephews.nearest(selector),
            children.nearest(selector)
        ].each(function(i, curCand) {
            if (!curCand) return;
            if (curCand.element && curCand.element.length) {
                if (lowLevel === null || curCand.level < lowLevel) {
                    candidate = curCand.element;
                }
            }
        });
        if (candidate && candidate.length) sendback(candidate);
        else sendback($());
    };



    // sets some properties of $.support, including the document style properties and vendorPrefix
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

    // test and add $.support for rgb & rgba
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

    /***
     * addTemplate plugin - adds template to current element
     * Expects templates namespace to exist
     */
    window.templates = window.templates || {};
    $.fn.addTemplate = function() {
        var html;
        var args = Array.prototype.slice.call(arguments);
        var name = args.shift();
        if (args.length) {
            html = templates[name].apply(null, args);
        } else {
            html = templates[name]();
        }
        var templEl = $(html).appendTo(this);
        this.components().bindChanges();
        return this;
    };

    /***
     * components plugin - automatically calls method (e.g. plugin or widget) 
     * of every element with a data-component attribute.
     * Expects components namespace to exist.
     */
    window.components = window.components || {};
    $.fn.components = function() {
        var dcoptExpr = /^data-option-/;
        this.find('[data-component]').each(function() {
            var el = $(this),
                componentName = $.camelCase(el.data('component')),
                initComps = el.data('components-initialized') || [];

            // check if method exists on this element
            if ((initComps.indexOf(componentName) === -1) && typeof el[componentName] === 'function') {
                // check for options before calling method
                var hasOptions = false,
                    options = {},
                    attrs = el.getAttributes();
                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        key = key.toLowerCase();
                        if (dcoptExpr.test(key)) {
                            hasOptions = true;
                            var optionName = $.camelCase(key.replace(dcoptExpr, ''));
                            var optionValue = attrs[key];
                            options[optionName] = optionValue;
                        }
                    }
                }
                initComps.push(componentName);
                el.data('components-initialized', initComps);
                if (hasOptions) {
                    window.components[componentName] = el[componentName](options);
                } else window.components[componentName] = el[componentName]();
            }
        });
        $(document).trigger('componentsReady');
        return this;
    };

    /***
     * bindChanges - binds changes based on data-bind attribute
     */
    $.fn.bindChanges = function() {
        var doc = $(document);
        this.find('[data-bind]').each(function() {
            var el = $(this),
                bindName = el.data('bind'),
                eventName = 'change.' + bindName,
                oldEventName = el.data('bindEvent') || eventName,
                oldEventHandler = el.data('bindEventHandler'),
                eventHandler = function(event, data) {
                    if (event.target !== this && event.originalTarget !== this && data && (!data.element || data.element !== el)) {
                        el.val(data.value);
                    }
                };
            if (oldEventHandler) doc.off(oldEventName, oldEventHandler);
            doc.on(eventName, eventHandler);
            el.data('bindEvent', eventName);
            el.data('bindEventHandler', eventHandler);
            el.off('change');
            el.on('change', function(event) {
                doc.trigger(eventName, {
                    value: el.value,
                    element: el
                });
            });
        });
        return this;
    };


})(jQuery);