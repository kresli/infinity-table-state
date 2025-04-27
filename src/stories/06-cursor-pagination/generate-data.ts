import { faker as globalFaker } from "@faker-js/faker";
import seedrandom from "seedrandom";
import type { Row } from "./Row";

type Id = string | number;

const BASE_SEED = "my-seed";

function generateRow(index: number): Row {
  const rng = seedrandom(`${BASE_SEED}-${index}`);

  globalFaker.seed(rng.int32());

  const firstName = globalFaker.person.firstName();
  const lastName = globalFaker.person.lastName();

  return {
    id: globalFaker.string.uuid(),
    name: `${firstName} ${lastName}`,
    age: globalFaker.number.int({ min: 18, max: 65 }),
    email: globalFaker.internet.email({ firstName, lastName }).toLowerCase(),
  };
}

export function getPaginatedData(page: number, pageSize: number, removedRows: Set<Id>): Row[] {
  const start = page * pageSize;
  const result: Row[] = [];
  for (let i = start; i < start + pageSize + removedRows.size; i++) {
    const row = generateRow(i);
    if (removedRows.has(row.id)) continue;
    result.push(row);
    if (result.length >= pageSize) break;
  }
  return result;
}
