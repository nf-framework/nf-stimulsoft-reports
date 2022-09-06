import { registerCustomElementsDir, registerLibDir } from "@nfjs/front-server";
import path from 'path';

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
}

export {
    init,
    meta
};
