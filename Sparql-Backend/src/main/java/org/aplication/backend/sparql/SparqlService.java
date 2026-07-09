
package org.aplication.backend.sparql;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.logging.Level;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.apache.jena.riot.RDFLanguages;
import org.apache.jena.riot.RDFWriterRegistry;
import org.aplication.sparqlQueryLogic.SparqlQueryExecutor;
import org.aplication.sparqlQueryLogic.SparqlQueryExecutorFactory;
import org.aplication.sparqlQueryLogic.SparqlQueryResult;
import org.springframework.stereotype.Service;

@Service
public class SparqlService {

	private final static String loggerName="Sparql service";
	private Dataset dataset;
	

	
	
	private boolean successfulExecution(SparqlQueryResult result) {
		return result.getError() == null || result.getError().isEmpty();
	}
	public String runSparqlQuery(String queryString)throws Exception {
		SparqlQueryResult result = executeQuery(queryString);
		if(!successfulExecution(result)) {
			java.util.logging.Logger.getLogger(loggerName).info("Hubo un error y es "+result.getError());
			throw new Exception("Error executing query: " + result.getError());

		}
		java.util.logging.Logger.getLogger(loggerName).info("La query se ejecuto correctamente");
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
	    
	 public Model generateUnionModel() {
		 SparqlQueryResult res=executeQuery("construct {?s ?p ?o} where {?s ?p ?o}");
			Model model=res.getModelResult();
			return model;
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
	    
	    
	    public SparqlQueryResult loadFromSource(InputStream is,Lang lang) throws Exception {
	        try {
	            // Create a model to hold the RDF data
	        	  Dataset dataset= DatasetFactory.create();
	              RDFDataMgr.read(dataset,is,lang);
	              
	              this.dataset=dataset;
	            // Handles file paths or URLs
	            return SparqlQueryResult.forBottomMsg("Grafo cargado correctamente desde " + is+ " con lenguaje "+lang.getName());
	        } catch (Exception e) {
	        	   java.util.logging.Logger.getLogger(loggerName).log(Level.SEVERE, "There was an error in the loading "+e.getMessage());
	        	 throw new Exception("Error al cargar grafo desde " + is + ": " + e.getMessage());
	        }
	    }
	    
	    
	    
	    public SparqlQueryResult addToDatasetFromSource(String source) throws Exception {
	        try {
				if(this.dataset==null)
					this.dataset=DatasetFactory.create();
	            RDFDataMgr.read(dataset, source);
	            return SparqlQueryResult.forBottomMsg("Grafo añadido correctamente desde " + source);
	        } catch (Exception e) {
	        	   java.util.logging.Logger.getLogger(loggerName).log(Level.SEVERE, "There was an error in the adding to dataset "+e.getMessage());
	        	 throw new Exception("Error al añadir grafo desde " + source + ": " + e.getMessage());
	        }
	    }
	    
	
	public byte[] exportGraphToAnotherFormat(String format) {
			SparqlQueryResult res=executeQuery("construct {?s ?p ?o} where {?s ?p ?o}");
			Model model=res.getModelResult();
			java.util.logging.Logger.getLogger(loggerName).log(Level.FINE, "Union model created");
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
			System.out.println("Iniciando export");
		    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
	                if(rdfFormat!=null)
						RDFDataMgr.write(out, model, rdfFormat);
					else
						RDFDataMgr.write(out, model, lang);
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


		public void addModelToDataset(Model model) {
			if(this.dataset==null) {
				this.dataset=DatasetFactory.create();
			}
			
			if(model!=null) this.dataset.asDatasetGraph().addAll(DatasetFactory.create(model).asDatasetGraph());
		}

		public void setModelInDataset(Model model) {
			this.dataset=DatasetFactory.create(model);
		}
	

}

