import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class ReportList extends PlForm {
    static properties = {
        formTitle: { type: String, value: 'Отчеты' },
        reports: { value: () => [] },
        active: {}
    }

    static template = html`
        <pl-flex-layout fit>
            <pl-grid data="{{reports}}" control="{{reports_control}}" active-record="{{active}}">
                <pl-grid-column field="name" header="Наименование"></pl-grid-column>
                <pl-grid-column field="moduleName" header="Модуль" autosize="true" align="left"></pl-grid-column>
                <pl-grid-column field="description" header="Описание" slot="toolbar"></pl-grid-column>
                <pl-flex-layout slot="top-toolbar">
                    <pl-button label="Новый отчет" variant="primary" on-click="[[onNewTap]]"></pl-button>
                    <pl-button label="Редактировать" on-click="[[onEditTap]]" variant="primary" disabled="[[!active]]"></pl-button>
                    <pl-button label="Печать" variant="primary" size="medium" on-click="[[onPrintTap]]" disabled="[[!active]]"></pl-button>
                </pl-layout>
            </pl-grid>
        </pl-flex-layout>
        <pl-dataset data="{{reports}}" id="dsReports" endpoint="/@reports/list"></pl-dataset>
    `;

    onConnect(){
        this.$.dsReports.execute();
    }

    async onPrintTap(event) {
        try {
            await NF.openReport(this.active.json.name, null, { module: this.active.json.moduleName });
        } catch (err) {
            document.dispatchEvent(new CustomEvent('error', { detail: { error: err.message } }));
        }
        this.$.dsReports.execute();
    }

    async onEditTap(event) {
        await this.open('stimulsoft.designer', { reportName: this.active.json.name });
        await this.$.dsReports.execute();
    }

    async onNewTap(event) {
        await this.open('stimulsoft.designer', { isNew: true });
        await this.$.dsReports.execute();
    }
}