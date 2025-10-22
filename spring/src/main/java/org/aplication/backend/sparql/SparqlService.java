
package org.aplication.backend.sparql;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.util.Map;
import java.util.logging.Level;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.apache.jena.riot.RDFLanguages;
import org.apache.jena.riot.RDFWriterRegistry;
import org.aplication.sparqlQueryLogic.SparqlQueryExecutor;
import org.aplication.sparqlQueryLogic.SparqlQueryExecutorFactory;
import org.aplication.sparqlQueryLogic.SparqlQueryResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SparqlService {

	private final static String loggerName="Sparql service";
	private Dataset dataset;
	@Value("${name:World}")
	private String name;

	public String getHelloMessage() {
		return "Hello " + this.name;
	}
	
	
	private boolean successfulExecution(SparqlQueryResult result) {
		return result.getError() == null || result.getError().isEmpty();
	}
	public String runSparqlQuery(String queryString)throws Exception {
		if(this.dataset==null|| dataset.isEmpty()) {
			throw new Exception( "Error: No dataset loaded. Please load a dataset before executing queries.");
		}
		
		SparqlQueryResult result = executeQuery(queryString);
		if(!successfulExecution(result)) {
			java.util.logging.Logger.getLogger(loggerName).info("Hubo un error y es "+result.getError());
			throw new Exception("Error executing query: " + result.getError());
		}
        return result.getResultAsStringObject();
        
	}
	 private SparqlQueryResult executeQuery(String queryStr) {
			try {
				Query query = QueryFactory.create(queryStr);
				SparqlQueryExecutor executor = SparqlQueryExecutorFactory.getExecutor(query);
				
				return executor.execute(query, dataset);
			} catch (Exception e) {
				java.util.logging.Logger.getLogger(loggerName).log(Level.SEVERE, "There was an error in the executing query "+e.getMessage());
				return SparqlQueryResult.forBottomMsg("Error executing query: " + e.getMessage());
			}
		}
	    
	    private Dataset getGraphDatasetMock() {
	        java.util.logging.Logger.getLogger(loggerName).info("Este es un dataset de prueba, después hay que borrarlo");
	        
	        // Create a default model
	        Model mockModel = ModelFactory.createDefaultModel();
	        
	        // Adding sample data (triples) to the model
	        Resource subject = mockModel.createResource("http://example.org/subject");
	        Property predicate = mockModel.createProperty("http://example.org/predicate");
	        Literal object = mockModel.createLiteral("Test object");

	        mockModel.add(subject, predicate, object);
	        mockModel.add(subject, predicate, mockModel.createLiteral("Another object"));
	        mockModel.add(mockModel.createResource("http://example.org/anotherSubject"),
	                      predicate, mockModel.createLiteral("Different object"));
	        
	        // Create a dataset and add the model as the default graph
	        Dataset dataset = DatasetFactory.create();
	        dataset.setDefaultModel(mockModel);
	        
	        return dataset;
	    }
	    
	    public SparqlQueryResult loadFromSource(String source) throws Exception {
	        try {
	            // Create a model to hold the RDF data
	        	  Dataset dataset= DatasetFactory.create();
	              RDFDataMgr.read(dataset,source);
	              this.dataset=dataset;
	            // Handles file paths or URLs
	            return SparqlQueryResult.forBottomMsg("Grafo cargado correctamente desde " + source);
	        } catch (Exception e) {
	        	   java.util.logging.Logger.getLogger(loggerName).log(Level.SEVERE, "There was an error in the loading "+e.getMessage());
	        	 throw new Exception("Error al cargar grafo desde " + source + ": " + e.getMessage());
	        }
	    }
	    
	    public SparqlQueryResult addToDatasetFromSource(String source) throws Exception {
	        try {
	            RDFDataMgr.read(dataset, source);

	            return SparqlQueryResult.forBottomMsg("Grafo añadido correctamente desde " + source);
	        } catch (Exception e) {
	        	   java.util.logging.Logger.getLogger(loggerName).log(Level.SEVERE, "There was an error in the adding to dataset "+e.getMessage());
	        	 throw new Exception("Error al añadir grafo desde " + source + ": " + e.getMessage());
	        }
	    }
	    
	
		public byte[] exportGraphToAnotherFormat(String format) {
			Model model= dataset.getUnionModel();
		    // Determine a RIOT Lang or RDFFormat from the “format” string.
		    Lang lang = RDFLanguages.nameToLang(format);
		    if (lang == null) {
		        System.err.printf("Unknown RDF serialization format: '%s'%n", format);
		        return null;
		    }
		    RDFFormat rdfFormat = RDFWriterRegistry.defaultSerialization(lang);
		    if (rdfFormat == null) {
		        // fallback (e.g. just use the Lang default write)
		        System.err.printf("No RDFFormat registered for Lang '%s'. Using Lang-based write fallback.%n", lang);
		    }
		                          
		    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
	            if (rdfFormat != null) {
	                // Write using the specific RDFFormat
	                RDFDataMgr.write(out, model, rdfFormat);
	            } else {
	                // Fallback: Write using Lang (default serialization for the Lang)
	                RDFDataMgr.write(out, model, lang);
	            }
	            
	            // Get the byte array data from the ByteArrayOutputStream
	            byte[] fileData = out.toByteArray();
	            return fileData;
		    }catch (Exception e) {
		    	java.util.logging.Logger.getLogger(loggerName).log(Level.SEVERE, "There was an error exporting file "+e.getMessage());
		    	 SparqlQueryResult.forBottomMsg("Error exporting file: " + e.getMessage());
		    	 return null;
			}
		}


		public void clearDataset() {
			if(this.dataset!=null) {
				this.dataset.close();
				this.dataset=null;
			}
		}

	

}
