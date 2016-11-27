interface IDrawBufferSettings {
    id: string,
    type: string,
    data? : Array<any>,
    style?: {color?: string, width?: number}
}
let counter = 0;
export default class Indicator {

    points = [];
    type: string = '';
    drawBuffers: {} = {};

    value = 12;

    constructor(protected ticks) {
        this.init();
    }

    init(){}

    add(id, time, data) {
        this.drawBuffers[id].data.push([time, data]);
    }

    addDrawBuffer(settings: IDrawBufferSettings) {
        if (this.drawBuffers[settings.id])
            throw new Error('Buffer already set!');

        settings.data = settings.data || [];
        this.drawBuffers[settings.id] = settings;
    }

    getDrawBuffersData(count:number = 0, shift:number = 0) {
        let data = {},
            buffLength, drawBuffer;

        for (let id in this.drawBuffers) {
            drawBuffer = this.drawBuffers[id];
            buffLength = drawBuffer.data.length;

            data[id] = <IDrawBufferSettings>{
                id: drawBuffer.id,
                type: drawBuffer.type,
                style: drawBuffer.style,
                //data: this.drawBuffers[id].data.slice(0, buffLength - shift)
                data: drawBuffer.data.slice(buffLength - count, buffLength)
            };
        }

        return data;
    }

    _doCatchUp() {
        let len = this.ticks.length,
            i = 0;

        for (; i < len; i++) {
            this.onTick(len-i);
        }
    }

    onTick(shift?: number){}
}