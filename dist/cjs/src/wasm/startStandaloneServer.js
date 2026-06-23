"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startStandaloneServer = startStandaloneServer;
const wasm_1 = require("@cucumber/language-service/wasm");
const vscode_languageserver_1 = require("vscode-languageserver");
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const CucumberLanguageServer_1 = require("../CucumberLanguageServer");
function startStandaloneServer(wasmBaseUrl, makeFiles) {
    const adapter = new wasm_1.WasmParserAdapter(wasmBaseUrl);
    const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
    const documents = new vscode_languageserver_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
    new CucumberLanguageServer_1.CucumberLanguageServer(connection, documents, adapter, makeFiles, () => undefined);
    connection.listen();
    return {
        connection,
    };
}
//# sourceMappingURL=startStandaloneServer.js.map