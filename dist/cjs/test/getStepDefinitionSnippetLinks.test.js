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
const assert_1 = __importDefault(require("assert"));
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const getStepDefinitionSnippetLinks_js_1 = require("../src/getStepDefinitionSnippetLinks.js");
describe('guessStepDefinitionSnippetPath', () => {
    it('creates a location 2 lines below the first link', () => __awaiter(void 0, void 0, void 0, function* () {
        const targetRangeA1 = vscode_languageserver_types_1.Range.create(10, 0, 20, 14);
        const targetRangeA2 = vscode_languageserver_types_1.Range.create(30, 0, 40, 14);
        const targetRangeB = vscode_languageserver_types_1.Range.create(25, 0, 35, 14);
        const links = [
            {
                targetUri: 'file://home/testdata/typescript/a.ts',
                targetRange: targetRangeA2,
                targetSelectionRange: targetRangeA2,
            },
            {
                targetUri: 'file://home/testdata/typescript/b.ts',
                targetRange: targetRangeB,
                targetSelectionRange: targetRangeB,
            },
            {
                targetUri: 'file://home/testdata/typescript/a.ts',
                targetRange: targetRangeA1,
                targetSelectionRange: targetRangeA1,
            },
        ];
        const expectedRange1 = vscode_languageserver_types_1.Range.create(21, 0, 21, 0);
        const expectedRange2 = vscode_languageserver_types_1.Range.create(36, 0, 36, 0);
        const expected = [
            {
                targetUri: 'file://home/testdata/typescript/a.ts',
                targetRange: expectedRange1,
                targetSelectionRange: expectedRange1,
            },
            {
                targetUri: 'file://home/testdata/typescript/b.ts',
                targetRange: expectedRange2,
                targetSelectionRange: expectedRange2,
            },
        ];
        const result = (0, getStepDefinitionSnippetLinks_js_1.getStepDefinitionSnippetLinks)(links);
        assert_1.default.deepStrictEqual(result, expected);
    }));
});
//# sourceMappingURL=getStepDefinitionSnippetLinks.test.js.map