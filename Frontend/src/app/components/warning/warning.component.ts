import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss']
})
export class WarningComponent implements OnInit {

  @Input() message?: string;
  @Output() onCancel?: any = new EventEmitter();
  @Output() onConfirm?: any = new EventEmitter();
  @Input() buttonText?: string;

  constructor() { }

  ngOnInit(): void {
  }

  confirm() {
    this.onConfirm.emit();
  }

  cancel() {
    this.onCancel.emit();
  }

}
