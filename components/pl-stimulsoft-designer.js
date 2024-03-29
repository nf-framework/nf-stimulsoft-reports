import { PlElement, html, css } from "polylib";

class PlStimulsoftDesigner extends PlElement {
    static css = css`
        :host {
            width: 100%;
            height: 100%;
        }
        #designer {
           width: 100%;
            height: 100%;
            box-sizing: border-box;
        }
    `;

    static template = html`
        <iframe id="designer" src="iframe/stimulsoft-designer.html"></iframe>
    `;

    setReport(reportJson) {
        this.$.designer.contentWindow.setReport(reportJson);
    }

    setNewReport() {
        this.$.designer.contentWindow.setNewReport();
    }

    setProvider(provider) {
        this.$.designer.contentWindow.setProvider(provider);
    }

    getReportName() {
        return this.$.designer.contentWindow.stiDesigner.report._reportName;
    }

    async getVariables() {
        const variables = this.$.designer.contentWindow.stiDesigner.report.getDictionary().variables.list.map(x => ({ name: x.alias }));
        return variables;
    }

    async getReportJson() {
        const json = await this.$.designer.contentWindow.stiDesigner.report.saveToJsonString();
        return json;
    }
}

customElements.define('pl-stimulsoft-designer', PlStimulsoftDesigner);
