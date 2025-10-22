package org.aplication.backend.sparql;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/sparql")
public class SparqlController {
	private final static String loggerName="SparqlController";
   
	@Autowired
	private SparqlService sparqlService;
	
	
    @PostMapping(value = "/runQuery", produces = "text/plain")
    public ResponseEntity<String> runQuery(@RequestBody(required=false) String queryString) {
    	if (queryString == null || queryString.trim().isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Error: The SPARQL query cannot be empty or missing.");
        }
    	try {
    		
            return ResponseEntity.ok(this.sparqlService.runSparqlQuery(queryString));
        } catch (Exception e) {
            // Log the error
            Logger.getLogger(loggerName).log(Level.parse("ERROR"), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error executing query" );
        }
    }

    // Return 400 for incorrect HTTP methods on /runQuery
    @GetMapping("/runQuery")
    @PutMapping("/runQuery")
    @DeleteMapping("/runQuery")
    @PatchMapping("/runQuery")
    public ResponseEntity<String> runQueryMethodNotAllowed() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please use POST method to run the query.");
    }

    
    @PostMapping(value="/loadDatasetFromUrl", produces = "text/plain")
    public ResponseEntity<String> loadDatasetFromUrl(@RequestBody(required=false) String urlPath) {
    	if (urlPath == null || urlPath.trim().isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Error: The url cannot be empty or missing.");
        }
    	
        if (urlPath == null || urlPath.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: File path cannot be empty or missing.");
        }
        try {
            sparqlService.loadFromSource(urlPath);
            return ResponseEntity.ok("Dataset loaded successfully from url: " + urlPath);
        } catch (Exception e) {
            Logger.getLogger(loggerName).log(Level.SEVERE, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error loading dataset from file.");
        }
    }

    // Return 400 for incorrect HTTP methods on /loadDatasetFromUrl
    @GetMapping("/loadDatasetFromUrl")
    @PutMapping("/loadDatasetFromUrl")
    @DeleteMapping("/loadDatasetFromUrl")
    @PatchMapping("/loadDatasetFromUrl")
    public ResponseEntity<String> loadDatasetFromUrlMethodNotAllowed() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please use POST method to load dataset from URL.");
    }
    
    /*
     * Contains a vulnerability with the file extension. No worries tho,it does not access anything important
     * 
     */
    
    @PostMapping(value="/loadDatasetFromFile", consumes = "multipart/form-data", produces = "text/plain")
    public ResponseEntity<String> loadDatasetFromFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: No file uploaded.");
        }
        File tempFile = null;
        try {
            tempFile = File.createTempFile("uploaded_dataset_", file.getOriginalFilename());
            file.transferTo(tempFile);
            sparqlService.loadFromSource(tempFile.getAbsolutePath());
            return ResponseEntity.ok("Dataset uploaded and loaded successfully.");
        } catch (Exception e) {
            Logger.getLogger(loggerName).log(Level.SEVERE,"Error loading dataset"+ e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing uploaded file.");
        } finally {
            if (tempFile != null && tempFile.exists()) {
                boolean deleted=tempFile.delete();
                if(deleted) {
                	Logger.getLogger(loggerName).log(Level.FINE,"Temp files deleted corretly");
                }else {
                	Logger.getLogger(loggerName).log(Level.SEVERE,"Error deleteng tempfiles");
                }
                	
            }
        }
    }

    // Return 400 for incorrect HTTP methods on /loadDatasetFromFile
    @GetMapping("/loadDatasetFromFile")
    @PutMapping("/loadDatasetFromFile")
    @DeleteMapping("/loadDatasetFromFile")
    @PatchMapping("/loadDatasetFromFile")
    public ResponseEntity<String> loadDatasetFromFileMethodNotAllowed() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please use POST method to upload a dataset file.");
    }

    
    @GetMapping(value="/getExport")
    public ResponseEntity<byte[]> exportGraph(@PathVariable String fileFormat){
    	try {
			byte[] fileData=sparqlService.exportGraphToAnotherFormat(fileFormat);
			HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=exported_graph." + fileFormat);
        headers.add(HttpHeaders.CONTENT_TYPE, "application/octet-stream");  // Use appropriate content type

        return ResponseEntity.ok()
                .headers(headers)
                .body(fileData);
    } catch (Exception e) {
    	Logger.getLogger(loggerName).log(Level.SEVERE,"Error exporting dataset"+e.getMessage());
    	return ResponseEntity.status(500).build();
    }
    }

    // Return 400 for incorrect HTTP methods on /getExport
    @PostMapping("/getExport")
    @PutMapping("/getExport")
    @DeleteMapping("/getExport")
    @PatchMapping("/getExport")
    public ResponseEntity<String> getExportMethodNotAllowed() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please use GET method to export the graph.");
    }
    
    
    @GetMapping("/clearDataset")
    @PostMapping("/clearDataset")
    @PutMapping("/clearDataset")
    @PatchMapping("/clearDataset")
    public ResponseEntity<String> clearDatasetError() {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please use DELETE method to clear the dataset.");
	}
    
    
    @DeleteMapping(value="/clearDataset", produces = "text/plain")
    public ResponseEntity<String> clearDataset() {
        try {
            sparqlService.clearDataset();
            Logger.getLogger(loggerName).log(Level.FINE, "dataset cleared successfully");
            System.out.println("Hiii");
            return ResponseEntity.ok("Dataset cleared successfully.");
        } catch (Exception e) {
            Logger.getLogger(loggerName).log(Level.SEVERE, "Error clearing dataset: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error clearing dataset.");
        }
    }
    
}