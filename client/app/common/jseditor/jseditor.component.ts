declare var ace: any;
declare var $: any;

import {Component, AfterViewInit, ElementRef} from '@angular/core';
import SocketService from '../../services/socket.service';

@Component({
    selector: 'js-editor',
    template: '<div></div>',
    styleUrls: ['./jseditor.component.css']
})

export default class JSEditorComponent implements AfterViewInit {
    editor: any;
    text = '';

    ace: any;
    currentFile: any;
    editorEl: HTMLElement;
    socket: any;

    constructor(private el: ElementRef, socket: SocketService) {
        this.socket = socket.socket;
    }

    ngAfterViewInit() {
        this.editorEl = this.el.nativeElement.firstElementChild;

        this.setEditor();
    }

    onBlur() {
        if (!this.editor.session.getUndoManager().isClean()) {
            this.saveFile();
        }
    }

    setEditor() {
        ace.require('ace/config').set('workerPath', '/assets/js/ace/');

        this.editor = ace.edit(this.editorEl);
        this.editor.setTheme('ace/theme/tomorrow_night_bright');
        this.editor.getSession().setMode('ace/mode/typescript');

        this.editor.commands.addCommand({
            name: 'saveFile',
            bindKey: {
                win: 'Ctrl-S',
                mac: 'Command-S',
                sender: 'editor|cli'
            },
            exec: (env, args, request) => {
                this.saveFile();
            }
        });

        this.editor.on('blur', this.onBlur.bind(this));
    }

    loadFile(path: any) {
        this.currentFile = path;
        this.socket.emit('file:load', {path: path}, (err: any, result: any) => {
            try {
                this.editor.session.setValue(result);
            } catch (err) {
                console.log(err);
            }
        });
    }

    saveFile() {
        return new Promise((resolve, reject) => {
            let content = this.editor.getValue();

            this.socket.emit('file:save', {path: this.currentFile, content: content}, () => {
                resolve();
            });
        });
    }
}