(function () {
    window.templates = window.templates || {};
    window.templates.gradient = function anonymous(locals, filters, escape /**/ ) {
        escape = escape ||
        function (html) {
            return String(html).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };
        var __stack = {
            lineno: 1,
            input: "<div class=\"md-gradient-colorpicker\" data-component=\"colorpicker\"></div>\n<div class=\"md-gradient-slider\">\n    <div class=\"gradient-color-stop\">\n        <div class=\"gradient-color-stop-pointer\"\n            data-component=\"triangle\"\n            data-option-direction=\"n\"\n            data-option-color=\"#333\"\n            data-option-width=\"12\"\n            data-option-height=\"6\"></div>\n        <div class=\"gradient-color-stop-color\"></div>\n        <div class=\"gradient-color-stop-bg\"></div>\n    </div>\n</div>",
            filename: "/Users/nathan/dev/src/buildserver/client/components/gradient/gradient-template.ejs"
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
                    buf.push('<div class="md-gradient-colorpicker" data-component="colorpicker"></div>\n<div class="md-gradient-slider">\n    <div class="gradient-color-stop">\n        <div class="gradient-color-stop-pointer"\n            data-component="triangle"\n            data-option-direction="n"\n            data-option-color="#333"\n            data-option-width="12"\n            data-option-height="6"></div>\n        <div class="gradient-color-stop-color"></div>\n        <div class="gradient-color-stop-bg"></div>\n    </div>\n</div>');
                })();
            }
            return buf.join('');
        } catch (err) {
            rethrow(err, __stack.input, __stack.filename, __stack.lineno);
        }
    };
})();