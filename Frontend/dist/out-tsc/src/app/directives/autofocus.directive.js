import { __decorate } from "tslib";
import { Directive } from '@angular/core';
let AutofocusDirective = class AutofocusDirective {
    constructor(host) {
        this.host = host;
    }
    ngAfterViewInit() {
        this.host.nativeElement.focus();
    }
};
AutofocusDirective = __decorate([
    Directive({
        selector: '[appAutofocus]',
    })
], AutofocusDirective);
export { AutofocusDirective };
//# sourceMappingURL=autofocus.directive.js.map