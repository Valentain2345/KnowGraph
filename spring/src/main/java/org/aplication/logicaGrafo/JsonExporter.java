package org.logicaGrafo;

import java.io.FileWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.StmtIterator;
import org.json.JSONArray;
import org.json.JSONObject;

import javafx.util.Pair;

/** Exports a Model (filtered or full) to Cytoscape.js JSON. */
public class JsonExporter implements GraphExporter {
    private final NodeSelector nodeSelector;
    private final EdgeSelector edgeSelector;
    private final IdGenerator idGen;
    private final Map<Pair<String, String>, List<String>> edgeConnections;

    public JsonExporter(NodeSelector nodeSelector, EdgeSelector edgeSelector,Map<Pair<String, String>, List<String>> connections ) {
        this.nodeSelector = nodeSelector;
        this.edgeSelector = edgeSelector;
        this.idGen = new IdGenerator();
        this.edgeConnections=connections;
    }

    @Override
    public void exportModel(Model model, String filePath) throws Exception {
        Model filtered = GraphModelFilter.filter(model, nodeSelector, edgeSelector);
        writeJsonFromModel(filtered, filePath);
    }

    private void writeJsonFromModel(Model model, String filePath) throws Exception {
        JSONObject container = new JSONObject();
        JSONArray elements = new JSONArray();

        // Keep track of which node IDs already output
        Set<String> emittedNodeIds = new HashSet<>();

        AtomicInteger edgeCounter = new AtomicInteger(0);

        StmtIterator sit = model.listStatements();
        while (sit.hasNext()) {
            Statement st = sit.next();
            Resource subj = st.getSubject();
            RDFNode obj = st.getObject();

            String subjId = idGen.nodeId(subj);
            if (!emittedNodeIds.contains(subjId)) {
                JSONObject node = buildNodeJSONObject(subjId, nodeSelector.label(subj));
                elements.put(node);
                emittedNodeIds.add(subjId);
            }

            if (obj.isResource()) {
                Resource objRes = obj.asResource();
                String objId = idGen.nodeId(objRes);
                if (!emittedNodeIds.contains(objId)) {
                    JSONObject node = buildNodeJSONObject(objId, nodeSelector.label(objRes));
                    elements.put(node);
                    emittedNodeIds.add(objId);
                }
                if (edgeSelector.include(st)) {
                    String edgeId = "e" + edgeCounter.incrementAndGet();
                    JSONObject edge = buildEdgeJSONObject(edgeId, subjId, objId, edgeSelector.label(st));
                    elements.put(edge);
                }
            }
        }

        container.put("elements", elements);
        try (Writer w = new FileWriter(filePath)) {
            w.write(container.toString(2));
        }
    }

    private JSONObject buildNodeJSONObject(String id, String label) {
        JSONObject o = new JSONObject();
        o.put("data", new JSONObject().put("id", id).put("label", label));
        return o;
    }

    private JSONObject buildEdgeJSONObject(String id, String source, String target, String label) {
        JSONObject e = new JSONObject();
        e.put("data", new JSONObject()
            .put("id", id)
            .put("source", source)
            .put("target", target)
            .put("label", label));
        return e;
    }
    
    /** Basic ID generator for nodes and edges (e.g. URI vs blank nodes). */
    private class IdGenerator {
        public String nodeId(Resource r) {
            if (r.isURIResource()) {
                return r.getURI();
            } else if (r.isAnon()) {
                return "_:" + r.getId().getLabelString();
            } else {
                return r.toString();  // fallback
            }
        }
    }

    private List<String> getNodeVars(){
    	List<String> nodeVars= new ArrayList<String>();
		Iterator<String> nodeSelectorVars=nodeSelector.getAllowedUris();
		while(nodeSelectorVars.hasNext())
			nodeVars.add(nodeSelectorVars.next());
		
		return nodeVars;
    }
   
    
    private JSONArray generateNodes(List<String> nodeVars, Map<String,String> row,Set<String> nodeIds) {
    	
    	JSONArray nodes=new JSONArray();
    	for (String nodeVar : nodeVars) {
			String nodeId = row.get(nodeVar);
			if (nodeId != null && !nodeIds.contains(nodeId)) {
				JSONObject node = buildNodeJSONObject(nodeId, nodeId);
				nodes.put(node);
				nodeIds.add(nodeId);
			}
		}
    	return nodes;
		
    }
    
    private JSONArray generateEdges(Map<Pair<String, String>, List<String>> edgeConnections2,Map<String,String> row,int edgeCount) {
    	JSONArray edges= new JSONArray();
    	for(Entry<Pair<String,String>,List<String>> con:edgeConnections2.entrySet()) {
    		for(String edgeCon:con.getValue()) {
        		String label=row.get(edgeCon);
        		String source=row.get(con.getKey().getKey());
        		String target=row.get(con.getKey().getValue());
    			if (source != null && target != null && label!=null) {
    				edgeCount++;
    				String edgeId = "e" + edgeCount;
    				JSONObject edge = buildEdgeJSONObject(edgeId, source, target, label);
    				edges.put(edge);
    			}
    		}
    		
    	}

			return edges;			
    }
    
    private void writeFile(String filePath,JSONArray nodes,JSONArray edges) {
    	// Write to file
    			try (FileWriter writer = new FileWriter(filePath)) {
    				JSONObject cytoscapeJson = new JSONObject();
    				JSONArray elements = new JSONArray();
    				for (int i = 0; i < nodes.length(); i++) {
    					elements.put(nodes.get(i));
    				}
    				for (int i = 0; i < edges.length(); i++) {
    					elements.put(edges.get(i));
    				}
    				cytoscapeJson.put("elements", elements);
    				writer.write(cytoscapeJson.toString(2));
    			} catch (Exception e) {
    				System.err.println("Error exporting Cytoscape JSON from SELECT: " + e.getMessage());
    			}
    }
    @Override
    public void exportRowResults(List<Map<String, String>> rows,String filePath) {
    	Set<String> nodeIds = new HashSet<>();
		JSONArray nodes = new JSONArray();
		JSONArray edges = new JSONArray();
		List<String> nodeVars=getNodeVars();
		
		int edgeCount = 0;
		// Add nodes
		for (Map<String, String> row : rows) {
				nodes=generateNodes(nodeVars, row, nodeIds);
				edges=generateEdges(edgeConnections, row, edgeCount);
    
		}
		
		writeFile(filePath, nodes, edges);
		
		
    }
		
}





