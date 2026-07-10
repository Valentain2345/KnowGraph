import { useState, useEffect } from "react";
import styled from "styled-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Code, ChevronDown, ChevronUp } from "lucide-react";
import { PrefixManager } from "../components/prefix-wizard";
import { DatasetManager } from "../components/dataset-manager";
import { QueryTable } from "../components/query-table";
import { AddRowControls } from "../components/add-row-controls";
import { QueryOptions } from "../components/query-options";
import { GeneratedQueryDisplay } from "../components/generated-query-display";

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
  filterLogic: "AND" | "OR";
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

const mockConcepts = ["Person", "Organization", "Document", "Event", "Location"];
const mockProperties = ["hasName", "hasAge", "worksFor", "locatedIn", "createdBy"];
const operators = ["=", "<>", "<", "<=", ">", ">=", "contains", "starts with", "ends with", "in", "not in"];
const functions = ["none", "Average", "Count", "Sum", "Max", "Min", "Group by", "Group Concat"];
const orderOptions = ["none", "ascending", "descending"];
const graphPatternTypes = ["Basic", "Optional", "Union", "Minus"];
const propertyPathOperators = ["none", "/", "^", "|", "*", "+", "?", "!uri", "!^uri"];

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

interface SparqlQueryWizardProps {
  setQuery: (query: string) => void;
  setMessage: (message: { text: string; type: "info" | "success" | "error" }) => void;
}

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
      filterLogic: "AND",
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
  const commonPrefixes = [
  { prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
  { prefix: "rdfs", uri: "http://www.w3.org/2000/01/rdf-schema#" },
  { prefix: "xsd", uri: "http://www.w3.org/2001/XMLSchema#" },
  { prefix: "owl", uri: "http://www.w3.org/2002/07/owl#" },
  { prefix: "foaf", uri: "http://xmlns.com/foaf/0.1/" },
  { prefix: "ex", uri: "http://example.org/" }
]
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [distinct, setDistinct] = useState(false);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLimitEnabled, setIsLimitEnabled] = useState(true);
  const [isOffsetEnabled, setIsOffsetEnabled] = useState(false);
  const [queryDescription, setQueryDescription] = useState("");
  const [newRowCount, setNewRowCount] = useState(1);
  const [isQueryBuilderCollapsed, setIsQueryBuilderCollapsed] = useState(false);

  const [selectResetKey, setSelectResetKey] = useState(0);
  useEffect(() => {
    setSelectResetKey((prev) => prev + 1);
  }, [prefixes, datasets]);

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
      filterLogic: "AND",
      optional: false,
      result: "",
      graphPattern: "Basic",
      propertyPath: "none",
      groupId: "",
      graph: "",
      service: "",
    };
    setRows((prev) => [...prev, newRow]);
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
      filterLogic: "AND",
      optional: false,
      result: "",
      graphPattern: "Basic",
      propertyPath: "none",
      groupId: "",
      graph: "",
      service: "",
    }));
    setRows((prev) => [...prev, ...newRows]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
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

 const formatValue = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed.startsWith("<") && trimmed.endsWith(">")) return trimmed;
    if (trimmed.match(/^\d+$/)) return `"${trimmed}"^^xsd:integer`;
    if (trimmed.match(/^\d+\.\d+$/)) return `"${trimmed}"^^xsd:decimal`;
    if (trimmed === "true" || trimmed === "false") return `"${trimmed}"^^xsd:boolean`;
    if (trimmed.match(/^[a-zA-Z][a-zA-Z0-9_-]*:[a-zA-Z0-9_-]+$/)) return trimmed;
    if (trimmed.startsWith('"') || trimmed.startsWith("'")) return trimmed;
    return `"${trimmed}"`;
  };

  const buildFilterExpression = (row: QueryRow, variable: string) => {
    const { operator, value } = row;
    if (!value.trim()) return "";
    if (operator === "contains") return `regex(str(${variable}), "${value}", "i")`;
    if (operator === "starts with") return `strstarts(str(${variable}), "${value}")`;
    if (operator === "ends with") return `strends(str(${variable}), "${value}")`;
    if (operator === "in" || operator === "not in") {
      const values = value.split(",").map((v) => formatValue(v.trim())).join(", ");
      return `${variable} ${operator.toUpperCase()} (${values})`;
    }
    if (operator === "=" || operator === "<>") return `${variable} ${operator} ${formatValue(value)}`;
    return `${variable} ${operator} ${formatValue(value)}`;
  };


  const invalidRowError = rows.map((row) => {
    if (row.operator && row.operator !== "none" && !row.value.trim()) {
      return `Row ${row.id}: Missing value for the selected operator.`;
    }
    if (row.propertyPath !== "none" && !row.propertyPath.includes("uri") && !row.property.trim()) {
      return `Row ${row.id}: A property path requires a property.`;
    }
    return null;
  }).find(Boolean);
  const hasErrors = !!invalidRowError;


  const generateQuery = () => {
    let query = "";
    const variablesInResult: Set<string> = new Set();
    const triplesInWhere: string[] = [];

    const filterConditions: { condition: string; logic: "AND" | "OR" }[] = [];
    const orderList: string[] = [];
    const groupByList: Set<string> = new Set();
    const havingConditions: { condition: string; logic: "AND" | "OR" }[] = [];

    if (queryDescription) query += `# ${queryDescription}\n\n`;

    prefixes.forEach((prefix) => {
      if (prefix.prefix && prefix.uri) query += `PREFIX ${prefix.prefix}: <${prefix.uri}>\n`;
    });
    if (prefixes.length > 0) query += "\n";

    const defaultGraphs = datasets.filter((d) => d.type === "default");
    const namedGraphs = datasets.filter((d) => d.type === "named");
    defaultGraphs.forEach((graph) => {
      if (graph.uri) query += `FROM <${graph.uri}>\n`;
    });
    namedGraphs.forEach((graph) => {
      if (graph.uri) query += `FROM NAMED <${graph.uri}>\n`;
    });
    if (defaultGraphs.length > 0 || namedGraphs.length > 0) query += "\n";

    rows.forEach((row, rowIndex) => {
      const subjectVar = row.subject.startsWith("?") ? row.subject : row.subject ? `?${row.subject}` : `?s${rowIndex + 1}`;
      const aliasVar = row.alias.startsWith("?") ? row.alias : row.alias ? `?${row.alias}` : `?o${rowIndex + 1}`;

      const cPrefix = row.conceptPrefix && row.conceptPrefix !== "none" ? `${row.conceptPrefix}:` : "";
      const concept = row.concept && row.concept !== "none" ? `${cPrefix}${row.concept}` : "";

      const pPrefix = row.propertyPrefix && row.propertyPrefix !== "none" ? `${row.propertyPrefix}:` : "";
      let property = row.property && row.property !== "none" ? `${pPrefix}${row.property}` : "";

      if (property) {
        if (row.propertyPath === "!uri") property = `!${property}`;
        else if (row.propertyPath === "!^uri") property = `!^${property}`;
        else if (row.propertyPath !== "none") property = `${property}${row.propertyPath}`;
      }

      let triplePatterns: string[] = [];

      if (concept) {
        triplePatterns.push(`${subjectVar} a ${concept} .`);
      }

      if (property && row.alias) {
        triplePatterns.push(`${subjectVar} ${property} ${aliasVar} .`);
      }

      if (triplePatterns.length > 0) {
        let block = triplePatterns.join("\n    ");

        if (row.graphPattern === "Union") {
          block = `{ ${block} } UNION { /* add alternative pattern here */ }`;
        }

        if (row.service && row.service.trim() !== "") {
          block = `SERVICE <${row.service}> {\n      ${block}\n    }`;
        }
        if (row.graph && row.graph !== "none") {
          block = `GRAPH <${row.graph}> {\n      ${block}\n    }`;
        }

        if (row.optional || row.graphPattern === "Optional") {
          block = `OPTIONAL {\n      ${block}\n    }`;
        } else if (row.graphPattern === "Minus") {
          block = `MINUS {\n      ${block}\n    }`;
        }

        triplesInWhere.push(block);
      }

      if (row.visible) {
        if (row.function === "none") {
          if (row.alias) variablesInResult.add(aliasVar);
        } else if (row.function === "Group by") {
          if (row.alias) {
            variablesInResult.add(aliasVar);
            groupByList.add(aliasVar);
          }
        } else {
          const resultVar = row.result ? (row.result.startsWith("?") ? row.result : `?${row.result}`) : `?result${rowIndex + 1}`;
          const funcName = functionTranslated(row.function);
          const aggregateExpr = `(${funcName}(${aliasVar}) AS ${resultVar})`;
          variablesInResult.add(aggregateExpr);

          if (row.operator && row.operator !== "none" && row.value) {
            const havingCondition = buildFilterExpression(row, resultVar);
            if (havingCondition) havingConditions.push({ condition: havingCondition, logic: row.filterLogic });
          }
        }
      }

      if (row.operator && row.operator !== "none" && row.value && row.function === "none") {
        const filterCondition = buildFilterExpression(row, aliasVar);
        if (filterCondition) filterConditions.push({ condition: filterCondition, logic: row.filterLogic });
      }

      if (row.order !== "none" && row.alias) {
        if (row.order === "ascending") orderList.push(aliasVar);
        else if (row.order === "descending") orderList.push(`DESC(${aliasVar})`);
      }
    });

    query += `SELECT${distinct ? " DISTINCT" : ""} `;
    query += variablesInResult.size > 0 ? Array.from(variablesInResult).join(" ") : "*";
    query += "\n";

    if (triplesInWhere.length > 0 || filterConditions.length > 0) {
      query += "WHERE\n{\n";
      triplesInWhere.forEach((triple) => (query += `  ${triple}\n`));

      if (filterConditions.length > 0) {
        let filterStr = filterConditions[0].condition;
        for (let i = 1; i < filterConditions.length; i++) {
          const logicOp = filterConditions[i].logic === "OR" ? "||" : "&&";
          filterStr = `(${filterStr}) ${logicOp} (${filterConditions[i].condition})`;
        }
        query += `  FILTER (${filterStr})\n`;
      }

      query += "}\n";
    }

    if (groupByList.size > 0) query += `GROUP BY ${Array.from(groupByList).join(" ")}\n`;

    if (havingConditions.length > 0) {
      let havingStr = havingConditions[0].condition;
      for (let i = 1; i < havingConditions.length; i++) {
        const logicOp = havingConditions[i].logic === "OR" ? "||" : "&&";
        havingStr = `(${havingStr}) ${logicOp} (${havingConditions[i].condition})`;
      }
      query += `HAVING (${havingStr})\n`;
    }

    if (orderList.length > 0) query += `ORDER BY ${orderList.join(" ")}\n`;
    if (isLimitEnabled && limit > 0) query += `LIMIT ${limit}\n`;
    if (isOffsetEnabled && offset > 0) query += `OFFSET ${offset}\n`;

    const finalQuery = query.trim();
    setGeneratedQuery(finalQuery);
    setQuery(finalQuery);
    setMessage({ text: "Query generated successfully", type: "success" });
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
            <CardDescription className="text-zinc-600">
              Build your SPARQL query using the visual wizard
            </CardDescription>
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
            <div>
              <Label className="text-sm text-zinc-600">Query Description</Label>
              <Input
                placeholder="Enter query description"
                value={queryDescription}
                onChange={(e) => setQueryDescription(e.target.value)}
                className="bg-zinc-200/50 border-zinc-300 text-black text-sm h-8"
              />
            </div>
            <QueryTable
              rows={rows}
              prefixes={prefixes}
              datasets={datasets}
              mockConcepts={mockConcepts}
              mockProperties={mockProperties}
              orderOptions={orderOptions}
              functions={functions}
              operators={operators}
              graphPatternTypes={graphPatternTypes}
              propertyPathOperators={propertyPathOperators}
              onUpdateRow={updateRow}
              onRemoveRow={removeRow}
              selectResetKey={selectResetKey}
            />
            <AddRowControls
              newRowCount={newRowCount}
              onAddSingleRow={addRow}
              onAddMultipleRows={addMultipleRows}
              onRowCountChange={setNewRowCount}
            />
            <QueryOptions
              distinct={distinct}
              setDistinct={setDistinct}
              isLimitEnabled={isLimitEnabled}
              setIsLimitEnabled={setIsLimitEnabled}
              limit={limit}
              setLimit={setLimit}
              isOffsetEnabled={isOffsetEnabled}
              setIsOffsetEnabled={setIsOffsetEnabled}
              offset={offset}
              setOffset={setOffset}
            />
            <GenerateButton
              onClick={generateQuery}
              disabled={hasErrors}
              className={hasErrors ? "opacity-50 cursor-not-allowed" : ""}
            >
              {hasErrors ? "Fix Errors to Generate" : "Generate SPARQL Query"} <Code className="ml-2 w-4 h-4" />
            </GenerateButton>
            {invalidRowError && <p className="text-red-500 text-sm mt-2">{invalidRowError}</p>}
            <GeneratedQueryDisplay query={generatedQuery} />
          </QueryContent>
        )}
      </QueryCard>
    </Container>
  );
}
