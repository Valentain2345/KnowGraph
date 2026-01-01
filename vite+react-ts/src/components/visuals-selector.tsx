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

  const handleRun = () => {
    if (selectedVariables.length === 0) {
      alert("Please select at least one variable");
      return;
    }

    // If all variables are selected, trigger the upload function
    if (selectedVariables.length === variables.length) {
      onRun([], dims, method, true); // Passing true to indicate upload
    } else {
      onRun(selectedVariables, dims, method, false); // Parsing CSV
    }

    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 h-screen">
      <div className="relative w-full max-w-2xl animate-in fade-in zoom-in duration-300">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 shadow-2xl backdrop-blur-xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/50">
                  <span className="text-white font-bold">DR</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Select Variables for {method}
                  </h2>
                  <p className="text-sm text-white/60">Step 1 of 1</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="default"
                onClick={onCancel}
                className="h-10 w-10 rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Dimension Selection */}
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold text-purple-400">
                Dimensions
              </Label>
              <select
                value={dims}
                onChange={(e) => setDims(Number(e.target.value))}
                className="rounded-lg bg-white/10 text-white px-3 py-2 border border-white/20"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>

            {/* Variable Selection */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-lg font-semibold text-emerald-400">
                  Variables
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="text-white/60 hover:text-white"
                >
                  {selectedVariables.length === variables.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <ScrollArea className="h-[300px] rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="space-y-3">
                  {variables.map((variable) => (
                    <div
                      key={variable}
                      className="flex items-center space-x-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                    >
                      <Checkbox
                        id={variable}
                        checked={selectedVariables.includes(variable)}
                        onCheckedChange={() => toggleVariable(variable)}
                        className="border-emerald-400/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <Label
                        htmlFor={variable}
                        className="flex-1 cursor-pointer text-base font-medium text-white"
                      >
                        {variable}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Button
                onClick={handleRun}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-6 text-lg font-bold text-white shadow-lg shadow-violet-500/50 transition-all hover:shadow-xl hover:shadow-violet-500/60 hover:scale-[1.02]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Run {method}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
