package org.logicaGrafo.query;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.logicaGrafo.SparqlQueryResult;

public class SelectQueryExecutor implements SparqlQueryExecutor {
	@Override
	public SparqlQueryResult execute(Query query, Dataset dataset) {
		try (QueryExecution qExec = QueryExecutionFactory.create(query, dataset)) {
			ResultSet rs = qExec.execSelect();
			List<String> variables = new ArrayList<>(rs.getResultVars());
			List<Map<String, String>> rows = new ArrayList<>();
			while (rs.hasNext()) {
				QuerySolution qs = rs.next();
				Map<String, String> row = new HashMap<>();
				for (String var : variables) {
					row.put(var, qs.get(var) != null ? qs.get(var).toString() : "");
				}
				rows.add(row);
			}
			return SparqlQueryResult.forSelect(variables, rows);
		} catch (Exception e) {
			return SparqlQueryResult.forBottomMsg(e.getMessage());
		}
	}
}
