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
    name: `${firstName} ${lastName}`,
    age: globalFaker.number.int({ min: 18, max: 65 }),
    email: globalFaker.internet.email({ firstName, lastName }).toLowerCase(),
  };
}

export function getPaginatedData(page = 1, limit = 10): Row[] {
  const start = (page - 1) * limit;
  return Array.from({ length: limit }, (_, i) => generateRow(start + i));
}
