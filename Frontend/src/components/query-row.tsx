import React from "react";
import styled from "styled-components";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Trash2 } from "lucide-react";

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

interface QueryRowProps {
  row: QueryRowType;
  prefixes: Prefix[];
  datasets: Dataset[];
  mockConcepts: string[];
  mockProperties: string[];
  orderOptions: string[];
  functions: string[];
  operators: string[];
  graphPatternTypes: string[];
  propertyPathOperators: string[];
  isOnlyRow: boolean;
  onUpdate: (id: string, field: keyof QueryRowType, value: any) => void;
  onRemove: (id: string) => void;
  selectKey: number;
}

const StyledTd = styled.td`
  padding: 0.25rem;
  vertical-align: middle;
`;

const ConceptPropertyContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 0.25rem;
`;

const LargeInput = styled(Input)`
  background: white;
  border: 1px solid #d1d5db;
  color: #1f2937;
  font-size: 0.875rem;
  height: 2.5rem;
  flex: 1;
  min-width: 250px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
  }
`;

const RemoveButton = styled(Button)`
  background: white;
  border: 1px solid #fca5a5;
  color: #dc2626;
  height: 2rem;
  width: 2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &:hover {
    background: #fef2f2;
    color: #b91c1c;
  }

  &:disabled {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const StyledSelect = styled(Select)`
  width: 100%;
`;

const SelectTriggerStyled = styled(SelectTrigger)`
  width: 100%;
  background: #e5e7eb;
  border: 1px solid #d1d5db;
  color: #1f2937;
  font-size: 0.75rem;
  height: 2rem;

  &:hover {
    background: #d1d5db;
  }
`;

const CenteredDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const QueryRow: React.FC<QueryRowProps> = ({
  row,
  prefixes,
  datasets,
  mockConcepts,
  mockProperties,
  orderOptions,
  functions,
  operators,
  graphPatternTypes,
  propertyPathOperators,
  isOnlyRow,
  onUpdate,
  onRemove,
  selectKey,
}) => {
  const namedGraphs = datasets.filter((d) => d.type === "named");

  return (
    <tr>
      <StyledTd style={{ width: "120px" }}>
        <div style={{ paddingLeft: "1.1rem" }}>
          <RemoveButton
            variant="default"
            size="sm"
            onClick={() => onRemove(row.id)}
            disabled={isOnlyRow}
          >
            <Trash2 className="w-4 h-4" />
          </RemoveButton>
        </div>
      </StyledTd>

      <StyledTd style={{ width: "100px" }}>
        <Input
          placeholder="s1"
          value={row.subject}
          onChange={(e) => onUpdate(row.id, "subject", e.target.value)}
          className="w-full bg-zinc-200/50 border-zinc-300 text-gray text-xs h-8 min-w-[100px]"
        />
      </StyledTd>

      <StyledTd style={{ width: "120px" }}>
        <StyledSelect
          key={`conceptPrefix-${row.id}-${selectKey}`}
          value={row.conceptPrefix}
          onValueChange={(value) => onUpdate(row.id, "conceptPrefix", value)}
        >
          <SelectTriggerStyled>
            <SelectValue placeholder="Prefix" />
          </SelectTriggerStyled>
          <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
            <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">
              None
            </SelectItem>
            {prefixes.map((prefix) => (
              <SelectItem
                className="text-zinc-800 hover:bg-zinc-300"
                key={prefix.prefix}
                value={prefix.prefix}
              >
                {prefix.prefix}
              </SelectItem>
            ))}
          </SelectContent>
        </StyledSelect>
      </StyledTd>

      <StyledTd style={{ width: "400px" }}>
        <ConceptPropertyContainer>
          <LargeInput
            placeholder="Concept (e.g., Person)"
            value={row.concept}
            onChange={(e) => onUpdate(row.id, "concept", e.target.value)}
          />
          <StyledSelect
            key={`concept-${row.id}-${selectKey}`}
            value={row.concept}
            onValueChange={(value) => onUpdate(row.id, "concept", value)}
          >
            <SelectTriggerStyled style={{ width: "100px", flexShrink: 0 }}>
              <SelectValue placeholder="Select" />
            </SelectTriggerStyled>
            <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
              <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">
                None
              </SelectItem>
              {mockConcepts.map((concept) => (
                <SelectItem
                  key={concept}
                  value={concept}
                  className="text-zinc-800 hover:bg-zinc-300"
                >
                  {concept}
                </SelectItem>
              ))}
            </SelectContent>
          </StyledSelect>
        </ConceptPropertyContainer>
      </StyledTd>

      <StyledTd style={{ width: "120px" }}>
        <StyledSelect
          key={`propertyPrefix-${row.id}-${selectKey}`}
          value={row.propertyPrefix}
          onValueChange={(value) => onUpdate(row.id, "propertyPrefix", value)}
        >
          <SelectTriggerStyled>
            <SelectValue placeholder="Prefix" />
          </SelectTriggerStyled>
          <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
            <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">
              None
            </SelectItem>
            {prefixes.map((prefix) => (
              <SelectItem
                key={prefix.prefix}
                value={prefix.prefix}
                className="text-zinc-800 hover:bg-zinc-300"
              >
                {prefix.prefix}
              </SelectItem>
            ))}
          </SelectContent>
        </StyledSelect>
      </StyledTd>

      <StyledTd style={{ width: "400px" }}>
        <ConceptPropertyContainer>
          <LargeInput
            placeholder="Property (e.g., hasName)"
            value={row.property}
            onChange={(e) => onUpdate(row.id, "property", e.target.value)}
          />
          <StyledSelect
            key={`property-${row.id}-${selectKey}`}
            value={row.property}
            onValueChange={(value) => onUpdate(row.id, "property", value)}
          >
            <SelectTriggerStyled style={{ width: "100px", flexShrink: 0 }}>
              <SelectValue placeholder="Select" />
            </SelectTriggerStyled>
            <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
              <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">
                None
              </SelectItem>
              {mockProperties.map((property) => (
                <SelectItem
                  key={property}
                  value={property}
                  className="text-zinc-800 hover:bg-zinc-300"
                >
                  {property}
                </SelectItem>
              ))}
            </SelectContent>
          </StyledSelect>
        </ConceptPropertyContainer>
      </StyledTd>

      <StyledTd style={{ width: "160px" }}>
        <Input
          placeholder="alias (e.g., name)"
          value={row.alias}
          onChange={(e) => onUpdate(row.id, "alias", e.target.value)}
          className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs h-8 min-w-[185px]"
        />
      </StyledTd>

      <StyledTd style={{ width: "130px" }}>
        <StyledSelect
          value={row.order}
          onValueChange={(value) => onUpdate(row.id, "order", value)}
        >
          <SelectTriggerStyled>
            <SelectValue placeholder="Order" />
          </SelectTriggerStyled>
          <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
            {orderOptions.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="text-zinc-800 hover:bg-zinc-300"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </StyledSelect>
      </StyledTd>

      <StyledTd style={{ width: "100px" }}>
        <CenteredDiv>
          <Checkbox
            checked={row.visible}
            onCheckedChange={(checked) => onUpdate(row.id, "visible", checked)}
            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
        </CenteredDiv>
      </StyledTd>

      <StyledTd style={{ width: "130px" }}>
        <StyledSelect
          value={row.function}
          onValueChange={(value) => onUpdate(row.id, "function", value)}
        >
          <SelectTriggerStyled>
            <SelectValue placeholder="Function" />
          </SelectTriggerStyled>
          <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
            {functions.map((func) => (
              <SelectItem
                key={func}
                value={func}
                className="text-zinc-800 hover:bg-zinc-300"
              >
                {func}
              </SelectItem>
            ))}
          </SelectContent>
        </StyledSelect>
      </StyledTd>

      <StyledTd style={{ width: "130px" }}>
        <StyledSelect
          value={row.operator}
          onValueChange={(value) => onUpdate(row.id, "operator", value)}
        >
          <SelectTriggerStyled>
            <SelectValue placeholder="Operator" />
          </SelectTriggerStyled>
          <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
            <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">
              None
            </SelectItem>
            {operators.map((operator) => (
              <SelectItem
                key={operator}
                value={operator}
                className="text-zinc-800 hover:bg-zinc-300"
              >
                {operator}
              </SelectItem>
            ))}
          </SelectContent>
        </StyledSelect>
      </StyledTd>

      <StyledTd style={{ width: "130px" }}>
        <Input
          placeholder="value (e.g., 30)"
          value={row.value}
          onChange={(e) => onUpdate(row.id, "value", e.target.value)}
          className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs h-8 min-w-[170px]"
        />
      </StyledTd>

      <StyledTd style={{ width: "100px" }}>
        <CenteredDiv>
          <Checkbox
            checked={row.optional}
            onCheckedChange={(checked) => onUpdate(row.id, "optional", checked)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </CenteredDiv>
      </StyledTd>

      <StyledTd style={{ width: "130px" }}>
        <Input
          placeholder="result (e.g., count)"
          value={row.result}
          onChange={(e) => onUpdate(row.id, "result", e.target.value)}
          className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs h-8 min-w-[200px]"
        />
      </StyledTd>

      <StyledTd style={{ width: "120px" }}>
        <StyledSelect
          key={`graphPattern-${row.id}-${selectKey}`}
          value={row.graphPattern}
          onValueChange={(value) => onUpdate(row.id, "graphPattern", value)}
        >
          <SelectTriggerStyled>
            <SelectValue placeholder="Pattern" />
          </SelectTriggerStyled>
          <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
            {graphPatternTypes.map((pattern) => (
              <SelectItem
                key={pattern}
                value={pattern}
                className="text-zinc-800 hover:bg-zinc-300"
              >
                {pattern}
              </SelectItem>
            ))}
          </SelectContent>
        </StyledSelect>
      </StyledTd>

      <StyledTd style={{ width: "120px" }}>
        <StyledSelect
          key={`propertyPath-${row.id}-${selectKey}`}
          value={row.propertyPath}
          onValueChange={(value) => onUpdate(row.id, "propertyPath", value)}
        >
          <SelectTriggerStyled>
            <SelectValue placeholder="Path" />
          </SelectTriggerStyled>
          <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
            {propertyPathOperators.map((path) => (
              <SelectItem
                key={path}
                value={path}
                className="text-zinc-800 hover:bg-zinc-300"
              >
                {path}
              </SelectItem>
            ))}
          </SelectContent>
        </StyledSelect>
      </StyledTd>

      <StyledTd style={{ width: "180px" }}>
        <StyledSelect
          key={`graph-${row.id}-${selectKey}`}
          value={row.graph}
          onValueChange={(value) => onUpdate(row.id, "graph", value)}
        >
          <SelectTriggerStyled>
            <SelectValue placeholder="Graph" />
          </SelectTriggerStyled>
          <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
            <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">
              None
            </SelectItem>
            {namedGraphs.map((dataset) => (
              <SelectItem
                key={dataset.id}
                value={dataset.uri}
                className="text-zinc-800 hover:bg-zinc-300"
              >
                {dataset.uri}
              </SelectItem>
            ))}
          </SelectContent>
        </StyledSelect>
      </StyledTd>

      <StyledTd style={{ width: "250px" }}>
        <Input
          placeholder="Service URL (e.g., http://example.com/sparql)"
          value={row.service}
          onChange={(e) => onUpdate(row.id, "service", e.target.value)}
          className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs h-8 min-w-[420px]"
        />
      </StyledTd>
    </tr>
  );
};
