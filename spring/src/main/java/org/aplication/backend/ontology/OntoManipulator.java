package org.aplication.backend.ontology;

import org.apache.jena.ontapi.GraphRepository;
import org.apache.jena.ontapi.OntModelFactory;
import org.apache.jena.ontapi.OntSpecification;
import org.apache.jena.ontapi.model.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.riot.RDFDataMgr;

public class OntoManipulator {
	private OntModel ontModel;
	
    // Method to create different types of Ontology models
    public void createOntologyModel(String modelType) {
    	GraphRepository repository=GraphRepository.createGraphDocumentRepositoryMem();
    	
    	OntModel model;

        switch (modelType) {
            case "OWL2_DL_MEM_RULES_INF":
                model = OntModelFactory.createModel(null,OntSpecification.OWL2_DL_MEM_RULES_INF,repository);
                break;
            case "OWL2_FULL_MEM_RULES_INF":
                model = OntModelFactory.createModel(null,OntSpecification.OWL2_FULL_MEM_RULES_INF,repository);
                break;
            case "OWL2_EL_MEM_RULES_INF":
                model = OntModelFactory.createModel(null,OntSpecification.OWL2_EL_MEM_RULES_INF,repository);
                break;
            case "OWL2_QL_MEM_RULES_INF":
                model = OntModelFactory.createModel(null,OntSpecification.OWL2_QL_MEM_RULES_INF,repository);
                break;
            case "OWL2_RL_MEM_RULES_INF":
                model = OntModelFactory.createModel(null,OntSpecification.OWL2_RL_MEM_RULES_INF,repository);
                break;
            case "RDFS_MEM_RDFS_INF":
                model = OntModelFactory.createModel(null,OntSpecification.RDFS_MEM_RDFS_INF,repository);
                break;
            default:
                throw new IllegalArgumentException("Unknown model type: " + modelType);
        }

        ontModel= model;
    }


    
    
    public OntModel getOntModel() {
    	return ontModel;
	}
    
    public void addImport(OntModel newModel) {
    	ontModel.addImport(ontModel);
    }
    
    public void readOntologyFromSource(String source) {
    	
			ontModel.read(source);
	}
    
    
	
}
