import Stimulsoft from 'stimulsoft-reports-js';
import PostgreSQLAdapter from './PostgreSQLAdapter.js';
import { config } from '@nfjs/core';
import fs from 'fs';
import path from 'path';

export default class StimulsoftReportProvider {
    getReportViewerForm() {
        return 'stimulsoft.viewer';
    }

    getFormExtension() {
        return '.mrt';
    }

    async getReport(context, variables, tpl, provider) {
        return new Promise((resolve, reject) => {
            const report = this.prerareReport(context, variables, tpl, provider);
            return report.renderAsync(() => {
                const renderedReportJSONData = report.saveDocumentToJsonString();
                resolve(renderedReportJSONData);
            });
        });
    }

    async getReportForExport(context, variables, tpl, options) {
        return new Promise((resolve, reject) => {
            const report = this.prerareReport(context, variables, tpl);
            report.renderAsync(() => {
                report.exportDocumentAsync((pdfData) => {
                    resolve(Buffer.from(pdfData));
                }, Stimulsoft.Report.StiExportFormat.Excel2007);
            });
        });
    }

    prerareReport(context, variables, tpl, provider) {
        Stimulsoft.Base.StiLicense.Key = config['@nfjs/stimulsoft-reports']?.license;
        Stimulsoft.System.NodeJs.processPostgreSQL = (command, onProcess) => PostgreSQLAdapter(command, onProcess, context, provider);
        const report = new Stimulsoft.Report.StiReport();
        Stimulsoft.StiOptions.WebServer.checkDataAdaptersVersion = false;
        report.onBeginProcessData = (args, cb) => {
            const onProcess = function (result) {
                cb(result);
            };

            args.preventDefault = true;

            PostgreSQLAdapter(args, onProcess, context, provider);
        }

        report.load(tpl);
        if (variables && report.dictionary.variables.list.length > 0) {
            variables.forEach((vrb) => {
                const variable = report.dictionary.variables.getByName(vrb.name);
                if (variable && vrb.type == 'ImageBase64') {
                    let img = Stimulsoft.Base.Drawing.StiImageConverter.stringToImage(vrb.value);
                    variable.setValue(img);
                } else if (variable) {
                    variable.setValue(vrb.value);
                }
            });
        }

        return report;
    }
}