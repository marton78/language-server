"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmbeddedServer = startEmbeddedServer;
const wasm_1 = require("@cucumber/language-service/wasm");
const stream_1 = require("stream");
const vscode_languageserver_1 = require("vscode-languageserver");
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const CucumberLanguageServer_js_1 = require("../CucumberLanguageServer.js");
function startEmbeddedServer(wasmBaseUrl, makeFiles, onReindexed) {
    const adapter = new wasm_1.WasmParserAdapter(wasmBaseUrl);
    const inputStream = new stream_1.PassThrough();
    const outputStream = new stream_1.PassThrough();
    const connection = (0, node_1.createConnection)(inputStream, outputStream);
    const documents = new vscode_languageserver_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
    const server = new CucumberLanguageServer_js_1.CucumberLanguageServer(connection, documents, adapter, makeFiles, onReindexed);
    connection.listen();
    return {
        writer: inputStream,
        reader: outputStream,
        server,
        connection,
    };
}
//# sourceMappingURL=startEmbeddedServer.js.map