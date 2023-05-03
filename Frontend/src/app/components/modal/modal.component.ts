import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() message?: string;
  @Input() confirmMessage?: string;
  @Output() onClose?: any = new EventEmitter();
  @Output() onConfirm?: any = new EventEmitter();
  @Input() buttonText?: string;

  constructor() { }

  ngOnInit(): void {
  }

  close() {
    this.onClose.emit();
  }

  confirm() {
    this.onConfirm.emit();
  }

}
