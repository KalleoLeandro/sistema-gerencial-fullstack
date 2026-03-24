import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  private nextId = 1;

  public readonly toasts$ = this.toastsSubject.asObservable();

  public show(message: string, type: ToastType = 'info', duration = 4000): void {
    const toast: ToastItem = {
      id: this.nextId++,
      message,
      type,
      duration
    };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    window.setTimeout(() => {
      this.dismiss(toast.id);
    }, duration);
  }

  public success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  public error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  public info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  public warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  public dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((toast) => toast.id !== id));
  }
}
