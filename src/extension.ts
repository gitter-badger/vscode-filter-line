'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "filter-line" is now active!');


    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable1 = vscode.commands.registerCommand('extension.filterLineWithOneRegex', () => {
        // The code you place here will be executed every time your command is executed
        let filter = new FilterLineWithOneRegex();
        filter.filter();
        context.subscriptions.push(filter);
    });

    let disposable2 = vscode.commands.registerCommand('extension.filterLineWithRegexConfig', () => {
        // The code you place here will be executed every time your command is executed

        let filter = new FilterLineWithRegexConfig();
        filter.filter();
        context.subscriptions.push(filter);
    });

    context.subscriptions.push(disposable1);
    context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() {
}


class FilterLineBase{

    public showInfo(text: string){
        vscode.window.showInformationMessage(text);
    }
    public showError(text: string){
        vscode.window.showErrorMessage(text);
    }


}
class FilterLineWithOneRegex extends FilterLineBase{
    private _regex?: RegExp;

    public filter(){

        let editor = vscode.window.activeTextEditor;
        if(!editor){
            this.showError('No file selected');
            return;
        }

        let doc = editor.document;
        console.log(doc.languageId);
        if(doc.isDirty){
            this.showError('Save before filter line');
            return;
        }
        
        vscode.window.showInputBox().then(text => {
            if(text === undefined || text === ''){
                console.log('No input');
                return;
            }
            console.log('input : ' + text);
            console.log('file : ' + doc.fileName);

            this._regex = new RegExp(text);

            this.filterFile(doc.fileName);
        });
    }
    dispose(){
    }

    private filterFile(filePath: string){
        // read file
        const readline = require('readline');
        const fs = require('fs');
        var path = require('path');

        const rl = readline.createInterface({
            input: fs.createReadStream(filePath)
        });

        let outputPath = filePath + '.filterline' + path.extname(filePath);
        console.log('output : ' + outputPath);
        if(fs.existsSync(outputPath)){
            console.log('output file already exist, force delete');
            fs.unlinkSync(outputPath);
        }

        // open write file
        let output = fs.createWriteStream(outputPath);
        output.on('open', ()=>{
            // filter line by line
            rl.on('line', (line: string)=>{
                
                console.log('line ', line);
                if(this.matchLine(line)){
                    output.write(line + '\n');
                }

            }).on('close',()=>{
                console.log('finish');
                this.showInfo('complete');
                vscode.workspace.openTextDocument(outputPath).then((doc: vscode.TextDocument)=>{
                    console.log('opened');
                    vscode.window.showTextDocument(doc);
                });
            });
        });
    }

    private matchLine(line: string) : boolean{
        if(this._regex === undefined){
            return false;
        }
        if(line.match(this._regex) !== null){
            return true;
        }
        return false;
    }
}

class FilterLineWithRegexConfig extends FilterLineBase{
    public filter(){
        let editor = vscode.window.activeTextEditor;
        if(!editor){
            this.showError('No file selected');
            return;
        }

        let doc = editor.document;
        let docContent = doc.getText()
        console.log(doc.languageId);
        console.log(docContent);
    }

    dispose(){
    }
}