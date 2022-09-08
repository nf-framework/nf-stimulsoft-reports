import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class ReportList extends PlForm {
    static properties = {
        formTitle: { type: String, value: 'Новый отчет' },
        providers: { value: () => [] },
        provider: { value: () => null, observer: '_providerObserver' },
        reportName: { value: () => null }
    }

    static template = html`
        <pl-flex-layout fit vertical>
            <pl-flex-layout stretch justified="between" ext-class="w100p" left-label-width="80">
                <pl-combobox required label="Provider" orientation="horizontal" data="[[providers]]" value="{{provider}}">
                </pl-combobox>
                <pl-button label="Сохранить отчет" on-click="[[onSaveTap]]" variant="primary"></pl-button>
            </pl-flex-layout>
            <pl-flex-layout fit>
                <pl-stimulsoft-designer id="designer"></pl-stimulsoft-designer>
            </pl-flex-layout>
        </pl-flex-layout>
        <pl-action id="get" endpoint="/api/getReport"></pl-action>
        <pl-dataset endpoint="@stimulsoft/providers" id="dsProviders" data="{{providers}}"></pl-dataset>
    `;

    _providerObserver(val) {
        if (val) {
            this.$.designer.setProvider(val);
        }
    }

    async onConnect(event) {
        // await this.$.dsProviders.execute();

        this.$.viewer.shadowRoot.querySelector('iframe').addEventListener('load', async () => {
            const data = await this.$.get.execute({
                reportName: this.args.reportName,
                variables: this.args.variables,
                renderEngine: 'stimulsoft-provider',
                provider: this.args.provider
            });
            this.$.viewer.setReport(data);
        });
    }
    async onSaveTap(event) {
        const vars = await this.$.designer.getVariables();
        const res = await this.$.designer.getReportJson();
        this.openForm('reports.saveReport', {
            reportJson: res,
            variables: vars,
            meta: this.meta,
            provider: this.provider,
            renderEngine: 'stimulsoft-provider'
        });
    }
    async onClose() {
        return await this.showConfirm(`Вы уверены что хотите закрыть редактор?`);
    }
}