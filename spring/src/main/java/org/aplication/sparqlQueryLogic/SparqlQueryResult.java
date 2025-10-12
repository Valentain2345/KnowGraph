package org.aplication.sparqlQueryLogic;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.jena.rdf.model.Model;

public class SparqlQueryResult {
    // Factory methods
    public static SparqlQueryResult forAsk(boolean result) {
        SparqlQueryResultData data = new SparqlQueryResultData();
        data.setAskResult(result);
        data.setAsk(true);
        return new SparqlQueryResult(data);
    }

    public static SparqlQueryResult forBottomMsg(String error) {
        SparqlQueryResultData data = new SparqlQueryResultData();
        data.setBottomMsg(error);
        return new SparqlQueryResult(data);
    }

    public static SparqlQueryResult forConstruct(Model model) {
        SparqlQueryResultData data = new SparqlQueryResultData();
        data.setModelResult(model);
        data.setConstruct(true);
        return new SparqlQueryResult(data);
    }

    public static SparqlQueryResult forDescribe(Model model) {
        SparqlQueryResultData data = new SparqlQueryResultData();
        data.setModelResult(model);
        data.setDescribe(true);
        return new SparqlQueryResult(data);
    }

    public static SparqlQueryResult forSelect(List<String> variables, List<Map<String, String>> rows) {
        SparqlQueryResultData data = new SparqlQueryResultData();
        data.setVariables(variables);
        data.setRows(rows);
        data.setSelect(true);
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
        variables = data.getVariables() != null ? data.getVariables() : Collections.emptyList();
        rows = data.getRows() != null ? data.getRows() : Collections.emptyList();
        modelResult = data.getModelResult();
        askResult = data.getAskResult();
        bottomMsg = data.getBottomMsg();
        isSelect = data.isSelect();
        isConstruct = data.isConstruct();
        isAsk = data.isAsk();
        isDescribe = data.isDescribe();
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