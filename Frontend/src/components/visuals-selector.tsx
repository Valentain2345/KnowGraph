import React, { useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { X, ArrowRight } from "lucide-react";

type DimReductionProps = {
  variables: string[];
  method: "umap" | "tsne" | "pca";
  onCancel: () => void;
  onRun: (selectedVariables: string[], dims: number, method: "umap" | "tsne" | "pca",isUpload:boolean) => Promise<void>;
};

export const DimReductionSelector: React.FC<DimReductionProps> = ({
  variables,
  method,
  onCancel,
  onRun,
}) => {
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [dims, setDims] = useState<number>(2); // Default to 2D
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const toggleVariable = (variable: string) => {
    setSelectedVariables((prev) =>
      prev.includes(variable)
        ? prev.filter((v) => v !== variable)
        : [...prev, variable]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVariables.length === variables.length) {
      setSelectedVariables([]);
    } else {
      setSelectedVariables([...variables]);
    }
  };

const handleRun = async () => {
  if (selectedVariables.length === 0) {
    setError("Please select at least one variable.");
    return;
  }

  if (selectedVariables.length < dims) {
    setError(
      "The number of variables selected should be greater or equal to the dimensions to visualize"
    );
    return;
  }

  setError(null);
  setIsRunning(true);

  try {
    await onRun(selectedVariables, dims, method, false);
    onCancel(); // Close only after success
  } catch (err) {
    setError("Something went wrong while running dimensionality reduction.");
  } finally {
    setIsRunning(false);
  }
};

  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4 h-screen">
  <div className="relative w-full max-w-2xl animate-in fade-in zoom-in duration-300">
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50 shadow-2xl backdrop-blur-xl">
      <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500" />

      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-orange-600 shadow-lg shadow-pink-500/50">
              <span className="text-white font-bold">DR</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Select Variables for {method}
              </h2>
              <p className="text-sm text-gray-600">Step 1 of 1</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="default"
            onClick={onCancel}
            className="h-12 w-12 rounded-full text-gray-600 hover:bg-zinc-300 hover:text-gray-800"
          >
            <X className="h-8 w-8" />
          </Button>
        </div>

        {/* Dimension Selection */}
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold text-orange-400">
            Dimensions
          </Label>
          <select
            value={dims}
            onChange={(e) => setDims(Number(e.target.value))}
            className="rounded-lg bg-gray-100 text-gray-900 px-3 py-2 border border-gray-200"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>

        {/* Variable Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-lg font-semibold text-teal-400">
              Variables
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              className="text-zinc-600 hover:bg-teal-600 hover:text-white"
            >
              {selectedVariables.length === variables.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          <ScrollArea className="h-[300px] rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-3">
              {variables.map((variable) => (
                <div
                  key={variable}
                  className="flex items-center space-x-3 rounded-xl p-2 transition-colors hover:bg-gray-200"
                >
                  <Checkbox
                    id={variable}
                    checked={selectedVariables.includes(variable)}
                    onCheckedChange={() => toggleVariable(variable)}
                    className="border-teal-400/50 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                  />
                  <Label
                    htmlFor={variable}
                    className="flex-1 cursor-pointer text-base font-medium text-gray-900"
                  >
                    {variable}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
          {error && (
            <div className="rounded-xl bg-red-100 border border-red-300 text-red-700 px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}
          <Button
            onClick={handleRun}
             disabled={isRunning}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-pink-600 to-orange-600 py-6 text-lg font-bold text-white shadow-lg shadow-pink-500/50 transition-all hover:shadow-xl hover:shadow-pink-500/60 hover:scale-[1.02]"
          >
             <span className="relative z-10 flex items-center justify-center gap-2">
              {isRunning ? "Uploading..." : `Run ${method}`}
              {!isRunning && (
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};
