import { faker as globalFaker } from "@faker-js/faker";
import seedrandom from "seedrandom";
import type { Row } from "./Row";

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

export function getPaginatedData(page: number, pageSize: number, removedRows: Set<number>): Row[] {
  const start = page * pageSize;
  const result: Row[] = [];
  for (let i = start; i < start + pageSize + removedRows.size; i++) {
    if (removedRows.has(i)) continue;
    result.push(generateRow(i));
    if (result.length >= pageSize) break;
  }
  return result;
}
