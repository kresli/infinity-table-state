import { makeAutoObservable } from "mobx";
import { PaginatorStore } from "./Paginator.store";
import { EntryStore } from "./Entry.store";

export interface PageSnapshot<Data> {
  index: number;
  perPage: number;
  total: number;
  data: Data[];
}

export class PageStore<Data> {
  readonly entries: EntryStore<Data>[];
  paginator: PaginatorStore<Data>;

  constructor(paginator: PaginatorStore<Data>, perPage: number) {
    this.paginator = paginator;
    this.entries = Array.from({ length: perPage }, () => new EntryStore<Data>(this));
    makeAutoObservable(this);
  }

  get index() {
    return this.paginator.pages.indexOf(this);
  }

  applySnapshot(data: PageSnapshot<Data>) {
    for (let i = 0; i < data.perPage; i++) {
      this.entries[i] ??= new EntryStore<Data>(this);
      this.entries[i].applySnapshot({ data: data.data[i] });
    }
    this.entries.length = data.perPage;
  }

  isFetching = false;

  async fetch(promise: Promise<PageSnapshot<Data>>) {
    this.isFetching = true;
    try {
      const data = await promise;
      this.paginator.applySnapshot(data);
    } finally {
      this.isFetching = false;
    }
  }
}
