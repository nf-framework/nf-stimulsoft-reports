import { PlElement, html, css } from "polylib";
import { requestData } from "@nfjs/front-pl";

class PlStimulsoftDesigner extends PlElement {
    static css = css`
        :host {
            width: 100%;
            height: 100%;
        }
        #viewer {
           width: 100%;
            height: 100%;
            box-sizing: border-box;
        }
    `;

    static template = html`
        <iframe id="viewer" src="iframe/stimulsoft-viewer.html"></iframe>
    `;

    connectedCallback() {
        super.connectedCallback();
        this.$.viewer.addEventListener('load', () => {
            requestData("@stimulsoft/key", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).then((resp) => {
                resp.json().then((key) => {
                    this.$.viewer.contentWindow.setLicense(key.data);
                });
            });
        })
    }

    setReport(reportJson) {
        this.$.viewer.contentWindow.setReport(reportJson);
    }
    setVariables(vars) {
        this.$.viewer.contentWindow.setVariables(vars);
    }
}

customElements.define('pl-stimulsoft-viewer', PlStimulsoftDesigner);
