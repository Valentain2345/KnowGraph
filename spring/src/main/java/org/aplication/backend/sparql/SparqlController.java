package org.aplication.backend.sparql;

import java.io.File;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.List;
import java.util.ArrayList;

import org.apache.jena.riot.Lang;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;


@RestController
@RequestMapping("/sparql")
public class SparqlController {
	private final static String loggerName="SparqlController";
   

	private final SparqlService sparqlService;
	
	public SparqlController(SparqlService sp){
        sparqlService=sp;
	}


	
    @PostMapping(value = "/runQuery", produces = "text/plain")
    public ResponseEntity<String> runQuery(@RequestBody(required=false) String queryString) {
    	if (queryString == null || queryString.trim().isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Error: The SPARQL query cannot be empty or missing.");
        }
    	try {
            String result=this.sparqlService.runSparqlQuery(queryString);
            if(result.isEmpty())
                return ResponseEntity.ok("No hay resultados para esa query");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Logger.getLogger(loggerName).log(Level.parse("ERROR"), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error executing query "+e.getMessage());
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



 @PostMapping(value = "/addDataToDataset",consumes = "multipart/form-data",produces = "text/plain")
 public ResponseEntity<String> addDataToDataset(
        @RequestParam(value = "files", required = false) MultipartFile[] files,
        @RequestParam(value = "urls", required = false) String[] urls) {

    Logger logger = Logger.getLogger("DatasetUploadLogger");
    List<File> tempFiles = new ArrayList<>();

    try {
        // Handle uploaded files
        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    File tempFile = File.createTempFile("uploaded_dataset_", "_" + file.getOriginalFilename());
                    file.transferTo(tempFile);
                    tempFiles.add(tempFile);
                    sparqlService.addToDatasetFromSource(tempFile.getAbsolutePath());
                    logger.log(Level.INFO, "Loaded dataset from file: " + file.getOriginalFilename());
                }
            }
        }

        // Handle URLs
        if (urls != null && urls.length > 0) {
            for (String url : urls) {
                if (url != null && !url.trim().isEmpty()) {
                    sparqlService.addToDatasetFromSource(url.trim());
                    logger.log(Level.INFO, "Loaded dataset from URL: " + url);
                }
            }
        }

        // If nothing was provided
        if ((files == null || files.length == 0) && (urls == null || urls.length == 0)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: No files or URLs provided.");
        }

        return ResponseEntity.ok("Datasets uploaded and loaded successfully.");

    } catch (Exception e) {
        logger.log(Level.SEVERE, "Error loading dataset: " + e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error processing uploaded files or URLs.");

    } finally {
        // Clean up temporary files
        for (File tempFile : tempFiles) {
            if (tempFile.exists()) {
                if (tempFile.delete()) {
                    logger.log(Level.FINE, "Deleted temp file: " + tempFile.getName());
                } else {
                    logger.log(Level.WARNING, "Could not delete temp file: " + tempFile.getName());
                }
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
    public ResponseEntity<byte[]> exportGraph(@RequestParam String format) {
        try {
        if (format == null || format.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        byte[] fileData = sparqlService.exportGraphToAnotherFormat(format);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=exported_graph." + format);
        headers.add(HttpHeaders.CONTENT_TYPE, "application/octet-stream");
        return ResponseEntity.ok()
                .headers(headers)
                .body(fileData);

    } catch (Exception e) {
        Logger.getLogger(loggerName).log(Level.SEVERE, "Error exporting dataset: " + e.getMessage());
        return ResponseEntity.status(500).build();
    }
}


    // Return 400 for incorrect HTTP methods on /getExport
    @PostMapping("/getExport")
    @PutMapping("/getExport")
    @DeleteMapping("/getExport")
    @PatchMapping("/getExport")
    public ResponseEntity<String> getExportMethodNotAllowed() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please use POST method to export the graph.");
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

    @GetMapping("/loadExample1")
    public ResponseEntity<String> loadExample1(){
        try(InputStream is = ResourceLoader.class.getResourceAsStream("/PersonPhoneHeavy.owl.xml")){
        	
			if(is==null){
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Example 1 file not found");
			}
			sparqlService.loadFromSource(is, Lang.RDFXML);
			return ResponseEntity.ok("Example 1 loaded successfully");
        }catch (Exception e){
        Logger.getLogger(loggerName).log(Level.SEVERE, "Error loading example 1: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error loading example 1");
        }
    }

    @GetMapping("/loadExample2")
    public ResponseEntity<String> loadExample2(){
        try(InputStream is = ResourceLoader.class.getResourceAsStream("/PersonHeavyExtended.ttl")){
        	if(is==null){
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Example 2 file not found");
			}
			sparqlService.loadFromSource(is, Lang.TTL);
			return ResponseEntity.ok("Example 2 loaded successfully");
        }catch (Exception e){
        Logger.getLogger(loggerName).log(Level.SEVERE, "Error loading example 2: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error loading example 2");
        }
    }


    @GetMapping("/loadExampleQuery1")
    public ResponseEntity<String> loadExampleQuery1(){
        try(InputStream is = ResourceLoader.class.getResourceAsStream("/queryexample1.txt")){

			if(is==null){
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Example Query 1 file not found");
			}
            String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return ResponseEntity.ok(content);
        }catch (Exception e){
        Logger.getLogger(loggerName).log(Level.SEVERE, "Error loading example query 1: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error loading example query 1");
        }
    }

     @GetMapping("/loadExampleQuery2")
    public ResponseEntity<String> loadExampleQuery2(){
        try(InputStream is = ResourceLoader.class.getResourceAsStream("/queryexample2.txt")){

			if(is==null){
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Example Query 2 file not found");
			}
            String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return ResponseEntity.ok(content);
        }catch (Exception e){
        Logger.getLogger(loggerName).log(Level.SEVERE, "Error loading example query 2: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error loading example query 2");
        }
    }



    
}
