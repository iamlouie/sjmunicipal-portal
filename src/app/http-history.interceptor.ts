import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HistoryService } from './components/header/history.service';

// Simple heuristic to infer entity name from URL path segment
function extractEntity(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    // relative URL
    const parts = url.split('?')[0].split('/').filter(Boolean);
    if (parts.length) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  return 'Resource';
}

export const httpHistoryInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const history = inject(HistoryService);
  const method = req.method.toUpperCase();
  const mutating = ['POST','PUT','PATCH','DELETE'].includes(method);
  if (!mutating) return next(req);

  const entity = extractEntity(req.url);
  const actionMap: Record<string, 'add' | 'update' | 'delete' | 'other'> = {
    'POST': 'add',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  };
  const action = actionMap[method] || 'other';
  const summaryBase = `${method} ${req.url}`;
  const bodyPreview = req.body && typeof req.body === 'object' ? req.body : undefined;

  return next(req).pipe(
    tap({
      next: () => {
        history.logChange({ entity, action, summary: summaryBase, extra: bodyPreview });
      },
      error: (err) => {
        history.logChange({ entity, action: 'other', summary: `${summaryBase} FAILED`, extra: { status: err.status, message: err.message } });
      }
    })
  );
};
