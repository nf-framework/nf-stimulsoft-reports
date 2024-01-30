import { PlElement, html, css } from "polylib";

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

    setReport(reportJson) {
        this.$.viewer.contentWindow.setReport(reportJson);
    }
    setVariables(vars) {
        this.$.viewer.contentWindow.setVariables(vars);
    }
}

customElements.define('pl-stimulsoft-viewer', PlStimulsoftDesigner);
