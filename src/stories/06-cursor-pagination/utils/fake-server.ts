import { faker } from "@faker-js/faker";

type Id = string;

export type Entry = {
  id: Id;
  name: string;
  age: number;
  email: string;
};

interface PageResponse {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  records: Entry[];
}

const TOTAL_ROWS = 1_000;

faker.seed(2);

const entriesMap = new Map<Id, Entry>();

for (let i = 0; i < TOTAL_ROWS; i++) {
  const entry = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 65 }),
    email: faker.internet.email().toLowerCase(),
  };
  entriesMap.set(entry.id, entry);
}

export async function apiGetPage(page: number, pageSize: number): Promise<PageResponse> {
  const timeout = randomNumber(500, 1000);
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = page * pageSize;
      const end = Math.min(start + pageSize, TOTAL_ROWS);
      const records = Array.from(entriesMap.values()).slice(start, end);
      resolve({
        pageIndex: page,
        pageSize,
        totalRecords: TOTAL_ROWS,
        records,
      });
    }, timeout);
  });
}

export async function apiDeleteRecord(id: string): Promise<boolean> {
  const timeout = randomNumber(500, 1000);
  return new Promise((resolve) => {
    setTimeout(() => {
      const entry = entriesMap.get(id);
      if (!entry) return false;
      entriesMap.delete(id);
      return resolve(true);
    }, timeout);
  });
}

function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
