import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {FilterPanelStateService, FilterState} from '@app/log-view/filter-panel-state.service';
import {FilterWithDropdown} from '@app/log-view/top-filters/filter-with-dropdown';
import {ViewConfigService} from '@app/log-view/view-config.service';
import {SlUtils} from '@app/utils/utils';
import {AceEditorDirective} from '@app/utils/ace-editor.directive';

@Component({
    selector: 'lv-groovy-filter',
    templateUrl: './groovy-filter.component.html',
    styleUrls: ['./groovy-filter.component.scss'],
})
export class LvGroovyFilterComponent extends FilterWithDropdown {

    @ViewChild(AceEditorDirective)
    private aceEditor: AceEditorDirective;

    @ViewChild('groovyDropDown', {static: true})
    private dropDownElement: ElementRef;

    @Input() filterId: string;

    scriptEditorOptions = {
        maxLines: 20,
        minLines: 3,
        showPrintMargin: false,
        highlightActiveLine: false,
        highlightGutterLine: false,
        setShowGutter: false,
        showLineNumbers: false,
        showGutter: false,
        fixedWidthGutter: false,
        fontSize: 14,
    };

    titleName: string;
    titleScript: string;

    script: string;
    originalScript: string;
    name: string;
    originalName: string;

    fieldList: string[];

    constructor(filterPanelStateService: FilterPanelStateService, private viewConfig: ViewConfigService) {
        super(filterPanelStateService);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let res = {};

        for (let l of Object.values(this.viewConfig.logById)) {
            for (let field of l.fields) {
                res[field.name] = true;
            }
        }

        this.fieldList = Object.keys(res);
    }

    protected getDropdownDiv(): ElementRef {
        return this.dropDownElement;
    }

    private findFilter(state: FilterState) {
        return state.groovyFilters?.find(it => it.id === this.filterId);
    }

    protected loadComponentState(state: FilterState) {
        let f = this.findFilter(state);
        if (!f) {
            return;
        }

        this.name = f.name || '';
        this.originalName = this.name;

        this.titleName = SlUtils.trimText(this.name, 50);

        this.script = f.script || '';
        this.originalScript = this.script;

        if (!this.titleName) {
            this.titleScript = SlUtils.trimText(this.script, 40);
        }
    }

    onApply() {
        this.filterPanelStateService.updateFilterState(state => {
            let f = this.findFilter(state);
            if (!f) {
                return;
            }

            f.name = this.name?.trim();

            f.script = this.script;
        });

        this.dropdownShown = false;
    }

    onCancel() {
        this.dropdownShown = false;
        this.loadComponentState(this.filterPanelStateService.getFilterState());
    }

    removeFilter() {
        this.filterPanelStateService.updateFilterState(state => {
            let f = this.findFilter(state);
            SlUtils.delete(state.groovyFilters, f);
        });
    }

    onScriptChanged(newText: string) {
        this.script = newText;
    }

    editorKeyDown(event: KeyboardEvent) {
        switch (event.keyCode) {
            case 13:
                if (event.ctrlKey) {
                    this.onApply();
                    break;
                }
                return true;

            default:
                return true;
        }

        event.preventDefault();
        return false;
    }
}