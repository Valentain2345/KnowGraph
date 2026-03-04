import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { MenuBar } from "./components/menu-bar";
import { MessagePanel } from "./components/message-panel";
import { SparqlQueryWizard } from "./pages/sparql-query-wizard";
import { QueryExecutor } from "./pages/query-executor";
import { TripleBuilder } from "./pages/triple-builder";
import { AnimatePresence, motion } from "framer-motion";
import ForceGraph3d from "./pages/graph-3d-view"
import ForceGraph2d from "./pages/graph-2d-view"
import {ImportManager} from "./pages/import-manager"
import Visualization3d from "./pages/reduction-view-3d"
import Visualization2d from "./pages/reduction-view-2d"
import styled from "styled-components";

export function SparqlQueryInterface() {
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState<{ text: string; type: "info" | "success" | "error" }>({
    text: "Ready to execute queries",
    type: "info",
  });
  const [queryResponseRaw,setQueryResponseRaw]=useState<string>("")
  const [variables,setVariables]=useState<string[]>([]);
  const [queryResults,setQueryResults]=useState<Array<Record<string, string>>>([]);
  const navigate = useNavigate();
  const isNonQueryView = location.pathname === "/graph3d" || location.pathname==="/graph2d"||
  location.pathname === "/importer" || location.pathname === "/usage" || location.pathname === "/visuals3d" || location.pathname === "/visuals2d" ;
  return (
  <div className="flex flex-col h-screen bg-white text-zinc-900 relative">
      <MenuBar
        onMenuAction={(action: string) => setMessage({ text: `Menu action: ${action}`, type: "info" })}
        zIndex={1000}
        setQuery={setQuery}
        variables={variables}
        queryResults={queryResults}
        queryResponseRaw={queryResponseRaw}
      />
         {!isNonQueryView && (
        <StyledNavbar>
          <div className="wrap">
            <NavButton
              label="Query Executor"
              onClick={() => navigate("/executor")}
              $active={location.pathname === "/executor"}
            />
            <NavButton
              label="Query Wizard"
              onClick={() => navigate("/wizard")}
              $active={location.pathname === "/wizard"}
            />
            <NavButton
              label="Triple Builder"
              onClick={() => navigate("/builder")}
              $active={location.pathname === "/builder"}
            />
          </div>
        </StyledNavbar>
      )}

      <div className="flex-1 overflow-auto relative z-10">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <PageTransition>
              <QueryExecutor
                setMessage={setMessage}
                query={query}
                setQuery={setQuery}
                variables={variables}
                setVariables={setVariables}
                queryResults={queryResults}
                setQueryResults={setQueryResults}
                setQueryResponseRaw={setQueryResponseRaw}
              />
              </PageTransition>} />
            <Route path="/executor" element={<PageTransition>
              <QueryExecutor
                setMessage={setMessage}
                query={query}
                setQuery={setQuery}
                variables={variables}
                setVariables={setVariables}
                queryResults={queryResults}
                setQueryResults={setQueryResults}
                setQueryResponseRaw={setQueryResponseRaw}
              />
              </PageTransition>} />
            <Route path="/wizard" element={<PageTransition>
              <SparqlQueryWizard setQuery={setQuery} setMessage={setMessage}/>
              </PageTransition>} />
            <Route path="/builder" element={<PageTransition><TripleBuilder setQuery={setQuery} setMessage={setMessage} /></PageTransition>} />
            <Route path="/graph3d" element={<PageTransition><ForceGraph3d/></PageTransition>} />
            <Route path="/graph2d" element={<PageTransition><ForceGraph2d/></PageTransition>} />
            <Route path="/visuals3d" element={<PageTransition><Visualization3d /></PageTransition>} />
            <Route path="/visuals2d" element={<PageTransition><Visualization2d/></PageTransition>} />
            <Route path="/importer" element={<PageTransition><ImportManager setMessage={setMessage}/></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </div>
      <MessagePanel
        message={message.text}
        type={message.type}
        onClear={() => setMessage({ text: "Ready to execute queries", type: "info" })}
        zIndex={1000}
      />
    </div>
  );
}

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
    style={{ position: "relative", zIndex: 1 }}
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(6px)",
        zIndex: -1,
      }}
    />
    {children}
  </motion.div>
);

const NavButton = ({ label, onClick, $active }: { label: string; onClick: () => void; $active: boolean }) => (
  <StyledButton onClick={onClick} $active={$active}>
    {label}
  </StyledButton>
);

const StyledNavbar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  color: #27272a;
  padding: 12px 0;
  z-index: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;


const StyledButton = styled.button<{ $active: boolean }>`
  background-color: ${({ $active }) =>
    $active ? "#3b82f6" : "#e5e7eb"}; /* blue / light gray */
  color: ${({ $active }) => ($active ? "#ffffff" : "#111827")};
  border: 1px solid
    ${({ $active }) => ($active ? "#3b82f6" : "#d1d5db")};
  padding: 10px 22px;
  margin: 0 10px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: ${({ $active }) =>
      $active ? "#2563eb" : "#f3f4f6"};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
  }
`;


export default SparqlQueryInterface;
