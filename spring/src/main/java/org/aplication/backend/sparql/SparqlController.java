package org.aplication.backend.sparql;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sparql")
public class SparqlController {

    @GetMapping("/dataset")
    public String getDataset() {
        return "Hello, World!";
    }
    
    @PostMapping(value = "/runQuery", produces = "text/plain")
    public ResponseEntity<String> runQuery(@RequestBody(required=false) String queryString) {
    	if (queryString == null || queryString.trim().isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Error: The SPARQL query cannot be empty or missing.");
        }
    	try {
    		
            return ResponseEntity.ok(new SparqlService().runSparqlQuery(queryString));
        } catch (Exception e) {
            // Log the error
            Logger.getLogger("SparqlService").log(Level.parse("ERROR"), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error executing query" );
        }
    }



    
}