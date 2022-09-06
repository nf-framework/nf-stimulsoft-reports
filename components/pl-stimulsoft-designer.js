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
        }
    `;

    static template = html`
        <iframe id="designer" src="iframe/stimulsoft-designer.html"></iframe>
    `;
}

customElements.define('pl-stimulsoft-designer', PlStimulsoftDesigner);
