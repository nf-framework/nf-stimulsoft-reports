import Stimulsoft from 'stimulsoft-reports-js';
import PostgreSQLAdapter from './PostgreSQLAdapter.js';
import { config } from '@nfjs/core';
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
            let format = null;
            switch (options.extension) {
                case 'xlsx': {
                    format = Stimulsoft.Report.StiExportFormat.Excel2007;
                    break;
                }
                case 'docx': {
                    format = Stimulsoft.Report.StiExportFormat.Word2007;
                    break;
                }
                case 'pdf': {
                    format = Stimulsoft.Report.StiExportFormat.Pdf;
                    break;
                }
                default: {
                    format = Stimulsoft.Report.StiExportFormat.Excel2007;
                    break;
                }
            }

            report.renderAsync(() => {
                report.exportDocumentAsync((data) => {
                    resolve(Buffer.from(data));
                }, format);
            });
        });
    }

    prerareReport(context, variables, tpl, provider) {
        Stimulsoft.Base.StiFontCollection.setOpentypeFontsFolder(path.join(process.cwd(), 'node_modules', '@nfjs/stimulsoft-reports', 'fonts'));

        Stimulsoft.Base.StiLicense.Key = config['@nfjs/stimulsoft-reports']?.license;
        const report = new Stimulsoft.Report.StiReport();
        Stimulsoft.StiOptions.WebServer.checkDataAdaptersVersion = false;
        Stimulsoft.StiOptions.Export.Word.spaceBetweenCharacters = -4;
        Stimulsoft.StiOptions.Export.Word.lineSpacing = 1;
        Stimulsoft.StiOptions.Export.Word.bottomMarginCorrection = 0;

        report.onBeginProcessData = (args, cb) => {
            args.async = true;
            args.preventDefault = true;
            const onProcess = function (result) {
                cb(result);
            };

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