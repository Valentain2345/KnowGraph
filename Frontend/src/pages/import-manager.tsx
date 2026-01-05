// src/components/ImportManager.tsx
import styled, { keyframes } from "styled-components";
import { useState, useRef } from "react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
  animation: ${fadeIn} 0.5s ease-out;
  color: #1f2937; /* Darker gray for text to ensure contrast */
`;

const Title = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(90deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.85); /* Light background */
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid rgba(200, 200, 200, 0.2); /* Soft light border */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); /* Light shadow */
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #2d3748; /* Darker text for better readability */
`;

const Subtitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #4a5568; /* Soft gray text */
  margin-bottom: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.label<{ $dragOver?: boolean; $disabled?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2.5rem 1.5rem;
  border-radius: 16px;
  border: 2px dashed ${({ $dragOver }) => ($dragOver ? "#60a5fa" : "#cbd5e1")}; /* Soft blue for hover */
  background: ${({ $dragOver }) => ($dragOver ? "rgba(96, 165, 250, 0.1)" : "rgba(248, 250, 252, 0.9)")}; /* Lighter background */
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  &:hover {
    border-color: #60a5fa;
    background: rgba(96, 165, 250, 0.1);
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(96, 165, 250, 0.15); /* Soft glow on hover */
  }

  input {
    display: none;
  }

  ${({ $disabled }) =>
    $disabled &&
    `
    pointer-events: none;
    &:hover {
      transform: none;
      box-shadow: none;
    }
  `}
`;

const Emoji = styled.div`
  font-size: 3.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)); /* Lighter shadow */
`;

const CardTitle = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: #1f2937; /* Darker text for visibility */
`;

const CardNote = styled.small`
  color: #6b7280; /* Soft gray */
  font-size: 0.875rem;
`;

const SelectedFilesContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FileRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(245, 245, 245, 0.8); /* Light gray background */
  border-radius: 12px;
  border: 1px solid rgba(200, 200, 200, 0.2);
`;

const FileName = styled.span`
  color: #1f2937;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FormatSelect = styled.select`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1; /* Light gray border */
  background: #f9fafb; /* Soft light background */
  color: #1f2937; /* Darker text */
  font-size: 0.9rem;
`;

const RemoveButton = styled.button`
  background: #ef4444; /* Red background */
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #dc2626; /* Darker red on hover */
  }
`;

const SubmitButton = styled.button`
  margin-top: 2rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #60a5fa, #a78bfa); /* Light gradient */
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(96, 165, 250, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3); /* Light dark overlay */
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #f9fafb; /* Light background */
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); /* Soft shadow */
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f9fafb;
  color: #1f2937;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const GeneratorButton= styled.button`
  margin-top: 2rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  color: white;
   font-weight: 600;
  font-size: 1.1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(96, 165, 250, 0.3);
  }
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(ModalButton)`
  background: #d1d5db; /* Light gray background */
  color: #1f2937;

  &:hover:not(:disabled) {
    background: #9ca3af; /* Slightly darker gray on hover */
  }
`;

const ConfirmButton = styled(ModalButton)`
  background: #3b82f6; /* Blue background */
  color: white;

  &:hover:not(:disabled) {
    background: #2563eb; /* Darker blue on hover */
  }
`;
// Types
interface SelectedFile {
  file?: File;
  url?: string;
  detectedFormat: string;
  selectedFormat: string;
}

interface ImportManagerProps {
     setMessage: React.Dispatch<
    React.SetStateAction<{ text: string; type: "info" | "success" | "error" }>
  >
}

export const ImportManager = ({setMessage}:ImportManagerProps) => {
  // Structured Data
  const [structuredFiles, setStructuredFiles] = useState<SelectedFile[]>([]);
  const [showSQLDbModal, setShowSQLDbModal] = useState(false);
  const [showMongoDbModal, setShowMongoDbModal] = useState(false);
  const [sqlDbUrl, setSqlDbUrl] = useState("");
  const [mongoDbUrl, setMongoDbUrl] = useState("");
  const structuredFileInputRef = useRef<HTMLInputElement>(null);

  // Unstructured Data
  const [unstructuredFiles, setUnstructuredFiles] = useState<SelectedFile[]>([]);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [webUrl, setWebUrl] = useState("");

  // Upload states
  const [uploadingStructured, setUploadingStructured] = useState(false);

  // Auto-detect format from file extension
  const detectFormat = (file: File): string => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "csv":
        return "CSV";
      case "xlsx":
      case "xls":
        return "Excel";
       case 'jsonl':
      case 'ndjson':
      case 'jl':
      case "json":
        return "JSON";
      case "xml":
        return "XML";
      case "pdf":
        return "PDF";
      case "txt":
        return "Text";
      case "docx":
        return "Word";
      case "html":
        return "Html";
      default:
        return "Unknown";
    }
  };
const handleGenerateGraph = async () => {
  const response = await fetch("http://localhost:5001/dataframes");

  if (!response.ok) {
    setMessage({ text: "Error generating graph", type: "error" });
    return;
  }

  const res = await fetch("http://localhost:5001/rdf/download");

  if (!res.ok) {
    setMessage({ text: "An error occurred generating graph", type: "error" });
    return;
  }

  // Read file
  const blob = await res.blob();

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // Optional: set filename if server does not send Content-Disposition
  a.download = "generatedGraph.ttl";

  document.body.appendChild(a);
  a.click();

  // Cleanup
  a.remove();
  window.URL.revokeObjectURL(url);

  setMessage({ text: "Graph generated correctly", type: "success" });
};


  // Handle file selection (Structured)
  const handleStructuredFileSelect = (e: React.ChangeEvent<HTMLInputElement>, format: string) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles: SelectedFile[] = files.map((file) => ({
        file,
        detectedFormat: detectFormat(file),
        selectedFormat: format,
      }));
      setStructuredFiles((prev) => [...prev, ...newFiles]);
      e.target.value = "";
    }
  };



  const openFilePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.click();
  };

  const removeFile = (section: "structured" | "unstructured", index: number) => {
    if (section === "structured") {
      setStructuredFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Update selected format
  const updateFormat = (section: "structured" | "unstructured", index: number, format: string) => {
    if (section === "structured") {
      setStructuredFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, selectedFormat: format } : f))
      );
    }
  };

  // Submit to server
  const submitSection = async (section: "structured" | "unstructured") => {
    const files = section === "structured" ? structuredFiles : unstructuredFiles;
    if (files.length === 0) return;

    const setUploading = setUploadingStructured ;
    setUploading(true);

    const formData = new FormData();
    files.forEach((item, i) => {
      if (item.file) {
        formData.append("files", item.file);
        formData.append(`formats[${i}]`, item.selectedFormat);
      } else if (item.url) {
        formData.append("urls", item.url);
        formData.append(`formats[${i}]`, item.selectedFormat);
      }
    });

    try {
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage({
            text: `${section === "structured" ? "Structured" : "Unstructured"} data uploaded successfully!`,
            type: "success",
          });
      } else {
        setMessage({ text: "Error uploading files", type: "error" })
      }
    } catch (error:any) {
      setMessage({ text: `Upload error: ${error.message}`, type: "error" })
    } finally {
      setUploading(false);
    }
  };


  return (
    <Container>
      <Title>Import Data Source</Title>

      {/* === STRUCTURED DATA === */}
      <Section>
        <SectionTitle>Structured Data</SectionTitle>
        <Subtitle>Upload files in common formats</Subtitle>
        <Grid>
          <Card onClick={() => openFilePicker(structuredFileInputRef)}>
            <input
              ref={structuredFileInputRef}
              type="file"
              onChange={(e) => handleStructuredFileSelect(e, "CSV")}
            />
            <Emoji>CSV</Emoji>
            <CardTitle>CSV File</CardTitle>
              <CardNote>Also accepts TSV and SSV</CardNote>
          </Card>

          <Card onClick={() => openFilePicker(structuredFileInputRef)}>
            <input
              ref={structuredFileInputRef}
              type="file"
              onChange={(e) => handleStructuredFileSelect(e, "Excel")}
            />
            <Emoji>Excel</Emoji>
            <CardTitle>Excel Spreadsheet</CardTitle>
          </Card>

          <Card onClick={() => openFilePicker(structuredFileInputRef)}>
            <input
              ref={structuredFileInputRef}
              type="file"
              onChange={(e) => handleStructuredFileSelect(e, "JSON")}
            />
            <Emoji>JSON</Emoji>
            <CardTitle>JSON Data</CardTitle>
            <CardNote>Also accepts json line</CardNote>
          </Card>

          <Card onClick={() => openFilePicker(structuredFileInputRef)}>
            <input
              ref={structuredFileInputRef}
              type="file"
              onChange={(e) => handleStructuredFileSelect(e, "XML")}
            />
            <Emoji>XML</Emoji>
            <CardTitle>XML File</CardTitle>
          </Card>

        </Grid>

        {/* Selected Files */}
        {structuredFiles.length > 0 && (
          <SelectedFilesContainer>
            {structuredFiles.map((item, index) => (
              <FileRow key={index}>
                <FileName>{item.file?.name || item.url}</FileName>
                <FormatSelect
                  value={item.detectedFormat}
                  onChange={(e) => updateFormat("structured", index, e.target.value)}
                >
                  <option value="CSV">CSV</option>
                  <option value="JSON">JSON</option>
                  <option value="Excel">Excel</option>
                  <option value="XML">XML</option>

                </FormatSelect>
                <RemoveButton onClick={() => removeFile("structured", index)}>×</RemoveButton>
              </FileRow>
            ))}
          </SelectedFilesContainer>
        )}

        <SubmitButton
          onClick={() => submitSection("structured")}
          disabled={structuredFiles.length === 0 || uploadingStructured}
        >
          {uploadingStructured ? "Uploading Structured Data..." : "Submit Structured Data"}
        </SubmitButton>
      </Section>



      {/* === DATABASE URL MODAL === */}
      {showSQLDbModal && (
        <ModalOverlay onClick={() => setShowSQLDbModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Enter SQL Database URL</ModalTitle>
            <ModalInput
              type="url"
              placeholder="jdbc:mysql://localhost:3306/mydb"
              value={sqlDbUrl}
              onChange={(e) => setSqlDbUrl(e.target.value)}
            />
            <ModalButtons>
              <CancelButton onClick={() => setShowSQLDbModal(false)}>Cancel</CancelButton>
              <ConfirmButton
                onClick={() => {
                  if (sqlDbUrl.trim()) {
                    setStructuredFiles((prev) => [
                      ...prev,
                      {
                        url: sqlDbUrl.trim(),
                        detectedFormat: "SQL",
                        selectedFormat: "SQL",
                      },
                    ]);
                    setSqlDbUrl("");
                    setShowSQLDbModal(false);
                  }
                }}
              >
                Add
              </ConfirmButton>
            </ModalButtons>
          </Modal>
        </ModalOverlay>
      )}


       {showMongoDbModal && (
        <ModalOverlay onClick={() => setShowMongoDbModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Enter Mongo Database URL</ModalTitle>
            <ModalInput
              type="url"
              placeholder="mongodb://localhost:27017/mydb"
              value={mongoDbUrl}
              onChange={(e) => setMongoDbUrl(e.target.value)}
            />
            <ModalButtons>
              <CancelButton onClick={() => setShowMongoDbModal(false)}>Cancel</CancelButton>
              <ConfirmButton
                onClick={() => {
                  if (mongoDbUrl.trim()) {
                    setUnstructuredFiles((prev) => [
                      ...prev,
                      {
                        url: mongoDbUrl.trim(),
                        detectedFormat: "Mongo",
                        selectedFormat: "Mongo",
                      },
                    ]);
                    setMongoDbUrl("");
                    setShowMongoDbModal(false);
                  }
                }}
              >
                Add
              </ConfirmButton>
            </ModalButtons>
          </Modal>
        </ModalOverlay>
      )}




      {/* === WEB URL MODAL === */}
      {showUrlModal && (
        <ModalOverlay onClick={() => setShowUrlModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Enter Web URL</ModalTitle>
            <ModalInput
              type="url"
              placeholder="https://example.com/article"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
            />
            <ModalButtons>
              <CancelButton onClick={() => setShowUrlModal(false)}>Cancel</CancelButton>
              <ConfirmButton
                onClick={() => {
                  if (webUrl.trim()) {
                    setUnstructuredFiles((prev) => [
                      ...prev,
                      {
                        url: webUrl.trim(),
                        detectedFormat: "URL",
                        selectedFormat: "URL",
                      },
                    ]);
                    setWebUrl("");
                    setShowUrlModal(false);
                  }
                }}
              >
                Add
              </ConfirmButton>
            </ModalButtons>
          </Modal>
        </ModalOverlay>


      )}
      <GeneratorButton onClick={()=>handleGenerateGraph()}>Generate Graph</GeneratorButton>
    </Container>
  );
};

export default ImportManager;
