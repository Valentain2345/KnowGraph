interface TableRowItemProps {
  row: Record<string, string>
  columns: string[]
}

export function TableRowItem({ row, columns }: TableRowItemProps) {
  return (
    <tr className="hover:bg-zinc-900/50 transition-colors">
     {columns.map((column, index) => {
        const key = typeof column === "string" ? column : column.accessor || index;
        const accessor = typeof column === "string" ? column : column.accessor;
        return <td key={key} className="px-4 py-3 text-sm text-zinc-300 font-mono">{row[accessor]}</td>
      })}
    </tr>
  )
}
