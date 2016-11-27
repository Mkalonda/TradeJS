declare let __stack:any;

Object.defineProperty(global, '__stack', {
    get: function() {
        var orig = (<any>Error).prepareStackTrace;
        (<any>Error).prepareStackTrace = function(_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        (<any>Error).prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function() {
        return (<any>global).__stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
    get: function() {
        return (<any>global).__stack[1].getFunctionName();
    }
});