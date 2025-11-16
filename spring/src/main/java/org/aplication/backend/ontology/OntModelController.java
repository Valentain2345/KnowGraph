package org.aplication.backend.ontology;

import org.aplication.backend.sparql.SparqlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
@RestController
@RequestMapping("/ontmodel")
public class OntModelController {
	
	private OntoManipulator ontManipulator=new OntoManipulator();

	private final SparqlService sparqlService;
	
	public OntModelController(SparqlService sp){
		sparqlService=sp;
	}

	@GetMapping("/createModel")
	public ResponseEntity<String> createOntologyModel(@RequestParam String type) {

		ontManipulator.createOntologyModel(type);
		sparqlService.clearDataset();
		sparqlService.addModelToDataset(ontManipulator.getOntModel());
		return  ResponseEntity.ok("Ontology model created with type: " + type);
		
	}

	
}
