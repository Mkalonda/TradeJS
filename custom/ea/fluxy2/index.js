const EA = require('../../../dist/server/ea/EA').default;

class MyEA extends EA {

    async init() {
        await super.init();

        this.setIndicator('MA', [10, 20, 30, 40, 50]);
    }

    onTick() {
        super.onTick();
    }
}

module.exports = MyEA;
module.exports.default = MyEA;