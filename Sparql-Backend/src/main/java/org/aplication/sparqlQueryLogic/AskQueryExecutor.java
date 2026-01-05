package org.aplication.sparqlQueryLogic;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;

public class AskQueryExecutor implements SparqlQueryExecutor {
	@Override
	public SparqlQueryResult execute(Query query, Dataset dataset) {
		try (QueryExecution qExec = QueryExecutionFactory.create(query, dataset)) {
			boolean result = qExec.execAsk();
			return SparqlQueryResult.forAsk(result);
		} catch (Exception e) {
			return SparqlQueryResult.forBottomMsg(e.getMessage());
		}
	}
}