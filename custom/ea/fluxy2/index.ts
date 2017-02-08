import EA from 'tradejs/ea';

export default class MyEA extends EA {

    public async init(): Promise<any> {
        await super.init();

        this.addIndicator('MA', {
            color: 'blue'
        });
    }

    public async onTick(): Promise<any> {
        super.onTick();
    }
}

