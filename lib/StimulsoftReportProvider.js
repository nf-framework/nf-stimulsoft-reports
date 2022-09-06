import { Stimulsoft } from 'stimulsoft-reports-js';
import PostgreSQLAdapter from './PostgreSQLAdapter.js';

class StimulsoftReportProvider {
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

    prerareReport(context, variables, tpl, provider) {
        Stimulsoft.System.NodeJs.processPostgreSQL = (command, onProcess) => PostgreSQLAdapter(command, onProcess, context, provider);
        const report = new Stimulsoft.Report.StiReport();
        report.load(tpl);
        if (variables && report.dictionary.variables.list.length > 0) {
            variables.forEach((vrb) => {
                const variable = report.dictionary.variables.getByName(vrb.name);
                if(variable && vrb.type == 'ImageBase64') {
                    let img = Stimulsoft.Base.Drawing.StiImageConverter.stringToImage(vrb.value);
                    variable.setValue(img);
                } else if (variable) {
                    variable.setValue(vrb.value);
                }
            });
        }

        return report;
    }

    async getReportForExport(context, variables, tpl, extension) {
        return new Promise((resolve, reject) => {
            const report = this.prerareReport(context, variables, tpl);
            report.renderAsync(() => {
                const buffer = this.getExportDataByExtension(report, extension);
                resolve(buffer);
            });
        });
    }

    async getExportDataByExtension(report, extension) {
        let format = Stimulsoft.Report.StiExportFormat.Pdf;
        let settings = new Stimulsoft.Report.Export.StiPdfExportSettings();
        let service = new Stimulsoft.Report.Export.StiPdfExportService();

        switch (extension) {
            case 'xls', 'xlsx': {
                format = Stimulsoft.Report.StiExportFormat.Excel2007;
                settings = new Stimulsoft.Report.Export.StiExcel2007ExportSettings();
                service = new Stimulsoft.Report.Export.StiExcel2007ExportService();
            }
        }

        const buffer = report.exportDocument(format, service, settings);
        return buffer;
    }
}

module.exports = StimulsoftReportProvider;
