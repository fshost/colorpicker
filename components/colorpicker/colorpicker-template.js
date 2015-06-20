(function () {
    window.templates = window.templates || {};
    window.templates.colorpicker = function anonymous(locals, filters, escape /**/ ) {
        escape = escape ||
        function (html) {
            return String(html).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };
        var __stack = {
            lineno: 1,
            input: "<div class=\"md-colorpicker-container\">\n    <div class=\"md-colorpicker\">\n        <div class=\"md-cp-lightness-saturation-slider\"><i><b></b></i></div>\n        <div class=\"md-cp-hue-slider\" data-component=\"veeslider\" data-option-min=\"0\" data-option-max=\"359\"></div>\n        <div class=\"md-cp-alpha-slider\" data-component=\"veeslider\"></div>\n        <div class=\"md-colorpicker-preview-bg\">\n            <div class=\"md-colorpicker-preview\"></div>\n        </div>\n    </div>\n    <div class=\"md-colorpicker-values\">\n        <div class=\"md-colorpicker-input-group\">\n            <label class=\"md-colorpicker-label md-colorpicker-label-rgba md-colorpicker-label-r\" for=\"rvalue\">R</label>\n            <input class=\"md-colorpicker-input md-colorpicker-input-rgba md-colorpicker-input-r ui-corner-all\" data-color-property=\"red\" name=\"rvalue\">\n        </div>\n        <div class=\"md-colorpicker-input-group\">\n            <label class=\"md-colorpicker-label md-colorpicker-label-rgba md-colorpicker-label-g\" for=\"rvalue\">G</label>\n            <input class=\"md-colorpicker-input md-colorpicker-input-rgba md-colorpicker-input-g ui-corner-all\" data-color-property=\"green\" name=\"gvalue\">\n        </div>\n        <div class=\"md-colorpicker-input-group\">\n            <label class=\"md-colorpicker-label md-colorpicker-label-rgba md-colorpicker-label-b\" for=\"rvalue\">B</label>\n            <input class=\"md-colorpicker-input md-colorpicker-input-rgba md-colorpicker-input-b ui-corner-all\" data-color-property=\"blue\" name=\"bvalue\">\n        </div>\n        <div class=\"md-colorpicker-input-group\">\n            <label class=\"md-colorpicker-label md-colorpicker-label-rgba md-colorpicker-label-a\" for=\"rvalue\">A</label>\n            <input class=\"md-colorpicker-input md-colorpicker-input-rgba md-colorpicker-input-a ui-corner-all\" data-color-property=\"alpha\" name=\"avalue\">\n        </div>\n        <input class=\"md-colorpicker-input md-colorpicker-input-value ui-corner-all\" data-color-property=\"value\" name=\"color-value\">\n    </div>\n    <div class=\"md-colorpicker-presets\">\n        <div class=\"md-cp-presets-row\"></div>\n        <div class=\"md-cp-presets-row\"></div>\n    </div>\n</div>",
            filename: "/Users/nathan/dev/src/buildserver/client/components/colorpicker/colorpicker-template.ejs"
        };

        function rethrow(err, str, filename, lineno) {
            var lines = str.split('\n'),
                start = Math.max(lineno - 3, 0),
                end = Math.min(lines.length, lineno + 3);

            // Error context
            var context = lines.slice(start, end).map(function (line, i) {
                var curr = i + start + 1;
                return (curr == lineno ? ' >> ' : '    ') + curr + '| ' + line;
            }).join('\n');

            // Alter exception message
            err.path = filename;
            err.message = (filename || 'ejs') + ':' + lineno + '\n' + context + '\n\n' + err.message;

            throw err;
        }
        try {
            var buf = [];
            with(locals || {}) {
                (function () {
                    buf.push('<div class="md-colorpicker-container">\n    <div class="md-colorpicker">\n        <div class="md-cp-lightness-saturation-slider"><i><b></b></i></div>\n        <div class="md-cp-hue-slider" data-component="veeslider" data-option-min="0" data-option-max="359"></div>\n        <div class="md-cp-alpha-slider" data-component="veeslider"></div>\n        <div class="md-colorpicker-preview-bg">\n            <div class="md-colorpicker-preview"></div>\n        </div>\n    </div>\n    <div class="md-colorpicker-values">\n        <div class="md-colorpicker-input-group">\n            <label class="md-colorpicker-label md-colorpicker-label-rgba md-colorpicker-label-r" for="rvalue">R</label>\n            <input class="md-colorpicker-input md-colorpicker-input-rgba md-colorpicker-input-r ui-corner-all" data-color-property="red" name="rvalue">\n        </div>\n        <div class="md-colorpicker-input-group">\n            <label class="md-colorpicker-label md-colorpicker-label-rgba md-colorpicker-label-g" for="rvalue">G</label>\n            <input class="md-colorpicker-input md-colorpicker-input-rgba md-colorpicker-input-g ui-corner-all" data-color-property="green" name="gvalue">\n        </div>\n        <div class="md-colorpicker-input-group">\n            <label class="md-colorpicker-label md-colorpicker-label-rgba md-colorpicker-label-b" for="rvalue">B</label>\n            <input class="md-colorpicker-input md-colorpicker-input-rgba md-colorpicker-input-b ui-corner-all" data-color-property="blue" name="bvalue">\n        </div>\n        <div class="md-colorpicker-input-group">\n            <label class="md-colorpicker-label md-colorpicker-label-rgba md-colorpicker-label-a" for="rvalue">A</label>\n            <input class="md-colorpicker-input md-colorpicker-input-rgba md-colorpicker-input-a ui-corner-all" data-color-property="alpha" name="avalue">\n        </div>\n        <input class="md-colorpicker-input md-colorpicker-input-value ui-corner-all" data-color-property="value" name="color-value">\n    </div>\n    <div class="md-colorpicker-presets">\n        <div class="md-cp-presets-row"></div>\n        <div class="md-cp-presets-row"></div>\n    </div>\n</div>');
                })();
            }
            return buf.join('');
        } catch (err) {
            rethrow(err, __stack.input, __stack.filename, __stack.lineno);
        }
    };
})();