import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class ReportList extends PlForm {
    static properties = {
        formTitle: { type: String, value: 'Отчеты' },
        reports: { value: () => [] },
        selected: { value: () => null }
    }

    static template = html`
        <pl-flex-layout fit>
            <pl-grid data="{{reports}}" control="{{reports_control}}" selected="{{selected}}">
                <pl-grid-column field="name" header="Наименование"></pl-grid-column>
                <pl-grid-column field="moduleName" header="Модуль"></pl-grid-column>
                <pl-grid-column field="description" header="Описание"></pl-grid-column>
                <pl-flex-layout slot="top-toolbar">
                    <pl-button label="Новый отчет" variant="primary" on-click="[[onNewTap]]"></pl-button>
                    <pl-button label="Редактировать" on-click="[[onEditTap]]" variant="secondary" disabled="[[!selected]]">
                    </pl-button>
                    <pl-button label="Печать" variant="secondary" on-click="[[onPrintTap]]" disabled="[[!selected]]">
                    </pl-button>
                </pl-flex-layout>
            </pl-grid>
        </pl-flex-layout>
        <pl-dataset data="{{reports}}" id="dsReports" endpoint="/@reports/list"></pl-dataset>
    `;

    onConnect() {
        this.$.dsReports.execute();
    }

    async onPrintTap(event) {
        try {
            const checkInfo = await NF.openReport(this.selected.name, null, { module: this.selected.moduleName });
            this.open('stimulsoft.viewer', { reportName: checkInfo.reportName, variables: checkInfo.data.variables, options: checkInfo.options })
        } catch (err) {
            this.notify(err.message);
        }
        this.$.dsReports.execute();
    }

    async onEditTap(event) {
        await this.open('stimulsoft.designer', { reportName: this.selected.name });
        await this.$.dsReports.execute();
    }

    async onNewTap(event) {
        await this.open('stimulsoft.designer', { isNew: true });
        await this.$.dsReports.execute();
    }
}