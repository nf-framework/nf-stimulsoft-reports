import { web } from "@nfjs/back";
import { registerLibDir, prepareResponse, getCacheKey, registerCustomElementsDir } from '@nfjs/front-server';
import path from 'path';
import mime from 'mime';
import { Readable } from "stream";
import { api, config } from '@nfjs/core';
import PostgreSQLAdapter from './lib/PostgreSQLAdapter.js';
import StimulsoftReportProvider from './lib/StimulsoftReportProvider.js';

import adapter from "stimulsoft-data-adapter";
import glob from 'fast-glob';

import fs from "fs";
import tar from "tar";

import { getRenderedReport, getPathByReportName, unpack } from "./lib/utils.js";

const meta = {
    require: {
        after: '@nfjs/back-dbfw'
    }
};

const reportsScopes = '**/reports/*.tar.gz';

const __dirname = path.join(path.dirname(decodeURI(new URL(import.meta.url).pathname))).replace(/^\\([A-Z]:\\)/, "$1");
let menu = await api.loadJSON(__dirname + '/menu.json');

function streamToBuffer(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    })
}


function init() {
    registerCustomElementsDir('@nfjs/stimulsoft-reports/components');

    web.on('GET', '/iframe/stimulsoft-*', {}, async context => {
        let requestPath = __dirname + `/iframe/stimulsoft-${context.params['*']}`;
        const customOptions = context.customOptions;
        const cacheKey = getCacheKey(requestPath, customOptions);
        const response = await prepareResponse(cacheKey,
            { customOptions, mimeType: mime.getType(requestPath) },
            async () =>  {
                let buffer = await streamToBuffer(fs.createReadStream(requestPath));
                let htmlText = buffer.toString().replace('//Stimulsoft.Base.StiLicense.key', `Stimulsoft.Base.StiLicense.key = '${config['@nfjs/stimulsoft-reports']?.license}'`);
                var s = new Readable();
                s.push(htmlText);
                s.push(null);

                return s;
            });
        context.headers(response.headers);
        context.send(response.stream);
    });

    registerLibDir('stimulsoft-reports-js', null, { denyPathReplace: true, minify: 'deny' });
    registerLibDir('file-saver');

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
            if (command.database === 'PostgreSQL') PostgreSQLAdapter(command, onProcess, context, { provider: command.provider });
        });
    });

    web.on('POST', '/@stimulsoft/key', { middleware: ['session', 'auth', 'json'] }, (context) => {
        context.send({ data: config['@nfjs/stimulsoft-reports']?.license })
    });


    web.on('POST', '/@stimulsoft/providers', { middleware: ['session', 'auth', 'json'] }, (context) => {
        context.send({ data: Object.keys(config.data_providers).map(x => ({ text: x, value: x })) })
    });

    web.on('POST', '/@reports/listPackages', { middleware: ['session', 'auth', 'json'] }, async (context) => {
        context.send({ data: await api.getWorkspaces() })
    });

    web.on('POST', '/@reports/checkReportData', { middleware: ['session', 'auth', 'json'] }, async (context) => {
        const reportName = context.body.reportName;
        const options = context.body.options;
        const variables = (context.body.variables && Object.entries(context.body.variables).map(x => ({ name: x[0], value: x[1] }))) || [];
        const filePath = await getPathByReportName(reportName, options && options.module);
        if (filePath) {
            const metaData = await unpack(filePath, 'meta.json');
            const variablesToShow = [];
            metaData.variables.forEach((variable) => {
                const varToShow = variables.length > 0
                    ? variables.find(x => x.name === variable.name)
                    : variable;
                varToShow.type = variable.type;
                varToShow.userInputRequired = variable.userInputRequired;
                variablesToShow.push(varToShow);
            });

            context.send({
                showForm: 'stimulsoft.viewer',
                fileName: metaData.reportName + '.' + options.extension,
                options: metaData.options,
                variables: variablesToShow,
                renderEngine: metaData.renderEngine,
                provider: metaData.provider
            });
        } else {
            const errMsg = options && options.module
                ? `Печатная форма с кодом ${reportName} в модуле ${options.module} не найдена`
                : `Печатная форма с кодом ${reportName} не найдена`;
            context.send(api.nfError(new Error(errMsg)));
        }
    });

    web.on('POST', '/@reports/getReport', { middleware: ['session', 'auth', 'json'] }, async (context) => {
        const reportName = context.body.args.reportName;
        const options = context.body.args.options;
        const filePath = await getPathByReportName(reportName, options && options.module);
        const metaData = await unpack(filePath, 'meta.json');
        const reportProvider = new StimulsoftReportProvider();

        const result = {
            template: await unpack(filePath, reportProvider.getFormExtension()),
            meta: metaData
        };

        context.send({ data: result });
    });

    web.on('POST', '/@reports/printReport', { middleware: ['session', 'auth', 'json'] }, async (context) => {
        const reportName = context.body.args.reportName;
        const variables = context.body.args.variables;
        const options = context.body.args.options;
        const extension = context.body.extension;
        const provider = context.body.args.provider;
        const filePath = await getPathByReportName(reportName, options && options.module);
        const reportProvider = new StimulsoftReportProvider();

        const tpl = await unpack(filePath, reportProvider.getFormExtension());
        const report = await reportProvider.getReport(context, variables, tpl, provider, extension);
        context.send({ data: report });
    });

    web.on('POST', '/@reports/downloadReport', { middleware: ['session', 'auth', 'json'] }, async (context) => {
        const reportName = context.body.reportName;
        const variables = context.body.variables;
        const options = context.body.options;
        const reportData = await getRenderedReport(reportName, variables, options, context);

        const headers = {
            'Content-Disposition': `attachment; filename=${encodeURIComponent(reportData.fileName)}`,
            'Content-Transfer-Encoding': 'binary'
        }

        context.headers(headers);
        context.send(reportData.fileStream);
    });

    web.on('POST', '/@reports/list', { middleware: ['session', 'auth', 'json'] }, async (context) => {
        const modulesRoot = path.join(process.cwd(), 'node_modules');
        let result = [];
        const reports = await glob(reportsScopes, {
            cwd: modulesRoot, followSymlinkedDirectories: true
        });
        const flt = context.body.args.flt,
              sort = context.body.control.sorts

        await Promise.all(reports.map((mod) => {
            const data = [];
            const pathToFile = path.join(modulesRoot, mod);
            return tar.list({
                file: pathToFile,
                onentry: (entry) => {
                    if (entry.path.endsWith('meta.json')) {
                        entry.on('data', c => data.push(c));
                    }
                }
            })
                .then((err) => {
                    const buf = Buffer.concat(data);
                    const json = JSON.parse(buf);
                    json.path = pathToFile;

                    // filters
                    for (let f in flt) {
                        if (flt[f] && !(json[f] || '').toLowerCase().includes(flt[f].toLowerCase())) return
                    }
                    
                    result.push(json);
                });
        }));

        // sort
        const sorted = sort.length ? result.sort((a, b) => {
            let res = 0;

            for (let s of sort) {
                let { field, sort } = s;
                field = field.split('.')[1] || field
                if (!sort) continue
                res = (a[field] || '').toLowerCase() === (b[field] || '').toLowerCase() ? 0 : (a[field] || '').toLowerCase() > (b[field] || '').toLowerCase() ? 1 : -1;
                if (res !== 0) {
                    return sort === 'asc' ? res : -res;
                }
            }

            return res;
        }) : result

        result = result.map(i => ({
            name: i.name,
            options: i,
            path: i.path
        }))

        context.send({ data: result });
    });


    web.on('POST', '/@reports/saveReport', { middleware: ['session', 'auth', 'json'] }, async (context) => {
        const reportTpl = context.body.args.jsonData;
        const reportMeta = JSON.parse(context.body.args.metaInfo);
        const modulePath = path.join(process.cwd(), 'node_modules', reportMeta.module);
        const reportDir = path.join(modulePath, 'reports', reportMeta.name);
        const metaPath = path.join(modulePath, 'reports', reportMeta.name, `${reportMeta.name}_meta.json`);
        const tplPath = path.join(modulePath, 'reports', reportMeta.name, `${reportMeta.name}.mrt`);
        fs.mkdirSync(reportDir, { recursive: true });
        fs.writeFileSync(metaPath, Buffer.from(JSON.stringify(reportMeta)));
        fs.writeFileSync(tplPath, Buffer.from(reportTpl));
        await tar.create({
            cwd: path.join(modulePath, 'reports'),
            gzip: true,
            file: path.join(modulePath, 'reports', `${reportMeta.name}.tar.gz`)
        }, [reportMeta.name]);

        fs.unlinkSync(metaPath);
        fs.unlinkSync(tplPath);
        fs.rmdirSync(reportDir);

        context.send({ data: 'success' });
    });
}

export {
    init,
    meta,
    menu
};
