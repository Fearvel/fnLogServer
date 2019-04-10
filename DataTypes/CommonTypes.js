"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ctypes;
(function (ctypes) {
    var SimpleResult = /** @class */ (function () {
        function SimpleResult(res) {
            this.Result = res;
        }
        SimpleResult.prototype.toJSON = function () {
            return JSON.stringify(this);
        };
        return SimpleResult;
    }());
    ctypes.SimpleResult = SimpleResult;
    var FnLog = /** @class */ (function () {
        function FnLog() {
        }
        ;
        return FnLog;
    }());
    ctypes.FnLog = FnLog;
})(ctypes = exports.ctypes || (exports.ctypes = {}));
//# sourceMappingURL=CommonTypes.js.map