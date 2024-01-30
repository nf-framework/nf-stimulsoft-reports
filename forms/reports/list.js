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
                <pl-grid-column field="name" header="Код отчета"></pl-grid-column>
                <pl-grid-column field="options.reportName" header="Наименование"></pl-grid-column>
                <pl-grid-column field="options.moduleName" header="Модуль"></pl-grid-column>
                <pl-grid-column field="options.extension" header="Формат"></pl-grid-column>
                <pl-grid-column field="options.description" header="Описание"></pl-grid-column>
                <pl-flex-layout slot="top-toolbar">
                    <pl-button label="Новый отчет" variant="primary" on-click="[[onNewClick]]">
                        <pl-icon iconset="pl-default" icon="report" slot="prefix"></pl-icon>
                    </pl-button>
                    <pl-button label="Редактировать" on-click="[[onEditClick]]" variant="secondary" disabled="[[!selected]]">
                        <pl-icon iconset="pl-default" icon="pencil" slot="prefix"></pl-icon>
                    </pl-button>
                    <pl-button label="Посмотреть" variant="ghost" on-click="[[onOpenClick]]" disabled="[[!selected]]">
                        <pl-icon iconset="pl-default" icon="file" slot="prefix"></pl-icon>
                    </pl-button>
                    <pl-button label="Печать" variant="ghost" on-click="[[onPrintClick]]" disabled="[[!selected]]">
                        <pl-icon iconset="pl-default" icon="pencil" slot="prefix"></pl-icon>
                        <pl-icon iconset="pl-default" icon="chevron-down" slot="suffix"></pl-icon>
                    </pl-button>
                </pl-flex-layout>
            </pl-grid>
        </pl-flex-layout>
        <pl-dataset data="{{reports}}" id="dsReports" endpoint="/@reports/list"></pl-dataset>
        <pl-dropdown-menu id="ddPrint">
            <pl-dropdown-menu-item label="Excel" on-click="[[onPrintExcel]]">
                <pl-icon iconset="pl-filetypes" icon="excel" slot="prefix"></pl-icon>
            </pl-dropdown-menu-item>
            <pl-dropdown-menu-item label="Word" on-click="[[onPrintWord]]">
                <pl-icon iconset="pl-filetypes" icon="word" slot="prefix"></pl-icon>
            </pl-dropdown-menu-item>
        </pl-dropdown-menu>`;

    onConnect() {
        this.$.dsReports.execute();
    }

    async onOpenClick() {
        await this.open('stimulsoft.viewer', { reportName: this.selected.name, variables: {}, options: this.selected.options })
        this.$.dsReports.execute();
    }

    onPrintClick(event) {
        this.$.ddPrint.open(event.target);
    }

    async onPrintExcel() {
        try {
            NF.printReport(this.selected.name, null, Object.assign(this.selected.options, { extension: 'xlsx'}));
        } catch (err) {
            this.notify(err.message);
        }
    }

    async onPrintWord() {
        try {
            NF.printReport(this.selected.name, null, Object.assign(this.selected.options, { extension: 'docx'}));
        } catch (err) {
            this.notify(err.message);
        }
    }

    async onEditClick() {
        await this.open('stimulsoft.designer', { reportName: this.selected.name });
        await this.$.dsReports.execute();
    }

    async onNewClick() {
        await this.open('stimulsoft.designer', { isNew: true });
        await this.$.dsReports.execute();
    }
}