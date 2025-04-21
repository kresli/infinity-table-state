import { type Row } from "./Row";
import { Column } from "./Column";

export const columns: Column<Row>[] = [
  {
    id: "index",
    width: 50,
    BodyCell: ({ row }) => <div>{row.rowIndex}</div>,
    HeaderCell: () => <span>Index</span>,
  },
  {
    id: "name",
    width: 100,
    BodyCell: ({ row }) => <div className="truncate">{row.data.name}</div>,
    HeaderCell: () => <span className="truncate">Name</span>,
  },
  {
    id: "age",
    width: 100,
    BodyCell: ({ row }) => <div>{row.data.age}</div>,
    HeaderCell: () => <span>Age</span>,
  },
  {
    id: "email",
    width: "auto",
    BodyCell: ({ row }) => <span>{row.data.email}</span>,
    HeaderCell: () => <span>Email</span>,
  },
];
