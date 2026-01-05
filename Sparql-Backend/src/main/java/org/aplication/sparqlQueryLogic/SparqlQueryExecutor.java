package org.aplication.sparqlQueryLogic;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.Query;

public interface SparqlQueryExecutor {
	SparqlQueryResult execute(Query query, Dataset dataset);
}