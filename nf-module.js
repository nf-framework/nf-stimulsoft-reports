import { web } from "@nfjs/back";
import { registerCustomElementsDir, registerLibDir } from "@nfjs/front-server";
import path from 'path';

import PostgreSQLAdapter from './lib/PostgreSQLAdapter.js';
import adapter from "stimulsoft-data-adapter";

const meta = {
    require: {
        after: '@nfjs/back-dbfw'
    }
};
const __dirname = path.join(path.dirname(decodeURI(new URL(import.meta.url).pathname))).replace(/^\\([A-Z]:\\)/, "$1");

function init() {
    registerCustomElementsDir('@nfjs/stimulsoft-reports/components');
    registerLibDir('iframe/stimulsoft-designer.html', __dirname + '/iframe/stimulsoft-designer.html', { singleFile: true })
    registerLibDir('stimulsoft-reports-js', null, { denyPathReplace: true, minify: 'deny' });

    web.on('POST', '/@stimulsoft/adapter', { middleware: ['session', 'auth', 'json'] }, (context) => {
        const onProcess = function (result) {
            context.end(JSON.stringify(result));
        };

        let data = '';
        context.req.on('data', (buffer) => {
            data += buffer;
        });

        context.req.on('end', () => {
            const command = adapter.getCommand(data);
            if (command.database === 'PostgreSQL') PostgreSQLAdapter(command, onProcess, context, command.provider);
        });

    });
}

export {
    init,
    meta
};
