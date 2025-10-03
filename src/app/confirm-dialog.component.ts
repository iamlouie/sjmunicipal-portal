import { Component, HostListener, signal, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [NgIf],
  template: `
  <div *ngIf="svc.state().visible" class="cdk-overlay" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
    <div class="dialog" [class.dialog--destructive]="svc.state().destructive">
      <h3 id="confirmTitle" class="dialog__title">{{ svc.state().title }}</h3>
      <p class="dialog__message">{{ svc.state().message }}</p>
      <div class="dialog__actions">
        <button type="button" class="btn btn--cancel" (click)="svc.cancel()">{{ svc.state().cancelText }}</button>
        <button type="button" class="btn btn--confirm" [class.btn--danger]="svc.state().destructive" (click)="svc.confirm()">{{ svc.state().confirmText }}</button>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  constructor(public svc: ConfirmService) {}

  @HostListener('document:keydown.escape') onEsc() { if (this.svc.state().visible) this.svc.cancel(); }
}
