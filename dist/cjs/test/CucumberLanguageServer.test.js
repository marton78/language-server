"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wasm_1 = require("@cucumber/language-service/wasm");
const assert_1 = __importDefault(require("assert"));
const stream_1 = require("stream");
const node_1 = require("vscode-jsonrpc/node");
const vscode_languageserver_1 = require("vscode-languageserver");
const node_2 = require("vscode-languageserver/node");
const protocol_1 = require("vscode-languageserver-protocol/lib/common/protocol");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const CucumberLanguageServer_js_1 = require("../src/CucumberLanguageServer.js");
const NodeFiles_js_1 = require("../src/node/NodeFiles.js");
describe('CucumberLanguageServer', () => {
    let inputStream;
    let outputStream;
    let clientConnection;
    let serverConnection;
    let documents;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        inputStream = new TestStream();
        outputStream = new TestStream();
        serverConnection = (0, node_2.createConnection)(inputStream, outputStream);
        documents = new vscode_languageserver_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
        new CucumberLanguageServer_js_1.CucumberLanguageServer(serverConnection, documents, new wasm_1.WasmParserAdapter('node_modules/@cucumber/language-service/dist'), (rootUri) => new NodeFiles_js_1.NodeFiles(rootUri), () => undefined);
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
        clientConnection = (0, vscode_languageserver_1.createProtocolConnection)(new node_1.StreamMessageReader(outputStream), new node_1.StreamMessageWriter(inputStream), node_1.NullLogger);
        clientConnection.onError((err) => {
            console.error('ERROR', err);
        });
        // Ignore log messages
        clientConnection.onNotification(vscode_languageserver_1.LogMessageNotification.type, () => undefined);
        clientConnection.onUnhandledNotification((n) => {
            console.error('Unhandled notification', n);
        });
        clientConnection.listen();
        const { serverInfo } = yield clientConnection.sendRequest(vscode_languageserver_1.InitializeRequest.type, initializeParams);
        assert_1.default.strictEqual(serverInfo === null || serverInfo === void 0 ? void 0 : serverInfo.name, 'Cucumber Language Server');
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
            yield clientConnection.sendNotification(vscode_languageserver_1.DidChangeConfigurationNotification.type, configParams);
            // TODO: Wait for a WorkDoneProgressEnd notification instead
            yield new Promise((resolve) => setTimeout(resolve, 1000));
            // Create a document for auto completion
            documents.get = () => vscode_languageserver_textdocument_1.TextDocument.create('testdoc', 'gherkin', 1, `Feature: Hello
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
            const completionItems = yield clientConnection.sendRequest(protocol_1.CompletionRequest.type, completionParams);
            const expected = [
                {
                    label: 'I have {int} cukes',
                    filterText: 'I have',
                    sortText: '1000',
                    insertTextFormat: vscode_languageserver_1.InsertTextFormat.Snippet,
                    kind: vscode_languageserver_types_1.CompletionItemKind.Text,
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
            assert_1.default.deepStrictEqual(completionItems, expected);
        })));
    });
});
class TestStream extends stream_1.Duplex {
    _write(chunk, _encoding, done) {
        this.emit('data', chunk);
        done();
    }
    _read() {
        // no-op
    }
}
//# sourceMappingURL=CucumberLanguageServer.test.js.map