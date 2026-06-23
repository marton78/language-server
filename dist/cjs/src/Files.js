"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extname = extname;
function extname(uri) {
    // Roughly-enough implements https://nodejs.org/dist/latest-v18.x/docs/api/path.html#pathextnamepath
    return uri.substring(uri.lastIndexOf('.'), uri.length) || '';
}
//# sourceMappingURL=Files.js.map