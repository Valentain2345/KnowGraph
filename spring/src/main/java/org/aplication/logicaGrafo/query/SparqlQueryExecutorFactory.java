package org.logicaGrafo.query;

import org.apache.jena.query.Query;

public class SparqlQueryExecutorFactory {
	public static SparqlQueryExecutor getExecutor(Query query) {
		if (query.isSelectType()) {
			return new SelectQueryExecutor();
		} else if (query.isConstructType()) {
			return new ConstructQueryExecutor();
		} else if (query.isAskType()) {
			return new AskQueryExecutor();
		} else if (query.isDescribeType()) {
			return new DescribeQueryExecutor();
		} else {
			throw new IllegalArgumentException("Unsupported SPARQL query type");
		}
	}
}
