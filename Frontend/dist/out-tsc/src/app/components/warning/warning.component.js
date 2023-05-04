import { __decorate } from "tslib";
import { Component, EventEmitter, Input, Output } from '@angular/core';
let WarningComponent = class WarningComponent {
    constructor() {
        this.onCancel = new EventEmitter();
        this.onConfirm = new EventEmitter();
    }
    ngOnInit() {
    }
    confirm() {
        this.onConfirm.emit();
    }
    cancel() {
        this.onCancel.emit();
    }
};
__decorate([
    Input()
], WarningComponent.prototype, "message", void 0);
__decorate([
    Output()
], WarningComponent.prototype, "onCancel", void 0);
__decorate([
    Output()
], WarningComponent.prototype, "onConfirm", void 0);
__decorate([
    Input()
], WarningComponent.prototype, "buttonText", void 0);
WarningComponent = __decorate([
    Component({
        selector: 'app-warning',
        templateUrl: './warning.component.html',
        styleUrls: ['./warning.component.scss']
    })
], WarningComponent);
export { WarningComponent };
//# sourceMappingURL=warning.component.js.map