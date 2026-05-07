import React from "react";
import styled from "styled-components";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  justify-content: center;
`;

const AddRowButton = styled(Button)`
  width: 100%;
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
  height: 2.25rem;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.5);
  }
`;

const NumberInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1.5rem;
`;

const NumberButton = styled.button`
  height: 2rem;
  padding: 0 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  transition: background 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }
`;

const NumberInput = styled(Input)`
  height: 2rem;
  width: 4rem;
  text-align: center;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0;
  font-size: 0.75rem;
  color: #1f2937;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

interface AddRowControlsProps {
  newRowCount: number;
  onAddSingleRow: () => void;
  onAddMultipleRows: (count: number) => void;
  onRowCountChange: (value: number) => void;
}

export const AddRowControls: React.FC<AddRowControlsProps> = ({
  newRowCount,
  onAddSingleRow,
  onAddMultipleRows,
  onRowCountChange,
}) => {
  const increment = () => onRowCountChange(newRowCount + 1);
  const decrement = () => onRowCountChange(newRowCount > 1 ? newRowCount - 1 : 1);

  return (
    <Container>
      <AddRowButton onClick={onAddSingleRow}>
        <Plus className="mr-2 w-4 h-4" /> Add Row
      </AddRowButton>
      <NumberInputContainer>
        <div style={{ display: "flex", alignItems: "center" }}>
          <NumberButton type="button" onClick={decrement}>
            <ChevronDown className="w-3 h-3 text-zinc-800" />
          </NumberButton>
          <NumberInput
            type="number"
            value={newRowCount}
            onChange={(e) => {
              const val = Number.parseInt(e.target.value);
              if (!isNaN(val) && val >= 1) onRowCountChange(val);
            }}
            min={1}
          />
          <NumberButton type="button" onClick={increment}>
            <ChevronUp className="w-3 h-3 text-zinc-800" />
          </NumberButton>
        </div>
        <span style={{ fontSize: "0.75rem", color: "rgb(59,59,59)" }}>rows</span>
      </NumberInputContainer>
      <AddRowButton onClick={() => onAddMultipleRows(newRowCount)}>
        <Plus className="mr-2 w-4 h-4" /> Add Multiple Rows
      </AddRowButton>
    </Container>
  );
};
