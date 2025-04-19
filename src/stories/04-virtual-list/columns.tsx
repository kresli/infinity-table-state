import { type Row } from "./Row";
import { Column } from "./Column";

export const columns: Column<Row>[] = [
  {
    id: "name",
    width: 100,
    BodyCell: ({ row }) => <div className="truncate">{row.name}</div>,
    HeaderCell: () => <span className="truncate">Name</span>,
  },
  {
    id: "age",
    width: 100,
    BodyCell: ({ row }) => <div>{row.age}</div>,
    HeaderCell: () => <span>Age</span>,
  },
  {
    id: "email",
    width: "auto",
    BodyCell: ({ row }) => <span>{row.email}</span>,
    HeaderCell: () => <span>Email</span>,
  },
];
