import { makeAutoObservable } from "mobx";
import { PageSnapshot, PageStore } from "./Page.store";

export class PaginatorStore<Data> {
  readonly pages: PageStore<Data>[] = [];
  /**
   * @todo - rename to pageSize
   */
  perPage: number = 1;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * - on perPage change, we need to invalidate the pages
   * - on total change, we need to keep the previous pages instances
   */
  applySnapshot(pageData: PageSnapshot<Data>) {
    const totalPages = Math.ceil(pageData.total / pageData.perPage);
    if (pageData.perPage !== this.perPage) this.pages.length = 0;
    for (let i = 0; i < totalPages; i++) {
      this.pages[i] ??= new PageStore<Data>(this, pageData.perPage);
    }
    this.pages.length = totalPages;
    this.perPage = pageData.perPage;
    this.pages[pageData.index].applySnapshot(pageData);
  }
}
