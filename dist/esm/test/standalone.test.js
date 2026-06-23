var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import assert from 'assert';
import { fork } from 'child_process';
import { NullLogger, StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node';
import { createProtocolConnection, DidChangeConfigurationNotification, InitializeRequest, LogMessageNotification, } from 'vscode-languageserver';
describe('Standalone', () => {
    let serverFork;
    let logMessages;
    let clientConnection;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        logMessages = [];
        serverFork = fork('./bin/cucumber-language-server.cjs', ['--stdio'], {
            silent: true,
        });
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
        if (!serverFork.stdin || !serverFork.stdout) {
            throw 'Process created without stdio streams';
        }
        clientConnection = createProtocolConnection(new StreamMessageReader(serverFork.stdout), new StreamMessageWriter(serverFork.stdin), NullLogger);
        clientConnection.onError((err) => {
            console.error('ERROR', err);
        });
        clientConnection.onNotification(LogMessageNotification.type, (params) => {
            if (params.type !== 3) {
                logMessages.push(params);
            }
        });
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
        serverFork.kill('SIGTERM'); // Try to terminate first
        serverFork.kill('SIGKILL'); // Then try to kill if it is not killed
    });
    context('workspace/didChangeConfiguration', () => {
        it(`startup success`, () => __awaiter(void 0, void 0, void 0, function* () {
            // First we need to configure the server, telling it where to find Gherkin documents and Glue code.
            // Note that *pushing* settings from the client to the server is deprecated in the LSP. We're only using it
            // here because it's easier to implement in the test.
            const settings = {
                features: ['testdata/**/*.feature'],
                glue: ['testdata/**/*.js'],
                parameterTypes: [],
                snippetTemplates: {},
            };
            const configParams = {
                settings,
            };
            yield clientConnection.sendNotification(DidChangeConfigurationNotification.type, configParams);
            yield new Promise((resolve) => setTimeout(resolve, 1000));
            assert.strictEqual(logMessages.length, 
            // TODO: change this to 0 when `workspace/semanticTokens/refresh` issue was solved
            1, 
            // print readable log messages
            logMessages
                .map(({ type, message }) => `**Type**: ${type}\n**Message**:\n${message}\n`)
                .join('\n--------------------\n'));
        }));
    });
});
//# sourceMappingURL=standalone.test.js.map