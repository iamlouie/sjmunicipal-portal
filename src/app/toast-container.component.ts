import { Component, computed, signal } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  template: `
    <div class="toast-container" role="region" aria-label="Notifications">
      <div *ngFor="let t of toasts(); trackBy: trackByToast" class="toast" [ngClass]="'toast--' + t.type" [attr.data-type]="t.type" role="status" aria-live="polite">
        <div class="toast__accent" aria-hidden="true"></div>
        <div class="toast__icon-wrap" aria-hidden="true">
          <span class="toast__icon">{{ icon(t.type) }}</span>
          <span class="toast__ring"></span>
        </div>
        <div class="toast__content">
          <p class="toast__msg">{{ t.message }}</p>
          <div class="toast__progress" *ngIf="t.timeout && t.timeout > 0">
            <div class="toast__bar" [style.animation-duration]="t.timeout + 'ms'"></div>
          </div>
        </div>
        <button type="button" class="toast__close" (click)="dismiss(t.id)" aria-label="Dismiss notification">×</button>
      </div>
    </div>
  `,
  styles: [`
  .toast-container { position: fixed; top: calc(var(--header-h, 0px) + .85rem); right: .95rem; display:flex; flex-direction:column; gap:.65rem; z-index: 5000; width: min(380px, 92vw); pointer-events:none; }
  .toast-container .toast { pointer-events:auto; }
  .toast { --tw-border:rgba(255,255,255,.28); position:relative; display:grid; grid-template-columns:auto 1fr auto; align-items:stretch; gap:.75rem; padding:.8rem 1rem .85rem .95rem; border-radius:14px; font-size:.72rem; line-height:1.4; font-weight:500; letter-spacing:.42px; box-shadow:0 10px 28px -10px rgba(0,0,0,.35), 0 4px 14px -6px rgba(0,0,0,.25); overflow:hidden; animation: toastIn .55s cubic-bezier(.16,.72,.29,1) both; backdrop-filter: blur(10px) saturate(160%); border:1px solid var(--tw-border); background:linear-gradient(145deg,var(--bg1),var(--bg2)); }
  .toast:not(.toast--leaving):hover { transform:translateY(-3px); transition: transform .4s; }
  /* Make backgrounds slightly transparent for a glassy feel */
  .toast--success { --bg1:rgba(6,78,59,.88); --bg2:rgba(5,150,105,.88); color:#ecfdf5; }
  .toast--error { --bg1:rgba(127,29,29,.9); --bg2:rgba(220,38,38,.9); color:#fef2f2; }
  .toast--info { --bg1:rgba(30,58,138,.9); --bg2:rgba(37,99,235,.9); color:#eff6ff; }
  .toast__accent { position:absolute; left:0; top:0; bottom:0; width:6px; background:linear-gradient(180deg,rgba(255,255,255,.6),rgba(255,255,255,0)); mix-blend-mode:overlay; }
  .toast--success .toast__accent { background:linear-gradient(180deg,#34d399,#10b981); }
  .toast--error .toast__accent { background:linear-gradient(180deg,#f87171,#dc2626); }
  .toast--info .toast__accent { background:linear-gradient(180deg,#60a5fa,#2563eb); }
  .toast__icon-wrap { position:relative; width:38px; display:flex; align-items:center; justify-content:center; }
  .toast__icon { font-size:1.15rem; line-height:1; filter: drop-shadow(0 2px 4px rgba(0,0,0,.35)); transform-origin:50% 50%; animation: popIcon .6s cubic-bezier(.5,1.8,.55,1) .05s both; }
  .toast__ring { position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.45),transparent 65%); opacity:.5; animation: pulseRing 1.8s ease-out infinite; pointer-events:none; }
  .toast__content { display:flex; flex-direction:column; gap:.45rem; padding:.1rem 0; }
  .toast__msg { margin:0; word-break:break-word; font-size:.74rem; font-weight:500; }
  .toast__progress { height:4px; border-radius:3px; background:rgba(255,255,255,.18); overflow:hidden; position:relative; }
  .toast__bar { height:100%; width:100%; transform-origin:left center; animation: shrink linear forwards; background:linear-gradient(90deg,rgba(255,255,255,.85),rgba(255,255,255,.35)); }
  .toast--success .toast__bar { background:linear-gradient(90deg,#bbf7d0,#34d399,#047857); }
  .toast--error .toast__bar { background:linear-gradient(90deg,#fecaca,#f87171,#b91c1c); }
  .toast--info .toast__bar { background:linear-gradient(90deg,#bfdbfe,#60a5fa,#1d4ed8); }
  .toast__close { align-self:flex-start; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.35); width:1.35rem; height:1.35rem; margin:.1rem .1rem 0 0; border-radius:8px; display:inline-flex; justify-content:center; align-items:center; font-size:.85rem; font-weight:700; cursor:pointer; color:rgba(255,255,255,.85); backdrop-filter: blur(2px); transition: background .25s, transform .25s, color .25s; }
  .toast__close:hover { background:rgba(255,255,255,.3); color:#fff; }
  .toast__close:active { transform:translateY(1px) scale(.95); }
  .toast__close:focus-visible { outline:2px solid #fff; outline-offset:2px; }
  .toast.toast--leaving { animation: toastOut .45s ease forwards; }
  @media (max-width:560px){ .toast { font-size:.74rem; padding:.75rem .85rem .8rem .85rem; gap:.6rem; } .toast__icon-wrap { width:34px; } }
  @keyframes toastIn { 0% { opacity:0; transform:translateY(-8px) scale(.92);} 55% { opacity:1;} 100% { opacity:1; transform:translateY(0) scale(1);} }
  @keyframes toastOut { 0% { opacity:1; transform:translateY(0) scale(1);} 100% { opacity:0; transform:translateY(-6px) scale(.9);} }
  @keyframes popIcon { 0% { transform:scale(0.4) rotate(-20deg); opacity:0;} 60% { opacity:1;} 100% { transform:scale(1) rotate(0);} }
  @keyframes pulseRing { 0% { transform:scale(.6); opacity:.55;} 70% { opacity:0;} 100% { transform:scale(1.4); opacity:0;} }
  @keyframes shrink { from { transform:scaleX(1);} to { transform:scaleX(0);} }
  `]
})
export class ToastContainerComponent {
  toasts = this.toastSvc.toasts;
  constructor(private toastSvc: ToastService) {}
  dismiss(id: number) { this.toastSvc.dismiss(id); }
  icon(type: string) { return type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'; }
  trackByToast = (_: number, t: any) => t.id;
}
