declare var socket:any;
declare var ace:any;
declare var $:any;

import {Component, AfterViewInit, OnDestroy} from '@angular/core';
import {SocketService}  from '../../services/socket.service';

@Component({
    selector: 'file-tree',
    templateUrl: './file-tree.component.html',
    styleUrls: ['./file-tree.component.css']
})


export default class FileTreeComponent implements AfterViewInit, OnDestroy {

    socket: any;

    $el: any;
    jstree: any;
    loaded: boolean;

    constructor(socket: SocketService) {
        this.socket = socket.socket;

        this.jstree = null;
        this.loaded = false;
    }

    ngAfterViewInit(): void {
        this.init();
    }

    ngOnDestroy(): void {

    }

    init() {

        this.$el = $('#fileListContainer');

        this.$el.off('changed.jstree"').on("changed.jstree", this.onChange.bind(this));

        this.socket.on('file:list', (err:any, result:Object) => {

            if (err)
                return this._showError(err);

            if (!result)
                return;

            if (this.jstree)
                return this.update(result);

            this.$el.jstree({
                plugins: [
                    'state',
                    'cookies',
                    'ui',
                    'html_data'
                ],
                core: {
                    multiple: false,
                    data: this.convertData(result),
                    themes: {
                        name: "default-dark",
                        dots: true,
                        icons: true
                    }
                }
            });

            this.jstree = this.$el.jstree(true);
        });

        this.socket.emit('file:list');
    }

    update(data:Object) {
        let state = this.jstree.get_state();
        this.$el.jstree(true).settings.core.data = this.convertData(data);
        this.$el.jstree("refresh");
        this.jstree.set_state(state);
    }

    onChange(e:any, data:any) {

    }

    convertData(obj:any) {
        obj.text = obj.text || obj.name;
        obj.id = 'file_tree_' + obj.path;
        obj.data = {path: obj.path, isFile: typeof obj.extension != 'undefined'};

        delete obj.name;

        if (obj.extension) {
            obj.icon = "glyphicon glyphicon-file";
        }
        if (obj.children) {
            for(var i = 0, len = obj.children.length; i < len; i++) {
                this.convertData.call(this, obj.children[i]);
            }
        }

        return obj;
    }

    _showError(err:string) {

    }
}