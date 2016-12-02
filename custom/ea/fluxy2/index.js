const EA = require('../../../dist/server/ea/EA').default;

class MyEA extends EA {

    async init() {
        await super.init();

        this.addIndicator('MA', {
            color: 'blue',
            period: 2
        });
    }

    onTick() {
        super.onTick();
    }
}

module.exports = MyEA;
module.exports.default = MyEA;