package org.aplication.backend.inference;

import java.util.Iterator;
import java.util.List;

import org.apache.jena.rdf.model.InfModel;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.reasoner.Derivation;
import org.apache.jena.reasoner.Reasoner;
import org.apache.jena.reasoner.ReasonerRegistry;
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner;
import org.apache.jena.reasoner.rulesys.Rule;

public class InferenceManipulator {

	InfModel infModel;
	
	public  void createInferenceModel(Model baseModel, String reasonerType) {
		
		Reasoner reasoner;
		switch (reasonerType) {
			case "RDFS":
				reasoner = ReasonerRegistry.getRDFSReasoner();
				break;
			case "OWL":
				reasoner = ReasonerRegistry.getOWLReasoner();
				break;
			case "TRANSITIVE":
				reasoner = ReasonerRegistry.getTransitiveReasoner();
				break;
			case "MINI":
				reasoner = ReasonerRegistry.getOWLMiniReasoner();
				break;
			case "MICRO":
				reasoner = ReasonerRegistry.getOWLMicroReasoner();
				break;	
			default:
				throw new IllegalArgumentException("Unknown reasoner type: " + reasonerType);
		}
		
		infModel=ModelFactory.createInfModel(reasoner, baseModel);
		
	}
	
	public void createGenericInferenceModel(Model baseModel,String ruleSrc) {
		List<Rule> rulesList = Rule.parseRules(ruleSrc);
		Reasoner reasoner = new GenericRuleReasoner(rulesList);
		infModel = ModelFactory.createInfModel(reasoner, baseModel);
		}
	
	public String getRuleStructure() {
		return "Rule      :=   bare-rule .\n"
				+ "          or   [ bare-rule ]\n"
				+ "       or   [ ruleName : bare-rule ]\n"
				+ "\n"
				+ "bare-rule :=   term, … term -> hterm, … hterm    // forward rule\n"
				+ "or   bhterm <- term, … term    // backward rule\n"
				+ "\n"
				+ "hterm     :=   term\n"
				+ "or   [ bare-rule ]\n"
				+ "\n"
				+ "term      :=   (node, node, node)           // triple pattern\n"
				+ "or   (node, node, functor)        // extended triple pattern\n"
				+ "or   builtin(node, … node)      // invoke procedural primitive\n"
				+ "\n"
				+ "bhterm      :=   (node, node, node)           // triple pattern\n"
				+ "\n"
				+ "functor   :=   functorName(node, … node)  // structured literal\n"
				+ "\n"
				+ "node      :=   uri-ref                   // e.g. http://foo.com/eg\n"
				+ "or   prefix:localname          // e.g. rdf:type\n"
				+ "or   <uri-ref>          // e.g. <myscheme:myuri>\n"
				+ "or   ?varname                    // variable\n"
				+ "or   ‘a literal’                 // a plain string literal\n"
				+ "or   ’lex’^^typeURI              // a typed literal, xsd:* type names supported\n"
				+ "or   number                      // e.g. 42 or 25.5\n"
				+"Here are some example rules:\n"
				+ "[allID: (?C rdf:type owl:Restriction), (?C owl:onProperty ?P),\n"
				+ "     (?C owl:allValuesFrom ?D)  -> (?C owl:equivalentClass all(?P, ?D)) ]\n"
				+ "\n"
				+ "[all2: (?C rdfs:subClassOf all(?P, ?D)) -> print(‘Rule for ‘, ?C)\n"
				+ "[all1b: (?Y rdf:type ?D) <- (?X ?P ?Y), (?X rdf:type ?C) ] ]\n"
				+ "\n"
				+ "[max1: (?A rdf:type max(?P, 1)), (?A ?P ?B), (?A ?P ?C)\n"
				+ "-> (?B owl:sameAs ?C) ]\n"
				+ "\n";
	}
	
	public String validateModel() {
		if (infModel == null) {
			return "Inference model is not created.";
		}
		StringBuilder report = new StringBuilder();
		if (infModel.validate().isValid()) {
			report.append("Model is valid.\n");
		} else {
			report.append("Model is invalid.\n");
			infModel.validate().getReports().forEachRemaining(r -> 
				report.append(r.toString()).append("\n"));
		}
		return report.toString();
	}
	
	public InfModel getInfModel() {
		return infModel;
	}
	
	public String getExtendedListOfStatements() {
		if (infModel == null) {
			return "Inference model is not created.";
		}
		StringBuilder statements = new StringBuilder();
		
		infModel.listStatements().forEachRemaining(stmt -> 
			statements.append(stmt.toString()).append("\n"));
		return statements.toString();
	} 
	
	public Statement castStringToStatement(String statementStr) {
		if (infModel == null) {
			throw new IllegalStateException("Inference model is not created.");
		}
		String[] parts = statementStr.split(" ", 3);
		if (parts.length != 3) {
			throw new IllegalArgumentException("Invalid statement format. Expected format: 'subject predicate object'");
		}
		Resource subject = infModel.createResource(parts[0]);
		Property predicate = infModel.createProperty(parts[1]);
		RDFNode object;
		if (parts[2].startsWith("\"") && parts[2].endsWith("\"")) {
			object = infModel.createLiteral(parts[2].substring(1, parts[2].length() - 1));
		} else {
			object = infModel.createResource(parts[2]);
		}
		return infModel.createStatement(subject, predicate, object);
	}
	
	private Iterator<Derivation> getDerivations(Statement stmt) {
		if (infModel == null) {
			throw new IllegalStateException("Inference model is not created.");
		}
		return infModel.getDerivation(stmt);
	}
	
	public String explainDerivation(Statement stmt) {
		Iterator<Derivation> derivations = getDerivations(stmt);
		
		StringBuilder explanation = new StringBuilder();
		if(derivations==null || !derivations.hasNext()) {
			return "No derivations found for the given statement.";
		}
		while (derivations.hasNext()) {
			Derivation derivation = derivations.next();
			explanation.append("Derivation:\n");
			explanation.append(derivation.toString());
			explanation.append("\n");
		}
		
		return explanation.toString();
	}
	
	public Model getRawModel() {
		if (infModel == null) {
			throw new IllegalStateException("Inference model is not created.");
		}
		return infModel.getRawModel();
	}
	
	public Model getDeductionsModel() {
		if (infModel == null) {
			throw new IllegalStateException("Inference model is not created.");
		}
		return infModel.getDeductionsModel();
	}
	
	public String listAllInferredStatements() {
		if (infModel == null) {
			return "Inference model is not created.";
		}
		StringBuilder inferredStatements = new StringBuilder();
		
		infModel.getDeductionsModel().listStatements().forEachRemaining(stmt -> 
			inferredStatements.append(stmt.toString()).append("\n"));
		return inferredStatements.toString();
	}
	
	
}
