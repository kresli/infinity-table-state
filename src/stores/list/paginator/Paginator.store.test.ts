import { PageSnapshot } from "./PageStore";
import { PaginatorStore } from "./Paginator.store";

test("paginator instance", () => {
  expect(new PaginatorStore()).toBeInstanceOf(PaginatorStore);
});

test("applySnapshot updates entries", () => {
  interface Data {
    id: number;
    name: string;
  }
  const paginator = new PaginatorStore<Data>();
  paginator.applySnapshot({
    index: 0,
    perPage: 5,
    total: 10,
    data: [
      {
        id: 0,
        name: "test",
      },
    ],
  });
  expect(paginator.pages).toHaveLength(2);
  expect(paginator.pages[0].entries).toHaveLength(5);
});

test("applySnapshot will keep previous pages instances", () => {
  interface Data {
    id: number;
    name: string;
  }
  const paginator = new PaginatorStore<Data>();
  paginator.applySnapshot({
    index: 0,
    perPage: 5,
    total: 10,
    data: [
      {
        id: 0,
        name: "test",
      },
    ],
  });
  const page = paginator.pages[0];
  const entry = page.entries[0];
  paginator.applySnapshot({
    index: 0,
    perPage: 5,
    total: 10,
    data: [
      {
        id: 1,
        name: "test",
      },
    ],
  });
  expect(paginator.pages[0]).toBe(page);
  expect(paginator.pages[0].entries[0]).toBe(entry);
});

test("changing total will keep previous pages instances", () => {
  // we want to keep the previous pages instances as we just want to update the data.
  interface Data {
    id: number;
    name: string;
  }
  const paginator = new PaginatorStore<Data>();
  paginator.applySnapshot({
    index: 0,
    perPage: 5,
    total: 10,
    data: [
      {
        id: 0,
        name: "test",
      },
    ],
  });
  const page = paginator.pages[0];
  const entry = page.entries[0];
  paginator.applySnapshot({
    index: 1,
    perPage: 5,
    total: 20,
    data: [
      {
        id: 1,
        name: "test",
      },
    ],
  });
  expect(paginator.pages[0]).toBe(page);
  expect(paginator.pages[0].entries[0]).toBe(entry);
});

test("changing perPage will invlalidate pages", () => {
  // this is requried as we dont want to use previous state of pages.
  // all entries could be shifted to other pages.
  interface Data {
    id: number;
    name: string;
  }
  const paginator = new PaginatorStore<Data>();
  paginator.applySnapshot({
    index: 0,
    perPage: 5,
    total: 10,
    data: [
      {
        id: 0,
        name: "test",
      },
    ],
  });
  const page = paginator.pages[0];
  const entry = page.entries[0];
  paginator.applySnapshot({
    index: 0,
    perPage: 10,
    total: 10,
    data: [
      {
        id: 1,
        name: "test",
      },
    ],
  });
  expect(paginator.pages[0]).not.toBe(page);
  expect(paginator.pages[0].entries[0]).not.toBe(entry);
});

test("fetch status", async () => {
  interface Data {
    id: number;
    name: string;
  }
  const paginator = new PaginatorStore<Data>();
  paginator.applySnapshot({
    index: 0,
    perPage: 5,
    total: 10,
    data: [],
  });
  expect(paginator.pages).toHaveLength(2);
  const page = paginator.pages[0];
  let resolve: (value: PageSnapshot<Data> | PromiseLike<PageSnapshot<Data>>) => void = () => {};
  const promise = new Promise<PageSnapshot<Data>>((r) => (resolve = r));
  expect(page.isFetching).toBe(false);
  page.fetch(promise);
  expect(page.isFetching).toBe(true);
  resolve({
    index: 0,
    perPage: 5,
    total: 10,
    data: [
      {
        id: 0,
        name: "test",
      },
    ],
  });
  await promise;
  expect(page.isFetching).toBe(false);
  expect(page.entries[0].data).toEqual({
    id: 0,
    name: "test",
  });
});

test("invalidate pages if page size is changed with promise", async () => {
  // this is requried as we dont want to use previous state of pages.
  // all entries could be shifted to other pages.
  interface Data {
    id: number;
    name: string;
  }
  const paginator = new PaginatorStore<Data>();
  paginator.applySnapshot({
    index: 0,
    perPage: 5,
    total: 10,
    data: [
      {
        id: 0,
        name: "test",
      },
    ],
  });
  const page = paginator.pages[0];
  const entry = page.entries[0];
  let resolve: (value: PageSnapshot<Data> | PromiseLike<PageSnapshot<Data>>) => void = () => {};
  const promise = new Promise<PageSnapshot<Data>>((r) => (resolve = r));
  page.fetch(promise);
  resolve({
    index: 0,
    perPage: 10,
    total: 10,
    data: [
      {
        id: 1,
        name: "test",
      },
    ],
  });
  await promise;
  expect(paginator.pages[0]).not.toBe(page);
  expect(paginator.pages[0].entries[0]).not.toBe(entry);
});
