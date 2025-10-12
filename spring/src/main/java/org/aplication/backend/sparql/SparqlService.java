
package org.aplication.backend.sparql;

import java.util.Map;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.aplication.sparqlQueryLogic.SparqlQueryExecutor;
import org.aplication.sparqlQueryLogic.SparqlQueryExecutorFactory;
import org.aplication.sparqlQueryLogic.SparqlQueryResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SparqlService {

	private final static String loggerName="Sparql service";
	
	@Value("${name:World}")
	private String name;

	public String getHelloMessage() {
		return "Hello " + this.name;
	}
	
	public String runSparqlQuery(String queryString) {
		SparqlQueryResult result = executeQuery(queryString);
        java.util.logging.Logger.getLogger(loggerName).info("Hubo un error y es "+result.getError());
        StringBuilder stringResult = new StringBuilder();
        
        for (Map<String, String> m : result.getRows()) {
            for (String k : m.keySet()) {	
                stringResult.append("Var ").append(k).append(" value: ").append(m.get(k)).append("\n");
            }
        }
        java.util.logging.Logger.getLogger(loggerName).info("Esto es lo que se tendria que implimir "+stringResult.toString());
        java.util.logging.Logger.getLogger(loggerName).info("Hubo un error y es "+result.getError());
        stringResult.append(result.getError());
        return stringResult.toString();
        
	}
	 private SparqlQueryResult executeQuery(String queryStr) {
			try {
				Query query = QueryFactory.create(queryStr);
				SparqlQueryExecutor executor = SparqlQueryExecutorFactory.getExecutor(query);
				return executor.execute(query, getGraphDatasetMock());
			} catch (Exception e) {
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
	  
	
	
	

}
