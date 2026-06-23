var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WasmParserAdapter } from '@cucumber/language-service/wasm';
import assert from 'assert';
import { Duplex } from 'stream';
import { NullLogger, StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node';
import { createProtocolConnection, DidChangeConfigurationNotification, InitializeRequest, InsertTextFormat, LogMessageNotification, TextDocuments, } from 'vscode-languageserver';
import { createConnection } from 'vscode-languageserver/node';
import { CompletionRequest, } from 'vscode-languageserver-protocol/lib/common/protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompletionItemKind } from 'vscode-languageserver-types';
import { CucumberLanguageServer } from '../src/CucumberLanguageServer.js';
import { NodeFiles } from '../src/node/NodeFiles.js';
describe('CucumberLanguageServer', () => {
    let inputStream;
    let outputStream;
    let clientConnection;
    let serverConnection;
    let documents;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        inputStream = new TestStream();
        outputStream = new TestStream();
        serverConnection = createConnection(inputStream, outputStream);
        documents = new TextDocuments(TextDocument);
        new CucumberLanguageServer(serverConnection, documents, new WasmParserAdapter('node_modules/@cucumber/language-service/dist'), (rootUri) => new NodeFiles(rootUri), () => undefined);
        serverConnection.listen();
        const initializeParams = {
            rootUri: `file://${process.cwd()}`,
            processId: NaN, // This id is used by vscode-languageserver. Set as NaN so that the watchdog responsible for watching this process does not run.
            capabilities: {
                workspace: {
                    configuration: true,
                    didChangeWatchedFiles: {
                        dynamicRegistration: true,
                    },
                },
                textDocument: {
                    moniker: {
                        dynamicRegistration: false,
                    },
                    completion: {
                        completionItem: {
                            snippetSupport: true,
                        },
                    },
                    semanticTokens: {
                        tokenTypes: [],
                        tokenModifiers: [],
                        formats: [],
                        requests: {},
                    },
                    formatting: {
                        dynamicRegistration: true,
                    },
                },
            },
            workspaceFolders: null,
        };
        clientConnection = createProtocolConnection(new StreamMessageReader(outputStream), new StreamMessageWriter(inputStream), NullLogger);
        clientConnection.onError((err) => {
            console.error('ERROR', err);
        });
        // Ignore log messages
        clientConnection.onNotification(LogMessageNotification.type, () => undefined);
        clientConnection.onUnhandledNotification((n) => {
            console.error('Unhandled notification', n);
        });
        clientConnection.listen();
        const { serverInfo } = yield clientConnection.sendRequest(InitializeRequest.type, initializeParams);
        assert.strictEqual(serverInfo === null || serverInfo === void 0 ? void 0 : serverInfo.name, 'Cucumber Language Server');
    }));
    afterEach(() => {
        clientConnection.end();
        clientConnection.dispose();
        serverConnection.dispose();
    });
    context('textDocument/completion', () => {
        const fileExtensions = [
            // Javascript
            'js',
            'cjs',
            'mjs',
            // Typescript
            'ts',
            'cts',
            'mts',
        ];
        fileExtensions.forEach((fileExtension) => it(`returns completion items for *.${fileExtension} files`, () => __awaiter(void 0, void 0, void 0, function* () {
            // First we need to configure the server, telling it where to find Gherkin documents and Glue code.
            // Note that *pushing* settings from the client to the server is deprecated in the LSP. We're only using it
            // here because it's easier to implement in the test.
            const settings = {
                features: ['testdata/**/*.feature'],
                glue: [`testdata/**/*.${fileExtension}`],
                parameterTypes: [],
                snippetTemplates: {},
            };
            const configParams = {
                settings,
            };
            yield clientConnection.sendNotification(DidChangeConfigurationNotification.type, configParams);
            // TODO: Wait for a WorkDoneProgressEnd notification instead
            yield new Promise((resolve) => setTimeout(resolve, 1000));
            // Create a document for auto completion
            documents.get = () => TextDocument.create('testdoc', 'gherkin', 1, `Feature: Hello
  Scenario: World
    Given I have
    `);
            const completionParams = {
                textDocument: {
                    uri: 'features/test.feature',
                },
                position: {
                    line: 2, // The step line
                    character: 16, // End of the step line
                },
            };
            const completionItems = yield clientConnection.sendRequest(CompletionRequest.type, completionParams);
            const expected = [
                {
                    label: 'I have {int} cukes',
                    filterText: 'I have',
                    sortText: '1000',
                    insertTextFormat: InsertTextFormat.Snippet,
                    kind: CompletionItemKind.Text,
                    labelDetails: {},
                    textEdit: {
                        newText: 'I have ${1|5,8|} cukes',
                        range: {
                            start: {
                                line: 2,
                                character: 10,
                            },
                            end: {
                                line: 2,
                                character: 16,
                            },
                        },
                    },
                },
            ];
            assert.deepStrictEqual(completionItems, expected);
        })));
    });
});
class TestStream extends Duplex {
    _write(chunk, _encoding, done) {
        this.emit('data', chunk);
        done();
    }
    _read() {
        // no-op
    }
}
//# sourceMappingURL=CucumberLanguageServer.test.js.map