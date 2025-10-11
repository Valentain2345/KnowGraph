package org.logicaGrafo;

import java.util.List;
import java.util.Map;

import org.apache.jena.rdf.model.Model;



/** Main interface for graph‑to‑format exporting (models, query result rows, etc.). */
public interface GraphExporter {
    void exportModel(Model model, String filePath) throws Exception;
    void exportRowResults(List<Map<String, String>> rows,String filePath);
}



