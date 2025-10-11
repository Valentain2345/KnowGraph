package org.logicaGrafo;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.jena.rdf.model.Model;

public class SparqlQueryResult {
	public static SparqlQueryResult forAsk(boolean result) {
		SparqlQueryResultData data = new SparqlQueryResultData();
		data.askResult = result;
		data.isAsk = true;
		return new SparqlQueryResult(data);
	}

	public static SparqlQueryResult forBottomMsg(String error) {
		SparqlQueryResultData data = new SparqlQueryResultData();
		data.bottomMsg = error;
		return new SparqlQueryResult(data);
	}

	public static SparqlQueryResult forConstruct(Model model) {
		SparqlQueryResultData data = new SparqlQueryResultData();
		data.modelResult = model;
		data.isConstruct = true;
		return new SparqlQueryResult(data);
	}

	public static SparqlQueryResult forDescribe(Model model) {
		SparqlQueryResultData data = new SparqlQueryResultData();
		data.modelResult = model;
		data.isDescribe = true;
		return new SparqlQueryResult(data);
	}

	// Factory methods
	public static SparqlQueryResult forSelect(List<String> variables, List<Map<String, String>> rows) {
		SparqlQueryResultData data = new SparqlQueryResultData();
		data.variables = variables;
		data.rows = rows;
		data.isSelect = true;
		return new SparqlQueryResult(data);
	}

	private final List<String> variables;
	private final List<Map<String, String>> rows;
	private final String bottomMsg;
	private final boolean isSelect;

	private final boolean isConstruct;

	private final boolean isAsk;
	private final boolean isDescribe;
	private final Model modelResult;
	private final Boolean askResult;

	// Constructor now takes a single DTO
	public SparqlQueryResult(SparqlQueryResultData data) {
		variables = data.variables != null ? data.variables : Collections.emptyList();
		rows = data.rows != null ? data.rows : Collections.emptyList();
		modelResult = data.modelResult;
		askResult = data.askResult;
		bottomMsg = data.bottomMsg;
		isSelect = data.isSelect;
		isConstruct = data.isConstruct;
		isAsk = data.isAsk;
		isDescribe = data.isDescribe;
	}

	public Boolean getAskResult() {
		return askResult;
	}

	public String getError() {
		return bottomMsg;
	}

	public Model getModelResult() {
		return modelResult;
	}

	public List<Map<String, String>> getRows() {
		return rows;
	}

	// Getters
	public List<String> getVariables() {
		return variables;
	}

	public boolean hasError() {
		return bottomMsg != null && !bottomMsg.isEmpty();
	}

	public boolean isAsk() {
		return isAsk;
	}

	public boolean isConstruct() {
		return isConstruct;
	}

	public boolean isDescribe() {
		return isDescribe;
	}

	public boolean isSelect() {
		return isSelect;
	}
}