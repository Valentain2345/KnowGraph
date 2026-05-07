import React from "react";
import styled from "styled-components";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface GeneratedQueryDisplayProps {
  query: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
`;

const QueryTextarea = styled(Textarea)`
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

export const GeneratedQueryDisplay: React.FC<GeneratedQueryDisplayProps> = ({ query }) => {
  return (
    <Container>
      <Label className="text-sm text-zinc-800">Generated Query</Label>
      <QueryTextarea readOnly value={query} rows={8} />
    </Container>
  );
};
