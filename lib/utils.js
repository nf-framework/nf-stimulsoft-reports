import { extension } from '@nfjs/core';
import StimulsoftReportProvider from './StimulsoftReportProvider.js';

import tar from "tar";

import { Readable } from 'stream'
import { getMimeType} from "stream-mime-type";

export async function getPathByReportName(reportName, moduleName) {
    const filePath = moduleName
        ? await extension.getFiles(`reports/${reportName}.tar.gz`, false, false, false, false, [moduleName])
        : await extension.getFiles(`reports/${reportName}.tar.gz`);
    return filePath;
}

/**
 * Получить данные из архива
 * @param {String} reportPath путь к файлу отчета
 * @param {String} extension расширение файла отчета
 */
export async function unpack(reportPath, extension) {
    const data = [];
    await tar.list({
        file: reportPath,
        onentry: (entry) => {
            if (entry.path.endsWith(extension)) {
                entry.on('data', c => data.push(c));
            }
        }
    });

    return JSON.parse(Buffer.concat(data));
}

export async function getRenderedReport(reportName, variables, options, context) {
    const reportProvider = new StimulsoftReportProvider();
    const filePath = await getPathByReportName(reportName, options && options.module);
    const tpl = await unpack(filePath, reportProvider.getFormExtension());
    const buffer = await reportProvider.getReportForExport(context, variables, tpl, options);
    const { mime } =  await getMimeType(buffer);
    const stream = Readable.from(buffer);

    return  {
        fileName: JSON.parse(tpl).ReportName + '.' + options.extension,
        fileStream: stream,
        encoding: 'utf-8',
        mimeType: mime,
        fileSize: buffer.length
    }
}
