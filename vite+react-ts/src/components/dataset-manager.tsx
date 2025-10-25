import { useState } from "react";
import styled from "styled-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sparkles, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Dataset {
  id: string;
  type: "default" | "named";
  uri: string;
}

interface DatasetManagerProps {
  datasets: Dataset[];
  setDatasets: React.Dispatch<React.SetStateAction<Dataset[]>>;
}

// Styled components
const DatasetCard = styled(Card)`
  background: rgba(24, 24, 27, 0.5);
  border: 1px solid #3f3f46;
`;

const DatasetHeader = styled(CardHeader)`
  padding-bottom: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DatasetContent = styled(CardContent)`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TableContainer = styled.div`
  position: relative;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #3f3f46 #18181b;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #3f3f46;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: #18181b;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 3fr 8fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(39, 39, 42, 0.5);
  border: 1px solid #3f3f46;
  border-radius: 0.5rem;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 8fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(39, 39, 42, 0.3);
  border: 1px solid rgba(63, 63, 70, 0.5);
  border-radius: 0.5rem;
`;

const ScrollShadowLeft = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 1rem;
  background: linear-gradient(to right, rgba(24, 24, 27, 0.5), transparent);
  pointer-events: none;
`;

const ScrollShadowRight = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 1rem;
  background: linear-gradient(to left, rgba(24, 24, 27, 0.5), transparent);
  pointer-events: none;
`;

const AddButton = styled(Button)`
  width: 100%;
  border: 1px solid #3f3f46;
  color: #d4d4d8;
  background: transparent;
  height: 2.25rem;

  &:hover {
    background: #27272a;
  }
`;

export function DatasetManager({ datasets, setDatasets }: DatasetManagerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addDataset = () => {
    setDatasets([
      ...datasets,
      {
        id: Date.now().toString(),
        type: "default",
        uri: "",
      },
    ]);
  };

  const updateDataset = (id: string, field: keyof Dataset, value: string) => {
    setDatasets(datasets.map((dataset) => (dataset.id === id ? { ...dataset, [field]: value } : dataset)));
  };

  const deleteDataset = (id: string) => {
    setDatasets(datasets.filter((dataset) => dataset.id !== id));
  };

  return (
    <DatasetCard>
      <DatasetHeader>
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Dataset Management
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Specify default and named graphs for your SPARQL query
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-zinc-400 hover:text-white"
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </DatasetHeader>
      {!isCollapsed && (
        <DatasetContent>
          <TableContainer>
            <TableHeader>
              <Label className="text-sm text-zinc-300 font-medium">Graph Type</Label>
              <Label className="text-sm text-zinc-300 font-medium">Graph URI</Label>
              <Label className="text-sm text-zinc-300 font-medium text-center">Actions</Label>
            </TableHeader>
            <div style={{ maxHeight: "12rem", overflowY: "auto", paddingRight: "0.5rem" }}>
              {datasets.map((dataset) => (
                <TableRow key={dataset.id}>
                  <Select
                    value={dataset.type}
                    onValueChange={(value) => updateDataset(dataset.id, "type", value)}
                  >
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white text-sm h-8">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="default">Default Graph</SelectItem>
                      <SelectItem value="named">Named Graph</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="e.g., http://example.com/graph"
                    value={dataset.uri}
                    onChange={(e) => updateDataset(dataset.id, "uri", e.target.value)}
                    className="bg-zinc-900/50 border-zinc-700 text-white text-sm h-8"
                  />
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDataset(dataset.id)}
                      className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableRow>
              ))}
            </div>
            <ScrollShadowLeft />
            <ScrollShadowRight />
          </TableContainer>
          <AddButton onClick={addDataset}>
            <Plus className="mr-2 w-4 h-4" /> Add Dataset
          </AddButton>
        </DatasetContent>
      )}
    </DatasetCard>
  );
}
