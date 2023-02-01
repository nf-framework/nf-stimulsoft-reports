import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class ReportList extends PlForm {
    static properties = {
        formTitle: { type: String, value: 'Сохранение отчета' },
        reportJson: { type: String, value: null },
        variables: { type: Array, value: () => [] },
        meta: { type: Object, value: null },
        packages: { type: Array, value: () => [] },
        invalid: { type: Boolean, value: false }
    }

    static template = html`
        <pl-flex-layout fit>
            <pl-flex-layout vertical>
                <pl-valid-observer invalid="{{invalid}}"></pl-valid-observer>
                <pl-input label="Код" required value="{{meta.name}}"></pl-input>
                <pl-input label="Наименование" required value="{{meta.name}}"></pl-input>
        
                <pl-textarea label="Описание" required value="{{meta.description}}"></pl-textarea>
                <pl-input label="Провайдер" value="{{provider}}" readonly value="{{meta.provider}}"></pl-input>
                <pl-combobox label="Модуль" required data="{{packages}}" value-property="path" text-property="path">
                </pl-combobox>
                <pl-button label="Сохранить" variant="primary" on-click="[[onSaveTap]]" disabled="[[invalid]]">
                    <pl-icon iconset="pl-default" icon="save" slot="prefix"></pl-icon>
                </pl-button>
            </pl-flex-layout>
            <pl-flex-layout fit>
                <pl-grid selected="{{activeVariable}}" data="{{variables}}">
                    <pl-grid-column header="Переменная" field="name"></pl-grid-column>
                    <pl-grid-column header="Тип" field="type"></pl-grid-column>
                    <pl-grid-column header="Ручной ввод" field="userInputRequired" width="100">
                        <template>
                            <pl-checkbox value="{{item.userInputRequired}}"></pl-checkbox>
                        </template></pl-grid-column>
                    <pl-grid-column width="90">
                        <template>
                            <pl-icon-button iconset="pl-default" size="16" icon="pencil" title="Редактировать" variant="link"
                                on-click="[[onEditTap]]"></pl-icon-button>
                        </template>
                    </pl-grid-column>
                </pl-grid>
            </pl-flex-layout>
        </pl-flex-layout>
        <pl-dropdown id="ddEditVariable" default-padding="true" data="{{activeVariable}}">
            <pl-flex-layout vertical>
                <pl-input label="Код" value="{{activeVariable.name}}" readonly></pl-input>
                <pl-combobox data="[[types]]" label="Тип" value="{{activeVariable.type}}" text-property="text"></pl-combobox>
                <pl-checkbox label="Ручной ввод" value="{{activeVariable.userInputRequired}}"></pl-checkbox>
            </pl-flex-layout>
        </pl-dropdown>
        <pl-dataset data="{{packages}}" endpoint="/@reports/listPackages" id="dsPackages"></pl-dataset>
        <pl-action id="aSave" endpoint="/@reports/saveReport"></pl-action>
    `;

    onConnect() {
        this.$.dsPackages.execute();
    }

    onEditTap(event) {
        this.$.ddEditVariable.open(event.currentTarget);
    }

    async onSaveTap() {
        try {
            await this.$.aSave.execute({
                jsonData: JSON.stringify(this.reportJson),
                metaInfo: JSON.stringify({
                    name: this.meta.name,
                    reportName: this.meta.reportName,
                    module: this.meta.module,
                    description: this.meta.description,
                    variables: this.variables,
                    provider: this.meta.provider
                }),
                modulePath: this.meta.module
            });
            
            this.notify('Отчет успешно сохранен');
        }
        catch(err) {
            this.notify('Ошибка при сохранении отчета', { type: 'error', header: 'Ошибка', timeout: 0, icon: 'close-circle' });
        }
    }
}