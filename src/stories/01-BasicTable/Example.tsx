import { columns } from "./columns";
import { data } from "./data";
import { Table } from "./Table";

export function Example() {
  return <Table data={data} columns={columns} />;
}
