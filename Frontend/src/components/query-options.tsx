import React from "react";
import styled from "styled-components";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QueryOptionsProps {
  distinct: boolean;
  setDistinct: (checked: boolean) => void;
  isLimitEnabled: boolean;
  setIsLimitEnabled: (checked: boolean) => void;
  limit: number;
  setLimit: (val: number) => void;
  isOffsetEnabled: boolean;
  setIsOffsetEnabled: (checked: boolean) => void;
  offset: number;
  setOffset: (val: number) => void;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LimitOffsetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

export const QueryOptions: React.FC<QueryOptionsProps> = ({
  distinct,
  setDistinct,
  isLimitEnabled,
  setIsLimitEnabled,
  limit,
  setLimit,
  isOffsetEnabled,
  setIsOffsetEnabled,
  offset,
  setOffset,
}) => {
  return (
    <Container>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <CheckboxContainer>
          <Checkbox
            id="distinct"
            checked={distinct}
            onCheckedChange={(checked) => setDistinct(checked as boolean)}
            className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label htmlFor="distinct" className="text-zinc-800 text-sm cursor-pointer">
            Return distinct results
          </Label>
        </CheckboxContainer>
      </div>
      <LimitOffsetContainer>
        <CheckboxContainer>
          <Checkbox
            id="limitCheckbox"
            checked={isLimitEnabled}
            onCheckedChange={(checked) => setIsLimitEnabled(checked as boolean)}
            className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label htmlFor="limitCheckbox" className="text-zinc-800 text-sm cursor-pointer">
            Limit results
          </Label>
        </CheckboxContainer>
        {isLimitEnabled && (
          <NumberInputContainer>
            <div style={{ display: "flex", alignItems: "center" }}>
              <NumberButton onClick={() => setLimit(limit > 1 ? limit - 1 : 1)}>
                <ChevronDown className="w-3 h-3 text-zinc-800" />
              </NumberButton>
              <NumberInput
                type="number"
                value={limit}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1) setLimit(val);
                }}
                min={1}
              />
              <NumberButton onClick={() => setLimit(limit + 1)}>
                <ChevronUp className="w-3 h-3 text-zinc-800" />
              </NumberButton>
            </div>
            <span style={{ fontSize: "0.75rem", color: "rgb(59,59,59)" }}>results</span>
          </NumberInputContainer>
        )}
        <CheckboxContainer>
          <Checkbox
            id="offsetCheckbox"
            checked={isOffsetEnabled}
            onCheckedChange={(checked) => setIsOffsetEnabled(checked as boolean)}
            className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label htmlFor="offsetCheckbox" className="text-zinc-800 text-sm cursor-pointer">
            Offset results
          </Label>
        </CheckboxContainer>
        {isOffsetEnabled && (
          <NumberInputContainer>
            <div style={{ display: "flex", alignItems: "center" }}>
              <NumberButton onClick={() => setOffset(offset > 0 ? offset - 1 : 0)}>
                <ChevronDown className="w-3 h-3 text-zinc-800" />
              </NumberButton>
              <NumberInput
                type="number"
                value={offset}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) setOffset(val);
                }}
                min={0}
              />
              <NumberButton onClick={() => setOffset(offset + 1)}>
                <ChevronUp className="w-3 h-3 text-zinc-800" />
              </NumberButton>
            </div>
            <span style={{ fontSize: "0.75rem", color: "rgb(59,59,59)" }}>offset</span>
          </NumberInputContainer>
        )}
      </LimitOffsetContainer>
    </Container>
  );
};
