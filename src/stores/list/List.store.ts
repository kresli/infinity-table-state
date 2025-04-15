/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { comparer, makeAutoObservable, reaction } from "mobx";
import { PaginatorStore } from "./paginator/Paginator.store";
import { Emitter } from "./Emitter";
import { PageSnapshot, PageStore } from "./paginator/PageStore";

enum ListenerEventType {
  VISIBLE_PAGES_CHANGED = "visiblePagesChanged",
}

export class ListStore<Data> {
  static EventType = ListenerEventType;
  readonly emitter = new Emitter();
  readonly paginator = new PaginatorStore<Data>();

  visibleRange: [start: number, end: number] = [0, 0];

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.visiblePages.map((page) => page.index),
      () => this.emitter.emit(ListenerEventType.VISIBLE_PAGES_CHANGED),
      { equals: comparer.shallow }
    );
  }

  get totalPages() {
    return this.paginator.pages.length;
  }

  get visiblePages(): PageStore<Data>[] {
    const startPage = Math.floor(this.visibleRange[0] / this.paginator.perPage);
    const endPage = Math.floor(this.visibleRange[1] / this.paginator.perPage);
    return this.paginator.pages.slice(startPage, endPage + 1);
  }

  setVisibleRange(start: number, end: number) {
    this.visibleRange = [start, end];
  }

  applyPageSnapshot(pageData: PageSnapshot<Data>) {
    this.paginator.applySnapshot(pageData);
  }

  on(event: ListenerEventType, callback: Function) {
    this.emitter.on(event, callback);
    return () => this.off(event, callback);
  }

  off(event: ListenerEventType, callback: Function) {
    this.emitter.removeListener(event, callback);
  }
}
