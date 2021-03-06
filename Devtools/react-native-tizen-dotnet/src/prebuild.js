// @flow
import fse from 'fs-extra';
import path from 'path';

export function getPath() {
    let dir = __dirname;
    const name = require('../package.json').name;
    let endIndex = dir.indexOf(`/node_modules/${name}/build`);
    return dir.slice(0, endIndex);
}
export async function preBuild() {

    let app = {};

    app.path = getPath();
    app.name = path.basename(app.path);

    console.log(`path:${app.path},  name: ${app.name}`);

    return app;
};