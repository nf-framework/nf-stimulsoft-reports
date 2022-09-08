import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class ReportList extends PlForm {
    static properties = {
        formTitle: { type: String, value: 'Отчет' },
        reportName: { value: () => null }
    }

    static template = html`
        <pl-flex-layout fit>
            <pl-stimulsoft-viewer id="viewer"></pl-stimulsoft-viewer>
        </pl-flex-layout>

        <pl-action id="get" endpoint="/@reports/getReport"></pl-action>
    `;

    async onConnect(event) {
        this.$.viewer.shadowRoot.querySelector('iframe').addEventListener('load', async () => {
            const data = await this.$.get.execute({ reportName: this.reportName });
            this.$.viewer.setReport(data.template);
        });
    }
}