import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Renders the rows a run_query call returned. Columns are derived from the
// first row's keys — whatever the query selected.
export function ResultTable({ rows }: { rows: unknown[] }) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">No rows returned.</p>;
  }

  const columns = Object.keys(rows[0] as Record<string, unknown>);

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col}>{formatCell((row as Record<string, unknown>)[col])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
