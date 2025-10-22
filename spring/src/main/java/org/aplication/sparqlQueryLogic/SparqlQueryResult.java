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

        // Assuming we want to get all the triples (subject, predicate, object)
        // and display them in CSV format (subject, predicate, object)
        csvBuilder.append("subject,predicate,object\n");
        modelResult.listStatements().forEachRemaining(statement -> {
            String subject = statement.getSubject().toString();
            String predicate = statement.getPredicate().toString();
            String object = statement.getObject().toString();

            // Append to CSV with a new line
            csvBuilder.append(subject).append(",")
                       .append(predicate).append(",")
                       .append(object).append("\n");
        });

        return csvBuilder.toString();
    }
   
    
    private String convertAskToCsvResult() {
		return "result\n"+askResult.toString();
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