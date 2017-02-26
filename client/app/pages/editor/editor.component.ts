declare let $: any;

import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import FileTreeComponent  from '../../common/file-tree/file-tree.component';
import JSEditorComponent  from '../../common/jseditor/jseditor.component';

@Component({
    selector: 'page-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})

export class EditorComponent implements AfterViewInit {

    // we pass the Component we want to get
    // assign to a public property on our class
    // give it the type for our component
    @ViewChild(FileTreeComponent) fileTree: FileTreeComponent;
    @ViewChild(JSEditorComponent) jsEditor: JSEditorComponent;

    constructor(private _router: Router) {}

    ngAfterViewInit(): void {

        this.fileTree.$el.off('select_node.jstree').on('select_node.jstree', (e: any, data: any) => {
            if (data.node && data.node.data && data.node.data.isFile) {
                let path = this.fileTree.$el.jstree(true).get_path(data.node, '/');
                this.jsEditor.loadFile(path);
            }
        });
    }

    async onClickRun() {
        try {
            await this.jsEditor.saveFile();
            this._router.navigate(['backtest', {run: true}]);
        } catch (err) {}
    }
}