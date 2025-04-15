/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export class Emitter<T extends string> {
  readonly listeners: Map<string, Set<Function>> = new Map();

  on(event: T, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  emit(event: string) {
    this.listeners.get(event)?.forEach((callback) => callback());
  }

  removeListener(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }
}
