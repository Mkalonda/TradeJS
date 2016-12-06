import EA from '../../../dist/server/ea/EA';

export default class MyEA extends EA {

    async init() {
        await super.init();

        this.addIndicator('MA', {
            color: 'blue'
        });
    }

    onTick() {
        super.onTick();
    }
}