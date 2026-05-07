import React from "react";
import styled from "styled-components";
import { QueryRow } from "./query-row";

interface QueryRowType {
  id: string;
  subject: string;
  concept: string;
  conceptPrefix: string;
  property: string;
  propertyPrefix: string;
  alias: string;
  order: string;
  visible: boolean;
  function: string;
  operator: string;
  value: string;
  optional: boolean;
  result: string;
  graphPattern: string;
  propertyPath: string;
  groupId?: string;
  graph?: string;
  service?: string;
}

interface Prefix {
  id: string;
  prefix: string;
  uri: string;
}

interface Dataset {
  id: string;
  type: "default" | "named";
  uri: string;
}
interface QueryTableProps {
  rows: QueryRowType[];
  prefixes: Prefix[];
  datasets: Dataset[];
  mockConcepts: string[];
  mockProperties: string[];
  orderOptions: string[];
  functions: string[];
  operators: string[];
  graphPatternTypes: string[];
  propertyPathOperators: string[];
  onUpdateRow: (id: string, field: keyof QueryRowType, value: any) => void;
  onRemoveRow: (id: string) => void;
  selectResetKey: number;
}

const TableContainer = styled.div<{ $rowsCount: number }>`
  position: relative;
  overflow-x: auto;
  overflow-y: ${({ $rowsCount }) => ($rowsCount >= 4 ? "auto" : "visible")};
  max-height: ${({ $rowsCount }) => ($rowsCount >= 4 ? "400px" : "none")};
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;

  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f3f4f6;
  }
`;

const ScrollShadowLeft = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 1rem;
  background: linear-gradient(to right, rgba(243, 244, 246, 0.5), transparent);
  pointer-events: none;
`;

const ScrollShadowRight = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 1rem;
  background: linear-gradient(to left, rgba(243, 244, 246, 0.5), transparent);
  pointer-events: none;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
`;

const Tbody = styled.tbody``;


export const QueryTable: React.FC<QueryTableProps> = ({
  rows,
  prefixes,
  datasets,
  mockConcepts,
  mockProperties,
  orderOptions,
  functions,
  operators,
  graphPatternTypes,
  propertyPathOperators,
  onUpdateRow,
  onRemoveRow,
  selectResetKey,
}) => {
  return (
    <TableContainer $rowsCount={rows.length}>
      <Table>
        <Thead>
          <tr>
            <th style={{ width: "100px", paddingLeft: "0.75rem" }}>Actions</th>
            <th style={{ width: "100px" }}>Subject</th>
            <th style={{ width: "100px" }}>Concept Prefix</th>
            <th style={{ width: "300px" }}>Concept</th>
            <th style={{ width: "100px" }}>Property Prefix</th>
            <th style={{ width: "300px" }}>Property</th>
            <th style={{ width: "180px" }}>Alias</th>
            <th style={{ width: "125px" }}>Order</th>
            <th style={{ width: "125px",paddingRight: "0.25rem" }}>Visible</th>
            <th style={{ width: "100px" }}>Function</th>
            <th style={{ width: "100px" }}>Operator</th>
            <th style={{ width: "100px" }}>Value</th>
            <th style={{ width: "130px" }}>Optional</th>
            <th style={{ width: "100px" }}>Result</th>
            <th style={{ width: "100px" }}>Pattern</th>
            <th style={{ width: "100px" }}>Path</th>
            <th style={{ width: "150px" }}>Graph</th>
            <th style={{ width: "150px" }}>Service</th>
          </tr>
        </Thead>
        <Tbody>
          {rows.map((row) => (
            <QueryRow
              key={row.id + "-" + selectResetKey}
              row={row}
              prefixes={prefixes}
              datasets={datasets}
              mockConcepts={mockConcepts}
              mockProperties={mockProperties}
              orderOptions={orderOptions}
              functions={functions}
              operators={operators}
              graphPatternTypes={graphPatternTypes}
              propertyPathOperators={propertyPathOperators}
              isOnlyRow={rows.length === 1}
              onUpdate={onUpdateRow}
              onRemove={onRemoveRow}
              selectKey={selectResetKey}
            />
          ))}
        </Tbody>
      </Table>
      <ScrollShadowLeft />
      <ScrollShadowRight />
    </TableContainer>
  );
};
