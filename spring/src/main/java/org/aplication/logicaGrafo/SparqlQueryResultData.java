package org.logicaGrafo;

import java.util.List;
import java.util.Map;

import org.apache.jena.rdf.model.Model;

public class SparqlQueryResultData {
	public List<String> variables;
	public List<Map<String, String>> rows;
	public String bottomMsg;
	public boolean isSelect;
	public boolean isConstruct;
	public boolean isAsk;
	public boolean isDescribe;
	public Model modelResult;
	public Boolean askResult;

	public SparqlQueryResultData() {
	}
}
