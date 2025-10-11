package org.logicaGrafo.query;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.rdf.model.Model;
import org.logicaGrafo.SparqlQueryResult;

public class ConstructQueryExecutor implements SparqlQueryExecutor {
	@Override
	public SparqlQueryResult execute(Query query, Dataset dataset) {
		try (QueryExecution qExec = QueryExecutionFactory.create(query, dataset)) {
			Model model = qExec.execConstruct();
			return SparqlQueryResult.forConstruct(model);
		} catch (Exception e) {
			return SparqlQueryResult.forBottomMsg(e.getMessage());
		}
	}
}
