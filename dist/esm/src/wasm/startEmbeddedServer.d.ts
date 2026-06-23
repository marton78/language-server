import { CucumberExpressions, Suggestion } from '@cucumber/language-service';
import { Connection } from 'vscode-languageserver';
import { CucumberLanguageServer } from '../CucumberLanguageServer.js';
import { Files } from '../Files.js';
export type ServerInfo = {
    writer: NodeJS.WritableStream;
    reader: NodeJS.ReadableStream;
    server: CucumberLanguageServer;
    connection: Connection;
};
export declare function startEmbeddedServer(wasmBaseUrl: string, makeFiles: (rootUri: string) => Files, onReindexed: (registry: CucumberExpressions.ParameterTypeRegistry, expressions: readonly CucumberExpressions.Expression[], suggestions: readonly Suggestion[]) => void): ServerInfo;
//# sourceMappingURL=startEmbeddedServer.d.ts.map