package org.logicaGrafo;

import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.apache.jena.riot.RDFLanguages;
import org.apache.jena.riot.RDFWriterRegistry;
import org.logicaGrafo.query.SparqlQueryExecutor;
import org.logicaGrafo.query.SparqlQueryExecutorFactory;

/**
 * Service layer to handle graph-related operations.
 */
public class GraphService {
	
	private GraphLoader graphLoader;
	
	

	public GraphService() {
		graphLoader=new GraphLoader();
	}

	public Dataset getGraphDataset() {
		return graphLoader.getDataset();
	}
	
	public SparqlQueryResult loadGraphFromFile(String filePath) {
		return graphLoader.loadFromFile(filePath);
	}

	// Load from URL or remote file (HTTP etc.)
	public SparqlQueryResult loadGraphFromURL(String url) {
		return graphLoader.loadFromURL(url);
	}

	// A version when you already know the format (Lang) – e.g. unusual extension
	public SparqlQueryResult loadGraphWithFormat(String filePath, Lang format) {
	  return graphLoader.loadWithFormat(filePath, format);
	}

	// Optionally: a method to read additional triple files into the existing loadedDataset / default graph
	public SparqlQueryResult addManyGraphs(String source) {
	    return graphLoader.mergeFromSource(source);
	}

	public SparqlQueryResult executeQuery(String queryStr) {
		try {
			Query query = QueryFactory.create(queryStr);
			SparqlQueryExecutor executor = SparqlQueryExecutorFactory.getExecutor(query);
			return executor.execute(query, getGraphDataset());
		} catch (Exception e) {
			return SparqlQueryResult.forBottomMsg("Error executing query: " + e.getMessage());
		}
	}

	public void exportGraphToAnotherFormat(String format, String filePath) {
		Model model= getUnionModel();
	    // Determine a RIOT Lang or RDFFormat from the “format” string.
	    Lang lang = RDFLanguages.nameToLang(format);
	    if (lang == null) {
	        System.err.printf("Unknown RDF serialization format: '%s'%n", format);
	        return;
	    }
	    RDFFormat rdfFormat = RDFWriterRegistry.defaultSerialization(lang);
	    if (rdfFormat == null) {
	        // fallback (e.g. just use the Lang default write)
	        System.err.printf("No RDFFormat registered for Lang '%s'. Using Lang-based write fallback.%n", lang);
	    }
	                          
	    try (FileOutputStream out = new FileOutputStream(filePath)) {
	    	  if (rdfFormat != null) {
	              RDFDataMgr.write(out, model, rdfFormat);
	          } else {
	              // fallback: write using Lang (will use default serialization for that Lang)
	              RDFDataMgr.write(out, model, lang);
	          }
	    } catch (Exception e) {
	        System.err.println("Error exporting model as " + format + ": " + e.getMessage());
	        e.printStackTrace();
	    }
	}

	
	/**
	 * Returns a list of all RDF classes (URIs) present in the current model.
	 */
	public List<String> getRdfClasses() {
		List<String> classes = new ArrayList<>();
		
		String queryStr = "SELECT DISTINCT ?class WHERE { ?s a ?class. }";
		try {
			Query query = QueryFactory.create(queryStr);
			QueryExecution qexec = QueryExecutionFactory.create(query,getGraphDataset());
			org.apache.jena.query.ResultSet results = qexec.execSelect();
			while (results.hasNext()) {
				org.apache.jena.query.QuerySolution sol = results.next();
				if (sol.contains("class")) {
					classes.add(sol.getResource("class").getURI());
				}
			}
			qexec.close();
			
		} catch (Exception e) {
			System.err.println("Error retrieving RDF classes: " + e.getMessage());
		}
		return classes;
	}

	
	public SparqlQueryResult executeSPARQLquery(String consulta) {
		if (getGraphDataset().isEmpty()) {
			return SparqlQueryResult.forBottomMsg("El loadedDataset está vacío. No se puede ejecutar la consulta.");
		}

		try {
			Query query = QueryFactory.create(consulta);
			try (QueryExecution qExec = QueryExecutionFactory.create(query, getGraphDataset())) {
				if (query.isSelectType()) {
					ResultSet rs = qExec.execSelect();
					List<String> variables = new ArrayList<>(rs.getResultVars());
					List<Map<String, String>> rows = new ArrayList<>();
					while (rs.hasNext()) {
						QuerySolution qs = rs.next();
						Map<String, String> row = new HashMap<>();
						for (String selecteVariables : variables) {
							RDFNode node = qs.get(selecteVariables);
							row.put(selecteVariables, node != null ? node.toString() : "");
						}
						rows.add(row);
					}
					return SparqlQueryResult.forSelect(variables, rows);
				} else if (query.isConstructType()) {
					Model constructedModel = qExec.execConstruct();
					return SparqlQueryResult.forConstruct(constructedModel);
				} else if (query.isDescribeType()) {
					Model describedModel = qExec.execDescribe();
					return SparqlQueryResult.forDescribe(describedModel);
				} else if (query.isAskType()) {
					boolean askResult = qExec.execAsk();
					return SparqlQueryResult.forAsk(askResult);
				} else {
					return SparqlQueryResult.forBottomMsg("Tipo de consulta no soportado: " + query.queryType());
				}
			}
		} catch (Exception e) {
			return SparqlQueryResult.forBottomMsg("Error al ejecutar la consulta SPARQL: " + e.getMessage());
		}
	}

	public SparqlQueryResult listGraphs() {
	    
	    List<String> names = listGraphNames();
	    if (names.isEmpty()) {
	        return SparqlQueryResult.forBottomMsg("No hay graphs nombrados en este loadedDataset.");
	    }
	    // Build a message or maybe data structure
	    String msg = "Named graphs:\n" + String.join("\n", names);
	    return SparqlQueryResult.forBottomMsg(msg);
	}



    /** 
     * Get the default model (graph) in the loadedDataset.
     */
    public Model getDefaultModel() {
        
        return getGraphDataset().getDefaultModel();
    }

    /**
     * Get a named model by graph URI.
     * Returns null or throws if not present (depends on your design).
     */
    public Model getNamedModel(String graphUri) {
        
        if (getGraphDataset().containsNamedModel(graphUri)) {
            return getGraphDataset().getNamedModel(graphUri);
        } else {
            return null;  // Or throw an exception, or return an Optional<Model>
        }
    }

    public Model getUnionModel() {
    	return getGraphDataset().getUnionModel();
    }
    /**
     * List the URIs of all named graphs in the loadedDataset.
     */
    public List<String> listGraphNames() {
        
        List<String> names = new ArrayList<>();
        Iterator<String> it = getGraphDataset().listNames();
        while (it.hasNext()) {
            names.add(it.next());
        }
        return names;
    }

    /**
     * Get all named models as a map of URI → Model.
     */
    public Map<String, Model> getAllNamedModels() {
        java.util.Map<String, Model> map = new java.util.HashMap<>();
        for (String uri : listGraphNames()) {
            Model m = getGraphDataset().getNamedModel(uri);
            if (m != null) {
                map.put(uri, m);
            }
        }
        return map;
    }
	
	
	
	
	
	
	
	
	
	
	
}