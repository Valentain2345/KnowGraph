"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import { Code, ChevronDown, ChevronUp, Trash2,Plus } from "lucide-react"; // Added Trash2 icon
import { PrefixManager } from "../components/prefix-wizard";
import { DatasetManager } from "../components/dataset-manager";

const mockConcepts = ["Person", "Organization", "Document", "Event", "Location"];
const mockProperties = ["hasName", "hasAge", "worksFor", "locatedIn", "createdBy"];
const operators = ["=", "<>", "<", "<=", ">", ">=", "contains", "starts with", "ends with", "in", "not in"];
const functions = ["none", "Average", "Count", "Sum", "Max", "Min", "Group by", "Group Concat"];
const orderOptions = ["none", "ascending", "descending"];
const graphPatternTypes = ["Basic", "Optional", "Union", "Minus"];
const propertyPathOperators = ["none", "/", "^", "|", "*", "+", "?", "!uri", "!^uri"];
const commonPrefixes = [
  { prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
  { prefix: "rdfs", uri: "http://www.w3.org/2000/01/rdf-schema#" },
  { prefix: "xsd", uri: "http://www.w3.org/2001/XMLSchema#" },
  { prefix: "owl", uri: "http://www.w3.org/2002/07/owl#" },
  { prefix: "foaf", uri: "http://xmlns.com/foaf/0.1/" },
];

interface QueryRow {
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

interface SparqlQueryWizardProps {
  setQuery: (query: string) => void;
  setMessage: (message: { text: string; type: "info" | "success" | "error" }) => void;
}

// Styled components
const Container = styled.div`
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 70vw;
`;

const QueryCard = styled(Card)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const QueryHeader = styled(CardHeader)`
  padding-bottom: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #e5e7eb;
`;


const QueryContent = styled(CardContent)`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QueryDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

interface TableContainerProps {
  rowsCount: number;
}

const TableContainer = styled.div<TableContainerProps>`
  position: relative;
  overflow-x: auto;
  overflow-y: ${({ rowsCount }) => (rowsCount >= 4 ? "auto" : "visible")};
  max-height: ${({ rowsCount }) => (rowsCount >= 4 ? "400px" : "auto")};
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


const FieldWrapper = styled.div<{ width: string }>`
  width: ${(props) => props.width};
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const ConceptPropertyContainer = styled.div`
  width: 200px;
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
`;


const TableHeader = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  min-width: fit-content;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  padding: 0.5rem;
  min-width: fit-content;
  background: white;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const LargeInput = styled(Input)`
  background: white;
  border: 1px solid #d1d5db;
  color: #1f2937;
  font-size: 0.875rem;
  height: 2.5rem;
  min-width: 100%;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
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

const OptionsContainer = styled.div`
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

const GenerateButton = styled(Button)`
  width: 100%;
  background: #10b981;
  color: white;
  height: 2.25rem;
  font-weight: 500;
  transition: background 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #059669;
  }
`;

const GeneratedQueryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
`;

const GeneratedQueryTextarea = styled(Textarea)`
  background: white;
  border: 1px solid #d1d5db;
  color: #1f2937;
  font-family: monospace;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  border-radius: 0.375rem;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
  }
`;

const AddRowContainer = styled.div`
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

export function SparqlQueryWizard({ setQuery, setMessage }: SparqlQueryWizardProps) {
  const [rows, setRows] = useState<QueryRow[]>([
    {
      id: "1",
      subject: "",
      concept: "",
      conceptPrefix: "",
      property: "",
      propertyPrefix: "",
      alias: "",
      order: "none",
      visible: true,
      function: "none",
      operator: "",
      value: "",
      optional: false,
      result: "",
      graphPattern: "Basic",
      propertyPath: "none",
      groupId: "",
      graph: "",
      service: "",
    },
  ]);
  const [prefixes, setPrefixes] = useState<Prefix[]>([
    { id: "1", prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
  ]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [distinct, setDistinct] = useState(false);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLimitEnabled, setIsLimitEnabled] = useState(true);
  const [isOffsetEnabled, setIsOffsetEnabled] = useState(false);
  const [queryDescription, setQueryDescription] = useState("");

  const [isQueryBuilderCollapsed, setIsQueryBuilderCollapsed] = useState(false);
  const [newRowCount, setNewRowCount] = useState(1);
  const [selectKeys, setSelectKeys] = useState<{ [key: string]: number }>(
    rows.reduce(
      (acc, row) => ({
        ...acc,
        [`concept-${row.id}`]: 0,
        [`property-${row.id}`]: 0,
        [`conceptPrefix-${row.id}`]: 0,
        [`propertyPrefix-${row.id}`]: 0,
        [`graphPattern-${row.id}`]: 0,
        [`propertyPath-${row.id}`]: 0,
        [`graph-${row.id}`]: 0,
        [`service-${row.id}`]: 0,
      }),
      {}
    )
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle select keys update when rows, prefixes, or datasets change
  useEffect(() => {
    setSelectKeys(
      rows.reduce(
        (acc, row) => ({
          ...acc,
          [`concept-${row.id}`]: 0,
          [`property-${row.id}`]: 0,
          [`conceptPrefix-${row.id}`]: 0,
          [`propertyPrefix-${row.id}`]: 0,
          [`graphPattern-${row.id}`]: 0,
          [`propertyPath-${row.id}`]: 0,
          [`graph-${row.id}`]: 0,
          [`service-${row.id}`]: 0,
        }),
        {}
      )
    );
  }, [rows.length, prefixes, datasets]);

  // Limit, Offset, and Row Count controls
  const startHolding = (type: "increment" | "decrement", field: "limit" | "offset" | "rowCount") => {
    intervalRef.current = setInterval(() => {
      if (field === "limit") {
        if (type === "increment") {
          setLimit((prev) => prev + 1);
        } else {
          setLimit((prev) => (prev > 1 ? prev - 1 : 1));
        }
      } else if (field === "offset") {
        if (type === "increment") {
          setOffset((prev) => prev + 1);
        } else {
          setOffset((prev) => (prev > 0 ? prev - 1 : 0));
        }
      } else if (field === "rowCount") {
        if (type === "increment") {
          setNewRowCount((prev) => prev + 1);
        } else {
          setNewRowCount((prev) => (prev > 1 ? prev - 1 : 1));
        }
      }
    }, 100);
  };

  const stopHolding = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleIncrement = (field: "limit" | "offset" | "rowCount") => {
    if (field === "limit") {
      setLimit((prev) => prev + 1);
    } else if (field === "offset") {
      setOffset((prev) => prev + 1);
    } else if (field === "rowCount") {
      setNewRowCount((prev) => prev + 1);
    }
  };

  const handleDecrement = (field: "limit" | "offset" | "rowCount") => {
    if (field === "limit") {
      setLimit((prev) => (prev > 1 ? prev - 1 : 1));
    } else if (field === "offset") {
      setOffset((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (field === "rowCount") {
      setNewRowCount((prev) => (prev > 1 ? prev - 1 : 1));
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setLimit(value);
    }
  };

  const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setOffset(value);
    }
  };

  const handleRowCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setNewRowCount(value);
    }
  };

  // Query row management
  const updateRow = (id: string, field: keyof QueryRow, value: any) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    const newRow: QueryRow = {
      id: `${rows.length + 1}`,
      subject: "",
      concept: "",
      conceptPrefix: "",
      property: "",
      propertyPrefix: "",
      alias: "",
      order: "none",
      visible: true,
      function: "none",
      operator: "",
      value: "",
      optional: false,
      result: "",
      graphPattern: "Basic",
      propertyPath: "none",
      groupId: "",
      graph: "",
      service: "",
    };
    setRows((prev) => [...prev, newRow]);
    setSelectKeys((prev) => ({
      ...prev,
      [`concept-${newRow.id}`]: 0,
      [`property-${newRow.id}`]: 0,
      [`conceptPrefix-${newRow.id}`]: 0,
      [`propertyPrefix-${newRow.id}`]: 0,
      [`graphPattern-${newRow.id}`]: 0,
      [`propertyPath-${newRow.id}`]: 0,
      [`graph-${newRow.id}`]: 0,
      [`service-${newRow.id}`]: 0,
    }));
  };

  const addMultipleRows = (count: number) => {
    const newRows: QueryRow[] = Array.from({ length: count }, (_, index) => ({
      id: `${rows.length + index + 1}`,
      subject: "",
      concept: "",
      conceptPrefix: "",
      property: "",
      propertyPrefix: "",
      alias: "",
      order: "none",
      visible: true,
      function: "none",
      operator: "",
      value: "",
      optional: false,
      result: "",
      graphPattern: "Basic",
      propertyPath: "none",
      groupId: "",
      graph: "",
      service: "",
    }));
    setRows((prev) => [...prev, ...newRows]);
    setSelectKeys((prev) => {
      const newKeys = newRows.reduce(
        (acc, row) => ({
          ...acc,
          [`concept-${row.id}`]: 0,
          [`property-${row.id}`]: 0,
          [`conceptPrefix-${row.id}`]: 0,
          [`propertyPrefix-${row.id}`]: 0,
          [`graphPattern-${row.id}`]: 0,
          [`propertyPath-${row.id}`]: 0,
          [`graph-${row.id}`]: 0,
          [`service-${row.id}`]: 0,
        }),
        {}
      );
      return { ...prev, ...newKeys };
    });
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
    setSelectKeys((prev) => {
      const newKeys = { ...prev };
      delete newKeys[`concept-${id}`];
      delete newKeys[`property-${id}`];
      delete newKeys[`conceptPrefix-${id}`];
      delete newKeys[`propertyPrefix-${id}`];
      delete newKeys[`graphPattern-${id}`];
      delete newKeys[`propertyPath-${id}`];
      delete newKeys[`graph-${id}`];
      delete newKeys[`service-${id}`];
      return newKeys;
    });
  };

  // Query generation
  const generateQuery = () => {
    let query = "";
    const variablesInResult: string[] = [];
    const triplesInWhere: string[] = [];
    const filterConditions: string[] = [];
    const orderList: string[] = [];
    const groupByList: string[] = [];
    const havingConditions: string[] = [];
    const variablesForRDFType = new Set<string>();

    if (queryDescription) {
      query += `# ${queryDescription}\n\n`;
    }

    prefixes.forEach((prefix) => {
      if (prefix.prefix && prefix.uri) {
        query += `PREFIX ${prefix.prefix}: <${prefix.uri}>\n`;
      } else if (!prefix.prefix && prefix.uri) {
        query += `PREFIX <${prefix.uri}>\n`;
      }
    });
    if (prefixes.length > 0) query += "\n";

    const defaultGraphs = datasets.filter((d) => d.type === "default");
    const namedGraphs = datasets.filter((d) => d.type === "named");
    defaultGraphs.forEach((graph) => {
      if (graph.uri) {
        query += `FROM <${graph.uri}>\n`;
      }
    });
    namedGraphs.forEach((graph) => {
      if (graph.uri) {
        query += `FROM NAMED <${graph.uri}>\n`;
      }
    });
    if (defaultGraphs.length > 0 || namedGraphs.length > 0) query += "\n";

    rows.forEach((row, rowIndex) => {
      const questionVariable = `?${row.subject}`;
      const questionAlias = `?${row.alias}`;
      const concept = row.conceptPrefix ? `${row.conceptPrefix}:${row.concept}` : row.concept;
      let property = row.propertyPrefix ? `${row.propertyPrefix}:${row.property}` : row.property;

      if (row.propertyPath !== "none") {
        if (row.propertyPath === "!uri" || row.propertyPath === "!^uri") {
          property = `${row.propertyPath} <${row.property}>`;
        } else {
          property = `${property}${row.propertyPath}`;
        }
      }

      let triplePattern = "";
      if (row.subject && row.alias && !row.concept && !row.property) {
        triplePattern = `${questionVariable} ${questionAlias} .`;
      } else if (row.subject && row.concept && row.property && row.alias) {
        const triples: string[] = [];
        if (!variablesForRDFType.has(row.subject)) {
          triples.push(`${questionVariable} rdf:type ${concept} .`);
          variablesForRDFType.add(row.subject);
        }
        triples.push(`${questionVariable} ${property} ${questionAlias} .`);
        triplePattern = triples.join("\n    ");
      } else if (row.subject || row.concept || row.property || row.alias) {
        setGeneratedQuery(
          `# Error in row ${rowIndex + 1}: Incomplete row. Ensure subject, concept, property, and alias are provided, or use subject and alias for simple triple.`
        );
        setMessage({
          text: `Error in row ${rowIndex + 1}: Incomplete row. Ensure subject, concept, property, and alias are provided.`,
          type: "error",
        });
        return;
      }

      if (triplePattern) {
        let wrappedPattern = triplePattern;
        if (row.service) {
          wrappedPattern = `SERVICE <${row.service}> { ${triplePattern} }`;
        } else if (row.graph) {
          wrappedPattern = `GRAPH <${row.graph}> { ${triplePattern} }`;
        } else if (row.graphPattern === "Optional") {
          wrappedPattern = `OPTIONAL { ${triplePattern} }`;
        }
        triplesInWhere.push(wrappedPattern);
      }

      if (row.visible && row.alias) {
        if (row.function === "none" || row.function === "Where") {
          variablesInResult.push(questionAlias);
        } else if (row.function === "Group by") {
          variablesInResult.push(questionAlias);
          groupByList.push(questionAlias);
        } else {
          const resultVar = row.result || `result${rowIndex + 1}`;
          variablesInResult.push(`(${functionTranslated(row.function)}(${questionAlias}) AS ?${resultVar})`);
          if (row.operator && row.value) {
            havingConditions.push(buildFilterExpression(row, `?${resultVar}`));
          }
        }
      }

      if (row.operator && row.value && row.function !== "Group by") {
        filterConditions.push(buildFilterExpression(row, questionAlias));
      } else if (row.value && !row.operator) {
        setGeneratedQuery(`# Error in row ${rowIndex + 1}: Missing operator for value`);
        setMessage({
          text: `Error in row ${rowIndex + 1}: Missing operator for value`,
          type: "error",
        });
        return;
      }

      if (row.order !== "none") {
        orderList.push(row.order === "ascending" ? questionAlias : `DESC(${questionAlias})`);
      }
    });

    if (generatedQuery.startsWith("# Error")) return;

    query += `SELECT${distinct ? " DISTINCT" : ""} ${
      variablesInResult.length > 0 ? variablesInResult.join(" ") : ""
    }\nWHERE\n{\n`;
    triplesInWhere.forEach((triple) => {
      query += `  ${triple}\n`;
    });

    if (filterConditions.length > 0) {
      query += "  FILTER (";
      filterConditions.forEach((condition, idx) => {
        query += condition;
        if (idx < filterConditions.length - 1) query += " && ";
      });
      query += ")\n";
    }

    query += "}\n";

    if (groupByList.length > 0) {
      query += "GROUP BY ";
      groupByList.forEach((variable, idx) => {
        query += variable;
        if (idx < groupByList.length - 1) query += ", ";
      });
      query += "\n";
    }

    if (havingConditions.length > 0) {
      query += "HAVING (";
      havingConditions.forEach((condition, idx) => {
        query += condition;
        if (idx < havingConditions.length - 1) query += " && ";
      });
      query += ")\n";
    }

    if (orderList.length > 0) {
      query += "ORDER BY ";
      orderList.forEach((order, idx) => {
        query += order;
        if (idx < orderList.length - 1) query += ", ";
      });
      query += "\n";
    }

    if (isLimitEnabled && limit > 0) {
      query += `LIMIT ${limit}\n`;
    }
    if (isOffsetEnabled && offset > 0) {
      query += `OFFSET ${offset}\n`;
    }

    setGeneratedQuery(query);
    setQuery(query);
    setMessage({
      text: "Query copied to Query Executor",
      type: "success",
    });
  };

  const functionTranslated = (functionName: string) => {
    switch (functionName) {
      case "Average":
        return "AVG";
      case "Count":
        return "COUNT";
      case "Sum":
        return "SUM";
      case "Max":
        return "MAX";
      case "Min":
        return "MIN";
      case "Group Concat":
        return "GROUP_CONCAT";
      default:
        return functionName;
    }
  };

  const buildFilterExpression = (row: QueryRow, variable: string) => {
    const { operator, value } = row;
    if (operator === "contains") {
      return `regex(str(${variable}), "${value}", "i")`;
    } else if (operator === "starts with") {
      return `strstarts(str(${variable}), "${value}")`;
    } else if (operator === "ends with") {
      return `strends(str(${variable}), "${value}")`;
    } else if (operator === "in" || operator === "not in") {
      const values = value
        .split(",")
        .map((v) => `"${v.trim()}"`)
        .join(", ");
      return `${variable} ${operator.toUpperCase()} (${values})`;
    } else {
      let typedValue = value;
      if (value.match(/^\d+$/)) {
        typedValue = `"${value}"^^xsd:integer`;
      } else if (value.match(/^\d+\.\d+$/)) {
        typedValue = `"${value}"^^xsd:decimal`;
      } else if (value === "true" || value === "false") {
        typedValue = `"${value}"^^xsd:boolean`;
      } else {
        typedValue = `"${value}"`;
      }
      return `${variable} ${operator} ${typedValue}`;
    }
  };

  return (
    <Container>
      <PrefixManager prefixes={prefixes} setPrefixes={setPrefixes} commonPrefixes={commonPrefixes} />
      <DatasetManager datasets={datasets} setDatasets={setDatasets} />
      <QueryCard>
        <QueryHeader>
          <div>
            <CardTitle className="text-zinc-800 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-700" />
              Query Builder
            </CardTitle>
            <CardDescription className="text-zinc-600">Build your SPARQL query using the visual wizard</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsQueryBuilderCollapsed(!isQueryBuilderCollapsed)}
            className="text-zinc-400 hover:text-white"
          >
            {isQueryBuilderCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </QueryHeader>
        {!isQueryBuilderCollapsed && (
          <QueryContent>
            <QueryDescriptionContainer>
              <Label className="text-sm text-zinc-600">Query Description</Label>
              <Input
                placeholder="Enter query description"
                value={queryDescription}
                onChange={(e) => setQueryDescription(e.target.value)}
                className="bg-zinc-200/50 border-zinc-300 text-black text-sm h-8"
              />
            </QueryDescriptionContainer>
            <TableContainer rowsCount={rows.length}>
              <TableHeader>
                <FieldWrapper width="80px">
                  <Label className="text-xs text-zinc-600 font-medium">Actions</Label>
                </FieldWrapper>
                <FieldWrapper width="100px">
                  <Label className="text-xs text-zinc-600 font-medium">Subject</Label>
                </FieldWrapper>
                <FieldWrapper width="100px">
                  <Label className="text-xs text-zinc-600 font-medium">Concept Prefix</Label>
                </FieldWrapper>
                <FieldWrapper width="300px">
                  <Label className="text-xs text-zinc-600 font-medium">Concept</Label>
                </FieldWrapper>
                <FieldWrapper width="100px">
                  <Label className="text-xs text-zinc-600 font-medium">Property Prefix</Label>
                </FieldWrapper>
                <FieldWrapper width="300px">
                  <Label className="text-xs text-zinc-600 font-medium">Property</Label>
                </FieldWrapper>
                <FieldWrapper width="180px">
                  <Label className="text-xs text-zinc-600 font-medium">Alias</Label>
                </FieldWrapper>
                <FieldWrapper width="125px">
                  <Label className="text-xs text-zinc-600 font-medium">Order</Label>
                </FieldWrapper>
                <FieldWrapper width="125px">
                  <Label className="text-xs text-zinc-600 font-medium text-center">Visible</Label>
                </FieldWrapper>
                <FieldWrapper width="100px">
                  <Label className="text-xs text-zinc-600 font-medium">Function</Label>
                </FieldWrapper>
                <FieldWrapper width="100px">
                  <Label className="text-xs text-zinc-600 font-medium">Operator</Label>
                </FieldWrapper>
                <FieldWrapper width="100px">
                  <Label className="text-xs text-zinc-600 font-medium">Value</Label>
                </FieldWrapper>
                <FieldWrapper width="130px">
                  <Label className="text-xs text-zinc-600 font-medium text-center">Optional</Label>
                </FieldWrapper>
                <FieldWrapper width="100px">
                  <Label className="text-xs text-zinc-600 font-medium">Result</Label>
                </FieldWrapper>
                <FieldWrapper width="100px">
                  <Label className="text-xs text-zinc-600 font-medium">Pattern</Label>
                </FieldWrapper>
                <FieldWrapper width="100px">
                  <Label className="text-xs text-zinc-600 font-medium">Path</Label>
                </FieldWrapper>
                <FieldWrapper width="150px">
                  <Label className="text-xs text-zinc-600 font-medium">Graph</Label>
                </FieldWrapper>
                <FieldWrapper width="150px">
                  <Label className="text-xs text-zinc-600 font-medium">Service</Label>
                </FieldWrapper>
              </TableHeader>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <FieldWrapper width="80px">
                    <RemoveButton
                      variant="default"
                      size="sm"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </RemoveButton>
                  </FieldWrapper>
                  <FieldWrapper width="100px">
                    <Input
                      placeholder="s1"
                      value={row.subject}
                      onChange={(e) => updateRow(row.id, "subject", e.target.value)}
                      className="bg-zinc-200/50 border-zinc-300 text-gray text-xs h-8"
                    />
                  </FieldWrapper>
                  <FieldWrapper width="100px">
                    <Select
                      key={`conceptPrefix-${row.id}-${selectKeys[`conceptPrefix-${row.id}`]}`}
                      value={row.conceptPrefix}
                      onValueChange={(value) => updateRow(row.id, "conceptPrefix", value)}
                    >
                      <SelectTrigger className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300">
                        <SelectValue placeholder="Prefix" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                        <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">None</SelectItem>
                        {prefixes.map((prefix) => (
                          <SelectItem className="text-zinc-800 hover:bg-zinc-300" key={prefix.prefix} value={prefix.prefix}>
                            {prefix.prefix}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper width="300px">
                    <ConceptPropertyContainer>
                      <LargeInput
                        placeholder="Concept (e.g., Person)"
                        value={row.concept}
                        onChange={(e) => updateRow(row.id, "concept", e.target.value)}
                      />
                      <Select
                        key={`concept-${row.id}-${selectKeys[`concept-${row.id}`]}`}
                        value={row.concept}
                        onValueChange={(value) => updateRow(row.id, "concept", value)}
                      >
                        <SelectTrigger className="w-[100px] bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                          <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">None</SelectItem>
                          {mockConcepts.map((concept) => (
                            <SelectItem key={concept} value={concept} className="text-zinc-800 hover:bg-zinc-300">
                              {concept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ConceptPropertyContainer>
                  </FieldWrapper>
                  <FieldWrapper width="100px">
                    <Select
                      key={`propertyPrefix-${row.id}-${selectKeys[`propertyPrefix-${row.id}`]}`}
                      value={row.propertyPrefix}
                      onValueChange={(value) => updateRow(row.id, "propertyPrefix", value)}
                    >
                      <SelectTrigger className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300">
                        <SelectValue placeholder="Prefix" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                        <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">None</SelectItem>
                        {prefixes.map((prefix) => (
                          <SelectItem key={prefix.prefix} value={prefix.prefix} className="text-zinc-800 hover:bg-zinc-300">
                            {prefix.prefix}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper width="300px">
                    <ConceptPropertyContainer>
                      <LargeInput
                        placeholder="Property (e.g., hasName)"
                        value={row.property}
                        onChange={(e) => updateRow(row.id, "property", e.target.value)}
                      />
                      <Select
                        key={`property-${row.id}-${selectKeys[`property-${row.id}`]}`}
                        value={row.property}
                        onValueChange={(value) => updateRow(row.id, "property", value)}
                      >
                        <SelectTrigger className="w-[100px] bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300 h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                          <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">None</SelectItem>
                          {mockProperties.map((property) => (
                            <SelectItem key={property} value={property} className="text-zinc-800 hover:bg-zinc-300">
                              {property}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ConceptPropertyContainer>
                  </FieldWrapper>
                  <FieldWrapper width="180px">
                    <Input
                      placeholder="alias (e.g., name)"
                      value={row.alias}
                      onChange={(e) => updateRow(row.id, "alias", e.target.value)}
                      className="bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs h-8"
                    />
                  </FieldWrapper>
                  <FieldWrapper width="125px">
                    <Select value={row.order} onValueChange={(value) => updateRow(row.id, "order", value)}>
                      <SelectTrigger className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300 h-8">
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                        {orderOptions.map((option) => (
                          <SelectItem key={option} value={option} className="text-zinc-800 hover:bg-zinc-300">
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper width="125px">
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <Checkbox
                        checked={row.visible}
                        onCheckedChange={(checked) => updateRow(row.id, "visible", checked)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                    </div>
                  </FieldWrapper>
                  <FieldWrapper width="100px">
                    <Select value={row.function} onValueChange={(value) => updateRow(row.id, "function", value)}>
                      <SelectTrigger className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300 h-8">
                        <SelectValue placeholder="Function" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                        {functions.map((func) => (
                          <SelectItem key={func} value={func} className="text-zinc-800 hover:bg-zinc-300">
                            {func}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper width="100px">
                    <Select value={row.operator} onValueChange={(value) => updateRow(row.id, "operator", value)}>
                      <SelectTrigger className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300 h-8">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                        <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">None</SelectItem>
                        {operators.map((operator) => (
                          <SelectItem key={operator} value={operator} className="text-zinc-800 hover:bg-zinc-300">
                            {operator}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper width="100px">
                    <Input
                      placeholder="value (e.g., 30)"
                      value={row.value}
                      onChange={(e) => updateRow(row.id, "value", e.target.value)}
                      className="bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs h-8"
                    />
                  </FieldWrapper>
                  <FieldWrapper width="130px">
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <Checkbox
                        checked={row.optional}
                        onCheckedChange={(checked) => updateRow(row.id, "optional", checked)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </div>
                  </FieldWrapper>
                  <FieldWrapper width="100px">
                    <Input
                      placeholder="result (e.g., count)"
                      value={row.result}
                      onChange={(e) => updateRow(row.id, "result", e.target.value)}
                      className="bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs h-8"
                    />
                  </FieldWrapper>
                  <FieldWrapper width="100px">
                    <Select
                      key={`graphPattern-${row.id}-${selectKeys[`graphPattern-${row.id}`]}`}
                      value={row.graphPattern}
                      onValueChange={(value) => updateRow(row.id, "graphPattern", value)}
                    >
                      <SelectTrigger className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300 h-8">
                        <SelectValue placeholder="Pattern" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                        {graphPatternTypes.map((pattern) => (
                          <SelectItem key={pattern} value={pattern} className="text-zinc-800 hover:bg-zinc-300">
                            {pattern}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper width="100px">
                    <Select
                      key={`propertyPath-${row.id}-${selectKeys[`propertyPath-${row.id}`]}`}
                      value={row.propertyPath}
                      onValueChange={(value) => updateRow(row.id, "propertyPath", value)}
                    >
                      <SelectTrigger className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300 h-8">
                        <SelectValue placeholder="Path" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                        {propertyPathOperators.map((path) => (
                          <SelectItem key={path} value={path} className="text-zinc-800 hover:bg-zinc-300">
                            {path}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper width="150px">
                    <Select
                      key={`graph-${row.id}-${selectKeys[`graph-${row.id}`]}`}
                      value={row.graph}
                      onValueChange={(value) => updateRow(row.id, "graph", value)}
                    >
                      <SelectTrigger className="w-full bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs hover:bg-zinc-300 h-8">
                        <SelectValue placeholder="Graph" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-100 border-zinc-400 text-xs">
                        <SelectItem value="none" className="text-zinc-800 hover:bg-zinc-300">None</SelectItem>
                        {datasets
                          .filter((d) => d.type === "named")
                          .map((dataset) => (
                            <SelectItem key={dataset.id} value={dataset.uri} className="text-zinc-800 hover:bg-zinc-300">
                              {dataset.uri}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper width="150px">
                    <Input
                      placeholder="Service URL (e.g., http://example.com/sparql)"
                      value={row.service}
                      onChange={(e) => updateRow(row.id, "service", e.target.value)}
                      className="bg-zinc-200/50 border-zinc-300 text-zinc-800 text-xs h-8"
                    />
                  </FieldWrapper>
                </TableRow>
              ))}
              <ScrollShadowLeft />
              <ScrollShadowRight />
            </TableContainer>
            <AddRowContainer>
              <AddRowButton onClick={addRow}><Plus className="mr-2 w-4 h-4" /> Add Row</AddRowButton>
              <NumberInputContainer>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <NumberButton
                    type="button"
                    onMouseDown={() => startHolding("decrement", "rowCount")}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                    onClick={() => handleDecrement("rowCount")}
                  >
                    <ChevronDown className="w-3 h-3 text-zinc-800" />
                  </NumberButton>
                  <NumberInput
                    type="number"
                    value={newRowCount}
                    onChange={handleRowCountChange}
                    min={1}
                  />
                  <NumberButton
                    type="button"
                    onMouseDown={() => startHolding("increment", "rowCount")}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                    onClick={() => handleIncrement("rowCount")}
                  >
                    <ChevronUp className="w-3 h-3 text-zinc-800" />
                  </NumberButton>
                </div>
                <span style={{ fontSize: "0.75rem", color: "rgb(59,59,59)" }}>rows</span>
              </NumberInputContainer>
              <AddRowButton onClick={() => addMultipleRows(newRowCount)}>
                <Plus className="mr-2 w-4 h-4" /> Add Multiple Rows
              </AddRowButton>
            </AddRowContainer>
            <OptionsContainer>
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
                      <NumberButton
                        type="button"
                        onMouseDown={() => startHolding("decrement", "limit")}
                        onMouseUp={stopHolding}
                        onMouseLeave={stopHolding}
                        onClick={() => handleDecrement("limit")}
                      >
                        <ChevronDown className="w-3 h-3 text-zinc-800" />
                      </NumberButton>
                      <NumberInput type="number" value={limit} onChange={handleLimitChange} min={1} />
                      <NumberButton
                        type="button"
                        onMouseDown={() => startHolding("increment", "limit")}
                        onMouseUp={stopHolding}
                        onMouseLeave={stopHolding}
                        onClick={() => handleIncrement("limit")}
                      >
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
                      <NumberButton
                        type="button"
                        onMouseDown={() => startHolding("decrement", "offset")}
                        onMouseUp={stopHolding}
                        onMouseLeave={stopHolding}
                        onClick={() => handleDecrement("offset")}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </NumberButton>
                      <NumberInput type="number" value={offset} onChange={handleOffsetChange} min={0} />
                      <NumberButton
                        type="button"
                        onMouseDown={() => startHolding("increment", "offset")}
                        onMouseUp={stopHolding}
                        onMouseLeave={stopHolding}
                        onClick={() => handleIncrement("offset")}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </NumberButton>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>offset</span>
                  </NumberInputContainer>
                )}
              </LimitOffsetContainer>
            </OptionsContainer>
            <GenerateButton onClick={generateQuery}>
              Generate SPARQL Query <Code className="ml-2 w-4 h-4" />
            </GenerateButton>
            <GeneratedQueryContainer>
              <Label className="text-sm text-zinc-800">Generated Query</Label>
              <GeneratedQueryTextarea readOnly value={generatedQuery} rows={8} />
            </GeneratedQueryContainer>
          </QueryContent>
        )}
      </QueryCard>
    </Container>
  );
}
