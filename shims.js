// Credit:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// requestAnimationFrame polyfill by Erik Möller
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// Credit:
// Patricio Palladino – https://gist.github.com/520547
// Prototypal inheritance with automatic initialization in JavaScript
(function (undefined) {
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    var createMethod = function () {
        var obj = Object.create(this);
        obj.initialize.apply(obj, arguments);

        return obj;
    };

    function createBasePrototype(prototype) {
        if (prototype.initialize === undefined) {
            prototype.initialize = function () {};
        }

        prototype.create = createMethod;

        return prototype;
    }

    function createDerivedPrototype(parent, atributes) {
        var prototype = Object.create(parent);

        for (var propertyName in atributes) {
            prototype[propertyName] = atributes[propertyName];
        }

        if (! prototype.hasOwnProperty('initialize')) {
            prototype.create = createMethod;
        } else {
            prototype.create = function () {
                var obj = Object.create(this),
                    args = Array.prototype.slice.call(arguments);

                args = [parent].concat(args);
                obj.initialize.apply(obj, args);

                return obj;
            };
        }

        return prototype;
    }

    Object.extend = function () {
        if (arguments[1] === undefined) {
            return createBasePrototype(arguments[0]);
        } else {
            return createDerivedPrototype(arguments[0], arguments[1]);
        }
    };
})();
