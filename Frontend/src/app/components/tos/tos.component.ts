import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-tos',
  templateUrl: './tos.component.html',
  styleUrls: ['./tos.component.scss']
})
export class TosComponent {
  @Output() onClose = new EventEmitter();

  close() {
    this.onClose.emit()
  }

}
