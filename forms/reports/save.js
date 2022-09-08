import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class ReportList extends PlForm {
    static properties = {
        formTitle: { type: String, value: 'Сохранение отчета' },
        reportJson: { type: String, value: null },
        variables: { type: Array, value: () => [] },
        meta: { type: Object, value: null },
        provider: { type: String, value: null },
        packages: { type: Array, value: () => [] }
    }

    static template = html`
        <pl-flex-layout fit>
            <pl-flex-layout vertical>
                <pl-button label="Сохранить" variant="primary" on-click="[[onSaveTap]]"></pl-button>
                <pl-input label="Наименование" id="name" required></pl-input>
                <pl-textarea label="Описание" required id="description" rows="3" auto-validate="true"></pl-textarea>
                <pl-input label="Провайдер" value="{{provider}}" readonly></pl-input>
                <pl-combobox label="Модуль" required data="{{packages}}" value-property="fullpath" id="module" text-property="path"></pl-combobox>
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
                <pl-input label="Код" value="{{activeVariable.name}}" readonly="true" id="editCode"></pl-input>
                <pl-combobox data="[[types]]" label="Тип" id="editType" value="{{activeVariable.type}}" text-property="text">
                </pl-combobox>
                <pl-checkbox label="Ручной ввод" id="editUserInput" value="{{activeVariable.userInputRequired}}">
                </pl-checkbox>
            </pl-flex-layout>
        </pl-dropdown>
        <pl-dataset data="{{packages}}" endpoint="/@reports/listPackages" id="dsPackages"></pl-dataset>
        <pl-action id="aSave" endpoint="/@reports/saveReport"></pl-action>
    `;

    onConnect() {
        if (this.meta) {
            this.$.name.value = this.meta.name;
            this.$.description.value = this.meta.description;
            this.$.module.value = this.meta.module;
            this.renderEngine = this.meta.renderEngine;
            this.provider = this.provider;
        } else {
            this.renderEngine = this.renderEngine;
            this.provider = this.provider;
        }

        this.variables.forEach((variable) => {
            const variableToAdd = variable;
            if (this.meta && this.meta.variables) {
                const existed = this.meta.variables.find(v => v.name === variableToAdd.name);
                if (existed) {
                    variableToAdd.type = existed.type;
                    variableToAdd.userInputRequired = existed.userInputRequired;
                }
            }

            this.push('variables', variableToAdd);
        });

        this.$.dsPackages.execute();
    }

    onEditTap(event) {
        this.$.ddEditVariable.execute(event.currentTarget);
    }

    onSaveTap(event) {
        this.$.aSave.execute({
            jsonData: JSON.stringify(this.reportJson),
            metaInfo: JSON.stringify({
                name: this.$.name.value,
                module: this.$.module.value,
                description: this.$.description.value,
                variables: this.variables,
                renderEngine: this.renderEngine,
                provider: this.provider
            }),
            modulePath: this.$.module.value
        });
    }
}