package org.aplication.sparqlQueryLogic;

import org.apache.jena.query.ResultSetRewindable;
import org.apache.jena.query.ResultSetFormatter;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.apache.jena.riot.RDFLanguages;
import org.apache.jena.riot.RDFParser;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;

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

   

    public static SparqlQueryResult forSelect(ResultSetRewindable rewindable) {
        SparqlQueryResultData data = new SparqlQueryResultData();
        data.setVariables(rewindable.getResultVars());
        data.setSelect(true);
        return new SparqlQueryResult(data, rewindable);
    }

    private final String bottomMsg;
    private final boolean isSelect;
    private final boolean isConstruct;
    private final boolean isAsk;
    private final boolean isDescribe;
    private final Model modelResult;
    private final Boolean askResult;
    private ResultSetRewindable rewindableResultSet;

    // Constructor now takes a single DTO
    public SparqlQueryResult(SparqlQueryResultData data) {
        modelResult = data.getModelResult();
        askResult = data.getAskResult();
        bottomMsg = data.getBottomMsg();
        isSelect = data.isSelect();
        isConstruct = data.isConstruct();
        isAsk = data.isAsk();
        isDescribe = data.isDescribe();
        this.rewindableResultSet = null;
    }

    // New constructor for SELECT with ResultSetRewindable
    public SparqlQueryResult(SparqlQueryResultData data, ResultSetRewindable rewindable) {
        this(data);
        this.rewindableResultSet = rewindable;
    }

    
    public String getResultAsStringObject() {
    	if(isSelect) {
			return toCSV();
		}else if(isAsk) {
			return convertAskToCsvResult();
		}else if(isConstruct || isDescribe) {
			if(modelResult!=null && !modelResult.isEmpty()) {
				return convertModelToCSV();
			}else {
				return "result\n "
						+ "No model result";
			}
		}else if(hasError()) {
			return bottomMsg;
		}else {
			return "No result";
		}
    }
    
    
    private String convertModelToCSV() {
    if (modelResult == null) {
        return "No model result";
    }

    StringBuilder csvBuilder = new StringBuilder();
    csvBuilder.append("subject,predicate,object\n");

    modelResult.listStatements().forEachRemaining(statement -> {
        String subject = escapeCsv(statement.getSubject().toString());
        String predicate = escapeCsv(statement.getPredicate().toString());
        String object = escapeCsv(statement.getObject().toString());

        csvBuilder.append(subject).append(",")
                  .append(predicate).append(",")
                  .append(object).append("\n");
    });

    return csvBuilder.toString();
}

private String escapeCsv(String value) {
    if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
        value = value.replace("\"", "\"\""); // double the quotes
        return "\"" + value + "\""; // wrap in quotes
    }
    return value;
}

   
   private String convertModelToJSON() {
    if (modelResult == null) {
        return "{\"error\": \"No model result\"}";
    }

    StringBuilder jsonBuilder = new StringBuilder();
    jsonBuilder.append("[\n");

    // Iterate over statements and build JSON manually
    modelResult.listStatements().forEachRemaining(statement -> {
        String subject = escapeJSON(statement.getSubject().toString());
        String predicate = escapeJSON(statement.getPredicate().toString());
        String object = escapeJSON(statement.getObject().toString());

        jsonBuilder.append("  {\n")
                   .append("    \"subject\": \"").append(subject).append("\",\n")
                   .append("    \"predicate\": \"").append(predicate).append("\",\n")
                   .append("    \"object\": \"").append(object).append("\"\n")
                   .append("  },\n");
    });

    // Remove the trailing comma (if any)
    if (jsonBuilder.lastIndexOf(",") == jsonBuilder.length() - 2) {
        jsonBuilder.delete(jsonBuilder.length() - 2, jsonBuilder.length());
    }

    jsonBuilder.append("\n]");
    return jsonBuilder.toString();
}

/**
 * Escapes common JSON special characters.
 */
private String escapeJSON(String value) {
    if (value == null) return "";
    return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
}

    private String convertAskToCsvResult() {
		return "result\n"+askResult.toString();
	}
	private String convertAskToJsonResult() {
    if (askResult == null) {
        return "{\"result\": false}";
    }

    return "{\n  \"result\": " + askResult.toString().toLowerCase() + "\n}";
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

    public ResultSetRewindable getRewindableResultSet() {
        return rewindableResultSet;
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

    public String toCSV() {
        if (rewindableResultSet == null) return "";
        rewindableResultSet.reset();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ResultSetFormatter.outputAsCSV(out, rewindableResultSet);
        return out.toString();
    }
    
    public String toJSON() {
        if (rewindableResultSet == null) return "";
        rewindableResultSet.reset();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ResultSetFormatter.outputAsJSON(out, rewindableResultSet);
        return out.toString();
    }
}
