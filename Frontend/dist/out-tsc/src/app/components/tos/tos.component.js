import { __decorate } from "tslib";
import { Component, EventEmitter, Output } from '@angular/core';
let TosComponent = class TosComponent {
    constructor() {
        this.onClose = new EventEmitter();
    }
    close() {
        this.onClose.emit();
    }
};
__decorate([
    Output()
], TosComponent.prototype, "onClose", void 0);
TosComponent = __decorate([
    Component({
        selector: 'app-tos',
        templateUrl: './tos.component.html',
        styleUrls: ['./tos.component.scss']
    })
], TosComponent);
export { TosComponent };
//# sourceMappingURL=tos.component.js.map