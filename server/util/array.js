'use strict';
const toBuffer = require('typedarray-to-buffer');
module.exports.arrayToFloat64Buffer = candles => {
    if (candles instanceof Buffer)
        return candles;
    if (ArrayBuffer.isView(candles))
        return toBuffer(candles);
    if (Array.isArray(candles)) {
        let buffer = new Buffer(candles.length * Float64Array.BYTES_PER_ELEMENT), i = 0, len = candles.length;
        for (; i < len; i++) {
            buffer.writeDoubleLE(parseFloat(candles[i]), i * Float64Array.BYTES_PER_ELEMENT);
        }
        return buffer;
    }
    throw new Error('Unknown data type');
};
//# sourceMappingURL=array.js.map
//# sourceMappingURL=array.js.map
//# sourceMappingURL=array.js.map
//# sourceMappingURL=array.js.map
//# sourceMappingURL=array.js.map
//# sourceMappingURL=array.js.map
//# sourceMappingURL=array.js.map

//# sourceMappingURL=array.js.map
