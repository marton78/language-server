import { WasmParserAdapter } from '@cucumber/language-service/wasm';
import { PassThrough } from 'stream';
import { TextDocuments } from 'vscode-languageserver';
import { createConnection } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CucumberLanguageServer } from '../CucumberLanguageServer.js';
export function startEmbeddedServer(wasmBaseUrl, makeFiles, onReindexed) {
    const adapter = new WasmParserAdapter(wasmBaseUrl);
    const inputStream = new PassThrough();
    const outputStream = new PassThrough();
    const connection = createConnection(inputStream, outputStream);
    const documents = new TextDocuments(TextDocument);
    const server = new CucumberLanguageServer(connection, documents, adapter, makeFiles, onReindexed);
    connection.listen();
    return {
        writer: inputStream,
        reader: outputStream,
        server,
        connection,
    };
}
//# sourceMappingURL=startEmbeddedServer.js.map