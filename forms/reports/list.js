import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class ReportList extends PlForm {
    static properties = {
        formTitle: { type: String, value: 'Отчеты' },
        reports: { value: () => [] },
        selected: { value: () => null },
        loading: { type: Boolean },
        flt: { type: Object, value: () => ({}) }
    }

    static template = html`
        <pl-flex-layout scrollable vertical fit>
            <pl-flex-layout align="flex-end" stretch wrap>
                <pl-filter-container data="{{dtList}}" id="fltrContainer">
                    <pl-input label="Код отчета" value="{{flt.name}}"></pl-input>
                    <pl-input label="Наименование" value="{{flt.reportName}}"></pl-input>
                    <pl-input label="Модуль" value="{{flt.module}}"></pl-input>
                    <pl-input label="Описание" value="{{flt.description}}"></pl-input>

                    <pl-button variant="ghost" label="Найти" on-click="[[onSearch]]" loading="[[loading]]">
                        <pl-icon iconset="pl-default" size="16" icon="search" slot="prefix" animated="[[loading]]"></pl-icon>
                    </pl-button>
                    <pl-button variant="link" label="Сбросить" on-click="[[onClear]]">
                        <pl-icon iconset="pl-default" size="16" icon="close-circle-filled" slot="prefix"></pl-icon>
                    </pl-button>
                </pl-filter-container>
            </pl-flex-layout>
            <pl-flex-layout fit>
                <pl-grid data="{{reports}}" control="{{reports_control}}" selected="{{selected}}">
                    <pl-grid-column field="name" header="Код отчета" resizable sortable></pl-grid-column>
                    <pl-grid-column field="options.reportName" header="Наименование" resizable sortable></pl-grid-column>
                    <pl-grid-column field="options.module" header="Модуль" resizable sortable></pl-grid-column>
                    <pl-grid-column field="options.description" header="Описание" resizable sortable></pl-grid-column>
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
        </pl-flex-layout>
        <pl-dataset data="{{reports}}" id="dsReports" endpoint="/@reports/list" executing="{{loading}}" args="[[_compose('flt',flt)]]"></pl-dataset>
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

        this.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                this.onSearch();
            }
        });
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

    async onSearch() {
        await this.$.dsReports.execute();
    }

    onClear() {
        this.set('flt', {});
        this.onSearch();
    }
}