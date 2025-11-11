package org.aplication.backend.inference;

import org.apache.jena.rdf.model.Statement;
import org.aplication.backend.sparql.SparqlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/infmodel")
public class InfModelController {

	private InferenceManipulator infManipulator=new InferenceManipulator();
	
	@Autowired
	private SparqlService sparqlService;
	
	@GetMapping("/validate")
	public ResponseEntity<String> validateInferenceModel() {
		return  ResponseEntity.ok(infManipulator.validateModel());
		
	}
	
	@GetMapping("/createModel")
	public ResponseEntity<String> createInferenceModel(@RequestParam String type) {

		infManipulator.createInferenceModel(sparqlService.generateUnionModel(), type);
		sparqlService.addModelToDataset(infManipulator.getDeductionsModel());
		return  ResponseEntity.ok("Inference model created with reasoner type: " + type);
		
	}
	
	@PostMapping("/createGenericModel")
	public ResponseEntity<String> createGenericInferenceModel(@RequestBody String rules) {
		infManipulator.createGenericInferenceModel(sparqlService.generateUnionModel(), rules);
		sparqlService.addModelToDataset(infManipulator.getDeductionsModel());
		
		return  ResponseEntity.ok("Generic inference model created with provided rules.");
	}
	
	@GetMapping("/getInferredStatements")
	public ResponseEntity<String> getInferredStatements() {
		String inferredStatements = infManipulator.listAllInferredStatements();
		return  ResponseEntity.ok(inferredStatements);
	}
	
	@GetMapping("/getRuleStructure")
	public ResponseEntity<String> getRuleStructure() {
		return ResponseEntity.ok(infManipulator.getRuleStructure());
	}
	
	@GetMapping("/explainDerivation")
	public ResponseEntity<String> explainDerivation(@RequestParam String statment) {
		Statement smnt= infManipulator.castStringToStatement(statment);
		String derivation= infManipulator.explainDerivation(smnt);
		return ResponseEntity.ok(derivation);
	}
	
	
}
