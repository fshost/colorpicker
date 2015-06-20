(function(global, loaderName, payload, undefined) {

    global[loaderName] = global[loaderName] || {};

    (function() {

        function isArray(o) {
            return Object.prototype.toString.call(o) === '[object Array]';
        }

        function extend(target, source) {
            target = target || {};
            if (!source) return target;
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
            return target;
        }

        function clone(source) {
            return extend({}, source);
        }

        this.assets = {};

        this.settings = {
            assetAttributes: ['id', 'name', 'className'],
            environment: 'development',
            suppressAll: false,
            ignoreFail: false,
            defaults: {
                timeoutLength: 1000,
                intervalLength: 10,
                assetName: 'asset'
            }
        };

        this.unnamedAssetCt = 0;

        this.generateName = function() {
            return this.settings.defaults.assetName + this.unnamedAssetCt++;
        };

        this.memcache = {
            loading: {},
            failed: {},
            loadedUrls: {}
        };

        this.getAssetType = function(location) {
            var typeCheck;
            var loc = isArray(location) ? location[0] : location;
            for (var type in this.typeExtensions) {
                if (this.typeExtensions.hasOwnProperty(type)) {
                    typeCheck = this.typeExtensions[type];
                    if (loc.substr(-typeCheck.length) === typeCheck) {
                        return type;
                    }
                }
            }
            throw 'unknown asset type for asset location ' + loc;
        };

        this.deleteNode = function(delTest, asset, assetNode) {
            if (delTest) {
                asset[assetNode].parentNode.removeChild(asset[assetNode]);
                delete asset[assetNode];
            }
        };

        this.cleanup = function(asset) {
            this.deleteNode(asset.errors, asset, 'elem');
            this.deleteNode(asset.lscript, asset, 'lscript');
            for (var t in asset.timeoutChecks) {
                clearTimeout(asset.timeoutChecks[t]);
                delete asset.timeoutChecks[t];
            }
            for (var i in asset.intervalChecks) {
                clearInterval(asset.intervalChecks[i]);
                delete asset.intervalChecks[i];
            }
        };

        this.log = function() {
            if (typeof console !== 'undefined' && console.log !== undefined &&
                this.settings.debug) {
                var message = Array.prototype.slice.call(arguments).join(' ');
                console.log(message);
            }
        };

        this.nodeFactory = function(type, location, asset) {

            var el,
                attrList = this.settings.assetAttributes;
            this.log('creating ' + type + ' element for location ' + location);
            if (type == 'link') {
                el = document.createElement('link');
                el.rel = 'stylesheet';
                el.type = 'text/css';
                el.href = location;
            } else {
                el = document.createElement('script');
                el.src = location;
                el.type = 'text/javascript';
            }
            for (var index = 0; index < attrList.length; index++)
                if (asset[attrList[index]])
                    el[attrList[index]] = asset[attrList[index]];
            return el;

        };

        this.setListeners = function(asset) {
            var el = (asset.type !== 'css' || !asset.elemListenersSet) ? asset.elem : asset.lscript;
            if (el.addEventListener) {
                el.addEventListener('load', this.onLoadFactory(asset), false);
                if (el.readyState) el.addEventListener('readystatechange', this.onLoadFactory(asset, true), false);
                el.addEventListener('error', this.onErrorFactory(asset), false);
            } else if (el.attachEvent) {
                el.attachEvent('onload', this.onLoadFactory(asset));
                if (el.readyState) el.addEventListener('onreadystatechange', this.onLoadFactory(asset, true), false);
                el.attachEvent('onerror', this.onErrorFactory(asset));
            } else {
                el.onload = link.onreadystatechanged = this.onLoadFactory(asset);
                el.onerror = this.onErrorFactory(asset);
            }
            if (asset.type === 'css' && !this.settings.detectsSheetLoad) {
                if (asset.elemListenersSet) {
                    delete asset.elemListenersSet;
                } else {
                    asset.elemListenersSet = true;
                    this.setListeners(asset);
                }
            }
            return asset;
        };

        this.killEvent = function(e) {
            e = e || window.event;
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
            }
            return false;
        };

        this.onLoadFactory = function(asset, checkReadyState) {
            var that = this;
            if (asset.errors) delete asset.errors;
            if (asset.type === 'css') {
                return function(e) {
                    if (!that.settings.detectsSheetLoad) {
                        if (e.target && (e.target.sheet || e.target.styleSheet || (e.target.nodeName && e.target.nodeName.toLowerCase() === 'link') || e.target.href)) {
                            that.settings.detectsSheetLoad = true;
                            that.log('load event of stylesheets is supported');
                        }
                    }
                    var rules,
                        el = asset.lscript || asset.elem,
                        readyState = checkReadyState ? el.readyState : 'complete',
                        sheet = asset.elem.sheet || asset.elem.styleSheet;
                    if (readyState === 'loaded') readyState = 'complete';
                    if (asset.loadStates.link !== 'loaded') {
                        if ((sheet && el.src) || readyState === 'complete') {
                            if (el.href || (sheet && el.src)) {
                                asset.loadStates.link = 'loaded';
                                that.success(asset);
                            } else {
                                asset.loadStates.script = 'loaded';
                            }
                        } else {
                            if (readyState === 'loading') {
                                // need to check when it loads manually for IE
                                asset.timeoutChecks.finalCheck = setTimeout(function() {
                                    if (currentLoadStates.link !== 'loaded') {
                                        onerror(e);
                                    }
                                }, asset.timeoutLength);
                            }
                            if (asset.intervalLength > 0) {
                                asset.intervalChecks.failCheck = setInterval(function() {
                                    if ((sheet && el.src) || (sheet && sheet.cssRules || sheet.rules)) {
                                        that.success(asset);
                                    }
                                }, asset.intervalLength);
                            }
                        }
                    }
                };
            } else if (asset.type === 'javascript') {
                return function(e) {
                    var readyState = checkReadyState ? asset.elem.readyState : 'complete';
                    if (readyState === 'loaded') readyState = 'complete';
                    if (readyState === 'complete')
                        that.success(asset, 'onload');
                };
            }
        };

        this.onErrorFactory = function(asset) {
            var that = this;
            return function(e) {
                that.log('onerror handler called for attempted load of asset: ' + asset.name);
                if (asset.errors) that.log('Prior error event(s) occurred for asset: ' + asset.name);
                else asset.errors = true;
                if (asset.type === 'css') {
                    var elType = asset.elem.href ? 'link' : 'script';
                    asset.loadStates[elType] = 'failed';
                }
                if (asset.type === 'javascript' || (asset.loadStates && asset.loadStates.link === 'failed' && asset.loadStates.script === 'failed')) {
                    that.fail(asset);
                }
                return that.killEvent(e);
            };
        };

        this.success = function(asset, listener) {
            if (listener !== 'fail') {
                this.log('success callback was called for asset "' + asset.name + '" from event handler for "' + listener + '" event');
                this.cleanup(asset);
            }
            if (asset.loadStates)
                asset.loadStates.link = 'loaded';
            asset.onSuccess();
            if (this._checkLoaded(asset) === true) {
                return;
            }
            asset.onLoad();
            this.memcache.loadedUrls[asset.location[0]] = true;
            delete this.memcache.loading[asset.name];
            var dependency, requireIndex,
                assets = this.assets;
            if (asset.chainLoads !== undefined) {
                for (var loadName in asset.chainLoads) {
                    dependency = assets[loadName];
                    requireIndex = dependency.requires.indexOf(asset.name);
                    dependency.requires.splice(requireIndex, 1);
                    if (dependency.requires.length === 0) this._loadAsset(dependency);
                }
            }
        };

        this.fail = function(asset) {
            this.log('failed to load asset "' + asset.name + '" from location "' + asset.location[0] + '"');
            this.cleanup(asset);
            if (this.memcache.failed[asset.name] === true)
                return;
            if (asset.location.length > 1) {
                asset.location.splice(0, 1);
                this.log('attempting reload of asset "' + asset.name + '" using next location');
                this._loadAsset(asset);
            } else if (this.settings.ignoreLoadFail) {
                this.log('ignoring load failure as specified in configuration');
                this.success(asset, 'fail');
            } else {
                this.memcache.failed[asset.name] = true;
                if (this.memcache.loading[asset.name]) delete this.memcache.loading[asset.name];
            }
        };

        this.loadScript = function(asset) {
            this.log('loading javascript asset "' + asset.name + '"');
            asset.elem = this.nodeFactory('script', asset.location[0], asset);
            this.setListeners(asset);
            document.getElementsByTagName('head')[0].appendChild(asset.elem);
            if (asset.timeoutLength > 0) {
                var that = this;
                asset.timeoutChecks.scriptMaster = setTimeout(function() {
                    that.log('timeout fired for asset "' + asset.name + '" load event may not have fired');
                    if (that._checkLoaded(asset)) {
                        that.log('timeout found that asset "' + asset.name + '" loaded');
                    } else {
                        that.log('timeout found that asset "' + asset.name + '" failed to load');
                        that.fail(asset);
                    }
                }, asset.timeoutLength);
            }

        };

        this._loadAsset = function(asset) {
            if (asset.type === 'javascript')
                this.loadScript(asset);
            else if (asset.type === 'css')
                this.loadCss(asset);
        };

        this.loadCss = function(asset) {
            var head = document.getElementsByTagName('head')[0];
            asset.elem = this.nodeFactory('link', asset.location[0], asset);


            if (!this.settings.detectsSheetLoad) {
                asset.lscript = this.nodeFactory('script', asset.location[0], asset);
                asset.lscript.type = 'text/template';
            }
            asset.loadStates = {
                link: false,
                script: false
            };
            this.setListeners(asset);
            head.appendChild(asset.elem);
            if (!this.settings.detectsSheetLoad) {
                head.appendChild(asset.lscript);
            }
            if (asset.loadStates.link !== 'loaded' && asset.timeoutLength > 0) {
                var that = this;
                asset.timeoutChecks.linkMaster = setTimeout(function() {
                    if ((asset.loadStates.link !== 'loaded' && asset.loadStates.script !== 'loaded') || !asset.elem.sheet) {
                        var elType = asset.elem.href ? 'link' : 'script';
                        asset.loadStates[elType] = 'failed';
                        that.fail(asset);
                    } else if (asset.loadStates.link === 'loaded' || (asset.loadStates.script === 'loaded' && asset.elem.sheet)) {
                        that.success(asset);
                    }
                }, asset.timeoutLength);
            }
        };

        this._checkLoaded = function(asset) {
            if (asset.isLoaded) return true;
            for (var i = 0, l = asset.location.length; i < l; i++) {
                if (this.memcache.loadedUrls[asset.location[i]]) {
                    asset.isLoaded = true;
                    return true;
                }
            }
            return false;
        };

        this._processAsset = function(asset) {
            var name = asset.name;
            if (asset.isProcessed) {
                if (asset.isLoaded) {
                    asset.onSuccess();
                }
                return;
            }
            asset.isProcessed = true;
            var chainAssetName,
                requiredName,
                requiredAsset,
                required = [],
                requiredAssets = asset.requires,
                requireCount = (requiredAssets) ? requiredAssets.length : 0;

            if (requiredAssets !== undefined && requireCount > 0) {
                for (var index = 0; index < requireCount; index++) {
                    requiredName = requiredAssets[index];
                    requiredAsset = this.assets[requiredName];
                    if (requiredAsset === undefined) {
                        throw 'unknown asset required:' + requiredName;
                    } else {
                        if (this.memcache.failed[requiredName]) {
                            if (asset.location.length > 0) asset.location = [];
                            this.event.fail(asset);
                        } else if (!this._checkLoaded(requiredAsset)) {
                            if (!(requiredAsset instanceof Asset)) {
                                this.assets[requiredName] = new Asset(requiredAsset);
                            }
                            required.push(requiredName);
                            requiredAsset.chainLoads = requiredAsset.chainLoads || {};
                            requiredAsset.chainLoads[name] = true;
                        }
                    }

                }
                asset.requires = required;
                if (asset.requires.length > 0) return;
            }
            // no required assets or preloaded, first time processed
            this.memcache.loading[name] = true;
            this._loadAsset(asset);
        };

        // load a collection of assets
        this.load = function(assets, settings, callback) {
            var name;
            var settingsType = typeof settings;
            if (settingsType === 'function') {
                callback = settings;
                settings = null;
            } else if (settingsType === 'object') {
                this.settings = extend(this.settings, settings);
            }
            var asset;
            if (typeof assets === 'string') {
                if (this.assets[assets]) {
                    if (callback) {
                        this.assets[assets].addCallbacks([callback]);
                    }
                    return this.loadOne(this.assets[assets]);
                }
                asset = {
                    location: assets
                };
                if (callback) {
                    asset.callbacks = [callback];
                }
                return this.loadOne(asset);
            } else if (assets.location) {
                if (this.assets[assets]) {
                    if (callback) {
                        this.assets[assets].addCallbacks([callback]);
                    }
                    return this.loadOne(this.assets[assets]);
                }
                if (callback) {
                    assets.callbacks = asset.callbacks || [];
                    assets.callbacks.push(callback);
                }
                return this.loadOne(assets);
            }

            var immCbs;
            for (name in assets) {
                if (assets.hasOwnProperty(name)) {
                    if (this.assets[name] && this._checkLoaded(this.assets[name])) {
                        immCbs = assets[name].callbacks;
                        if (immCbs) {
                            for (var i = 0, l = immCbs.length; i < l; i++) {
                                immCbs[i]();
                            }
                        }
                        delete assets[name];
                    }
                }
            }


            var curAsset, newAsset, loadList;
            var that = this;

            function getCb(name) {
                return function() {
                    loadList[name] = false;
                    var done = true;
                    for (var lkey in loadList) {
                        if (loadList.hasOwnProperty(lkey)) {
                            if (loadList[lkey]) {
                                if (that._checkLoaded(that.assets[lkey])) {
                                    delete loadList[lkey];
                                } else {
                                    done = false;
                                    break;
                                }
                            }
                        }
                    }
                    if (done) callback();
                };
            }

            if (callback) {
                var loadRequired = false;
                loadList = {};
                for (name in assets) {
                    if (assets.hasOwnProperty(name)) {
                        if (!this.assets[name] || !this._checkLoaded(this.assets[name])) {
                            loadRequired = true;
                            assets[name].callbacks = assets[name].callbacks || [];
                            assets[name].callbacks.push(getCb(name));
                            loadList[name] = true;
                        }
                    }
                }
                if (!loadRequired) {
                    return callback();
                }
            }

            for (name in assets) {
                if (assets.hasOwnProperty(name)) {
                    newAsset = assets[name];
                    curAsset = this.assets[name];
                    if (curAsset) {
                        curAsset.addCallbacks(newAsset.callbacks);
                    } else {
                        if (!(newAsset instanceof Asset)) {
                            newAsset = new Asset(name, newAsset);
                            if (this._checkLoaded(newAsset)) {
                                curAsset.addCallbacks(newAsset.callbacks);
                            } else assets[name] = newAsset;
                        }
                        this.assets[name] = assets[name];
                    }
                }
            }
            for (name in assets) {
                if (assets.hasOwnProperty(name)) {
                    this._processAsset(assets[name]);
                }
            }
        };

        // load a single asset
        this.loadOne = function(newAsset) {
            var asset = newAsset instanceof Asset ? newAsset : new Asset(newAsset);
            if (this.assets[asset.name]) {
                this.assets[asset.name].addCallbacks(asset.callbacks);
            } else if (this._checkLoaded(asset)) {
                asset.onSuccess();
            } else {
                this.assets[asset.name] = asset;
                this._processAsset(asset);
            }
        };

        var that = this;

        function Asset(name, props) {

            if (arguments.length === 0)
                throw 'no properties specified - cannot create empty asset';
            if (!props) {
                if (typeof name === 'string' || isArray(name)) {
                    props = {
                        location: name
                    };
                } else {
                    props = name;
                    name = props.name;
                }
            }
            for (var pname in props) {
                if (props.hasOwnProperty(pname)) {
                    this[pname] = props[pname];
                }
            }
            this.name = this.name || name || that.generateName();

            if (this.location === undefined || this.location.length === 0) throw name + ' must have a location specified!';
            else if (!isArray(this.location)) {
                if (typeof this.location === 'string') {
                    this.location = [this.location];
                    that.log('Warning: location for ' + name + ' is a string, value should be an array of string');
                } else {
                    throw 'asset ' + name + ': invalid location "' + this.location + '"; location should be array of strings';
                }
            }

            if (this.callbacks) {
                if (!isArray(this.callbacks)) this.callbacks = [this.callbacks];
            } else this.callbacks = [];
            if (this.callback) {
                this.callbacks.push(this.callback);
            }
            this.type = this.type || this.getType();

            if (this.timeoutLength === undefined || !isNaN(this.timeoutLength))
                this.timeoutLength = that.settings.defaults.timeoutLength;
            if (this.intervalLength === undefined || !isNaN(this.intervalLength))
                this.intervalLength = that.settings.defaults.intervalLength;
            this.timeoutChecks = {};
            this.intervalChecks = {};

            if (this.requires) {
                var requires = [];
                if (!isArray(this.requires)) this.requires = [this.requires];
                for (var requireName, requiredAsset, i = 0, l = this.requires.length; i < l; i++) {
                    requireName = this.requires[i];
                    requiredAsset = that.assets[requireName];
                    if (!requiredAsset || !that._checkLoaded(requiredAsset)) {
                        requires.push(requireName);
                    }
                }
                if (requires.length) {
                    this.requires = requires;
                } else delete this.requires;
            }
        }

        Asset.prototype.onLoad = function() {
            this.isLoaded = true;
            this.onSuccess();
        };

        Asset.prototype.onSuccess = function() {
            if (this.callbacks && this.callbacks.length) {
                while (this.callbacks.length) {
                    this.callbacks.pop()();
                }
            }
        };

        Asset.prototype.typeExtensions = {
            javascript: '.js',
            css: '.css'
        };

        Asset.prototype.getType = function() {
            var typeCheck;
            var location = this.location;
            var loc = location[0];
            for (var type in this.typeExtensions) {
                if (this.typeExtensions.hasOwnProperty(type)) {
                    typeCheck = this.typeExtensions[type];
                    if (loc.substr(-typeCheck.length) === typeCheck) {
                        return type;
                    }
                }
            }
            throw 'unknown asset type for location ' + loc;
        };

        Asset.prototype.addCallbacks = function(newCallbacks) {
            if (newCallbacks && newCallbacks.length) {
                var curCallbacks = this.callbacks;
                if (curCallbacks) {
                    var curCb, newCb, cbMatch;
                    for (var i = 0, l = newCallbacks.length; i < l; i++) {
                        cbMatch = false;
                        newCb = newCallbacks[i];
                        for (var j = 0, l2 = curCallbacks.length; j < l2; j++) {
                            curCb = curCallbacks[j];
                            if (newCb === curCb) {
                                cbMatch = true;
                                break;
                            }
                        }
                        if (!cbMatch) {
                            if (this.isLoaded) {
                                newCb();
                            } else {
                                this.callbacks.push(newCb);
                            }
                        }
                    }
                } else {
                    this.callbacks = newCallbacks;
                }
            }
        };

    }).apply(global[loaderName]);

    global[loaderName].load({
        jquery: {
            location: [
                'http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js',
                '/components/jquery/jquery-1.11.3.min.js'
            ]
        },
        jqueryUi: {
            location: [
                'http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js',
                'components/jquery-ui/jquery-ui-1.11.4.min.js'
            ],
            requires: [
                'jquery',
                'jqueryUiTheme'
            ]
        },
        jqueryUiTheme: {
            location: [
                'https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.min.css',
                'components/jquery-ui-1.11.4.min.css'
            ]
        },
        jqueryUtils: {
            location: [
                'components/jquery-utils/jquery.utils.js'
            ],
            requires: [
                'jquery'
            ]
        },
        veeslider: {
            location: [
                'components/veeslider/veeslider.js'
            ],
            requires: [
                'jquery',
                'jqueryUi',
                'jqueryUtils',
                'veesliderStyles'
            ]
        },
        veesliderStyles: {
            location: [
                'components/veeslider/veeslider.css'
            ],
            requires: [
                'jquery',
                'jqueryUi',
                'jqueryUtils'
            ]
        },
        colorpicker: {
            location: [
                'components/colorpicker/colorpicker.js'
            ],
            requires: [
                'jquery',
                'jqueryUi',
                'jqueryUtils',
                'veeslider',
                'colorpickerStyles',
                'colorpickerTemplate'
            ]
        },
        colorpickerStyles: {
            location: [
                'components/colorpicker/colorpicker.css'
            ],
            requires: [
                'jquery',
                'jqueryUi',
                'jqueryUtils',
                'veeslider'
            ]
        },
        colorpickerTemplate: {
            location: [
                'components/colorpicker/colorpicker-template.js'
            ],
            requires: [
                'jquery',
                'jqueryUi',
                'jqueryUtils',
                'veeslider',
                'colorpickerStyles'
            ]
        },
        triangle: {
            location: [
                'components/triangle/triangle.js'
            ],
            requires: [
                'jquery',
                'jqueryUtils',
            ]
        },
        gradient: {
            location: [
                'components/gradient/gradient.js'
            ],
            requires: [
                'jquery',
                'jqueryUi',
                'jqueryUtils',
                'veeslider',
                'colorpicker',
                'triangle',
                'gradientStyles',
                'gradientTemplate'
            ]
        },
        gradientStyles: {
            location: [
                'components/gradient/gradient.css'
            ],
            requires: [
                'jquery',
                'jqueryUi',
                'jqueryUtils',
                'veeslider',
                'colorpicker',
                'triangle'
            ]
        },
        gradientTemplate: {
            location: [
                'components/gradient/gradient-template.js'
            ],
            requires: [
                'jquery',
                'jqueryUi',
                'jqueryUtils',
                'veeslider',
                'colorpicker',
                'triangle',
                'gradientStyles'
            ]
        }
    });

    // [global namespace], [asset loader namespace], [payload path]
})(window, 'dependencies', 'js/dependencies.js');