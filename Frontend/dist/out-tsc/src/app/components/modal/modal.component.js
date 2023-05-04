import { __decorate } from "tslib";
import { Component, EventEmitter, Input, Output } from '@angular/core';
let ModalComponent = class ModalComponent {
    constructor() {
        this.onClose = new EventEmitter();
        this.onConfirm = new EventEmitter();
    }
    ngOnInit() {
    }
    close() {
        this.onClose.emit();
    }
    confirm() {
        this.onConfirm.emit();
    }
};
__decorate([
    Input()
], ModalComponent.prototype, "message", void 0);
__decorate([
    Input()
], ModalComponent.prototype, "confirmMessage", void 0);
__decorate([
    Output()
], ModalComponent.prototype, "onClose", void 0);
__decorate([
    Output()
], ModalComponent.prototype, "onConfirm", void 0);
__decorate([
    Input()
], ModalComponent.prototype, "buttonText", void 0);
ModalComponent = __decorate([
    Component({
        selector: 'app-modal',
        templateUrl: './modal.component.html',
        styleUrls: ['./modal.component.scss']
    })
], ModalComponent);
export { ModalComponent };
//# sourceMappingURL=modal.component.js.map