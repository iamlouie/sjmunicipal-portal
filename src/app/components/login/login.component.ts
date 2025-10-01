import { Component, ElementRef, EventEmitter, HostListener, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { ToastService } from '../../toast.service';

interface LoginModel { username: string; password: string; }

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<string>();

  model: LoginModel = { username: '', password: '' };
  submitting = false;
  error = '';

  constructor(private el: ElementRef, public auth: AuthService, private toast: ToastService) {}

  @HostListener('document:keydown.escape') onEsc() { if (this.open) this.handleClose(); }
  @HostListener('document:mousedown', ['$event']) onDocClick(ev: MouseEvent) {
    if (!this.open) return;
    const hostEl = this.el.nativeElement as HTMLElement;
    const dialog = hostEl.querySelector('.login-modal__dialog');
    if (dialog && !dialog.contains(ev.target as Node)) {
      this.handleClose();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) { this.error=''; this.focusFirst(); }
  }

  private focusFirst() {
    setTimeout(() => {
      const hostEl = this.el.nativeElement as HTMLElement;
      (hostEl.querySelector('input[name="username"]') as HTMLInputElement)?.focus();
    }, 15);
  }

  submit(form: any) {
    this.error = '';
    if (form.invalid) { this.error = 'Please fill in all required fields.'; return; }
    this.submitting = true;
    const { username, password } = this.model;
    setTimeout(() => {
      const ok = this.auth.login(username, password);
      this.submitting = false;
      if (ok) {
        this.toast.success('Logged in as ' + username);
        this.loggedIn.emit(username);
        this.reset();
      } else {
        this.error = 'Invalid credentials.';
      }
    }, 400);
  }

  handleClose() {
    if (this.submitting) return;
    this.reset();
    this.closed.emit();
  }

  private reset() { this.model.password=''; this.model.username=''; this.error=''; }
}
