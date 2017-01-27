import EA from 'tradejs/ea';

export default class MyEA extends EA {

    async init(): Promise<any> {
        await super.init();

        this.addIndicator('MA', {
            color: 'blue'
        });
        
        
    }

    onTick(): Promise<any> {
        super.onTick();
        
      
    }
}
