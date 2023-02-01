import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class ReportList extends PlForm {
    static properties = {
        formTitle: { type: String, value: 'Новый отчет' },
        providers: { value: () => [] },
        provider: { value: () => null, observer: '_providerObserver' },
        reportName: { value: () => null },
        designerLoaded: { type: Boolean, value: false}
    }

    static template = html`
        <pl-flex-layout fit vertical>
            <pl-flex-layout stretch justified="between" ext-class="w100p" left-label-width="80">
                <pl-combobox required label="Provider" orientation="horizontal" data="[[providers]]" value="{{provider}}">
                </pl-combobox>
                <pl-button label="Сохранить отчет" disabled="[[!designerLoaded]]" on-click="[[onSaveTap]]" variant="primary"></pl-button>
            </pl-flex-layout>
            <pl-flex-layout fit>
                <pl-stimulsoft-designer id="designer"></pl-stimulsoft-designer>
            </pl-flex-layout>
        </pl-flex-layout>
        <pl-action id="get" endpoint="/@reports/getReport"></pl-action>
        <pl-dataset endpoint="@stimulsoft/providers" id="dsProviders" data="{{providers}}"></pl-dataset>
    `;

    _providerObserver(val) {
        if (val) {
            this.$.designer.setProvider(val);
        }
    }

    async onConnect(event) {
        await this.$.dsProviders.execute();

        this.$.designer.root.querySelector('iframe').addEventListener('load', async () => {
            this.designerLoaded = true;
            if (this.reportName) {
                const data = await this.$.get.execute({ reportName: this.reportName });
                this.meta = data.meta;
                this.$.designer.setReport(data.template);
                this.provider = this.meta.provider || 'default';
            }
            else {
                this.$.designer.setNewReport();
                this.provider = this.providers.length > 0 ? this.providers[0].value : 'default';
            }
        });
    }
    async onSaveTap() {
        const vars = await this.$.designer.getVariables();
        const res = await this.$.designer.getReportJson();
        this.meta.reportName = this.$.designer.getReportName();
        this.open('reports.save', {
            reportJson: res,
            variables: vars,
            meta: this.meta,
            provider: this.provider
        });
    }
    async onClose() {
        return await this.showConfirm(`Вы уверены что хотите закрыть редактор?`);
    }
}