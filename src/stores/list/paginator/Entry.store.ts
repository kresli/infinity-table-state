import { makeAutoObservable } from "mobx";
import { PageStore } from "./Page.store";

export interface EntrySnapshot<Data> {
  data: Data;
}

export class EntryStore<Data> {
  data: Data | null = null;
  page: PageStore<Data>;

  constructor(page: PageStore<Data>) {
    this.page = page;
    makeAutoObservable(this);
  }

  applySnapshot(snapshot: EntrySnapshot<Data>) {
    this.data = snapshot.data;
  }
}
