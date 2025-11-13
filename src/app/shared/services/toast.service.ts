// src/app/shared/toast.service.ts
import { Injectable, TemplateRef } from '@angular/core';

export interface ToastOptions {
  classname?: string;
  delay?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Array<{
    textOrTpl: string | TemplateRef<any>;
    classname?: string;
    delay?: number;
  }> = [];

  show(textOrTpl: string | TemplateRef<any>, options: ToastOptions = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  clear() {
    this.toasts = [];
  }
}
