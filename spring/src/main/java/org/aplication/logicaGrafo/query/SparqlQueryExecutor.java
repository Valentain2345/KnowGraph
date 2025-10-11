package org.logicaGrafo.query;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.Query;
import org.logicaGrafo.SparqlQueryResult;

public interface SparqlQueryExecutor {
	SparqlQueryResult execute(Query query, Dataset dataset);
}
