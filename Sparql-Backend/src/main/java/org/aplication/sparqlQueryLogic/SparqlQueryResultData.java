package org.aplication.sparqlQueryLogic;

import java.util.List;
import java.util.Map;

import org.apache.jena.rdf.model.Model;

public class SparqlQueryResultData {
	private List<String> variables;
	private List<Map<String, String>> rows;
	private String bottomMsg;
	private boolean isSelect;
	private boolean isConstruct;
	private boolean isAsk;
	private boolean isDescribe;
	private Model modelResult;
	private Boolean askResult;

	public List<String> getVariables() {
		return variables;
	}
	public void setVariables(List<String> variables) {
		this.variables = variables;
	}
	public List<Map<String, String>> getRows() {
		return rows;
	}
	public void setRows(List<Map<String, String>> rows) {
		this.rows = rows;
	}
	public String getBottomMsg() {
		return bottomMsg;
	}
	public void setBottomMsg(String bottomMsg) {
		this.bottomMsg = bottomMsg;
	}
	public boolean isSelect() {
		return isSelect;
	}
	public void setSelect(boolean isSelect) {
		this.isSelect = isSelect;
	}
	public boolean isConstruct() {
		return isConstruct;
	}
	public void setConstruct(boolean isConstruct) {
		this.isConstruct = isConstruct;
	}
	public boolean isAsk() {
		return isAsk;
	}
	public void setAsk(boolean isAsk) {
		this.isAsk = isAsk;
	}
	public boolean isDescribe() {
		return isDescribe;
	}
	public void setDescribe(boolean isDescribe) {
		this.isDescribe = isDescribe;
	}
	public Model getModelResult() {
		return modelResult;
	}
	public void setModelResult(Model modelResult) {
		this.modelResult = modelResult;
	}
	public Boolean getAskResult() {
		return askResult;
	}
	public void setAskResult(Boolean askResult) {
		this.askResult = askResult;
	}
	
}
