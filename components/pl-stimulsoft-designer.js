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

connectedCallback(){
    super.connectedCallback();
    this.$.designer.addEventListener('load', () => {
        fetch("@stimulsoft/key", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }).then((resp) => {
            resp.json().then((key) => {
                this.$.designer.contentWindow.setLicense(key.data);
            });
        });
    })
}

    setReport(reportJson) {
        this.$.designer.contentWindow.setReport(reportJson);
    }

    setNewReport() {
        this.$.designer.contentWindow.setNewReport();
    }

    setProvider(provider) {
        this.$.designer.contentWindow.setProvider(provider);
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
