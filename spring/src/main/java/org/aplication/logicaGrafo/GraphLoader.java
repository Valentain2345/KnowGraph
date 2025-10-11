package org.logicaGrafo;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.apache.jena.graph.Graph;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFParser;
import org.apache.jena.riot.system.ErrorHandlerFactory;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.vocabulary.RDF;

import com.sun.webkit.network.URLs;

public class GraphLoader {

    private Dataset dataset;

    public GraphLoader() {
        this.dataset = DatasetFactory.create(); 
    }

    public GraphLoader(Dataset initialDataset) {
        this.dataset = initialDataset;
    }

    public Dataset getDataset() {
        return dataset;
    }

    private record LoadResult(String method, Dataset dataset, long size) {}

    /**
     * Load RDF/Quad data from a file path, trying dataset first, then fallback to default graph.
     */
    public SparqlQueryResult loadFromFile(String filePath) {
        File file = new File(filePath);
        if (!file.exists() || !file.canRead()) {
            return SparqlQueryResult.forBottomMsg("El archivo no existe o no se puede leer: " + filePath);
        }

        List<LoadResult> results = new ArrayList<>();

        try {
            results.add(tryDataset(filePath));
        } catch (Exception e) {
            System.err.println("Dataset load failed: " + e.getMessage());
        }

        try {
            results.add(tryDatasetGraph(filePath));
        } catch (Exception e) {
            System.err.println("DatasetGraph load failed: " + e.getMessage());
        }

        try {
            results.add(tryModel(filePath));
        } catch (Exception e) {
            System.err.println("Model load failed: " + e.getMessage());
        }

        try {
            results.add(tryGraph(filePath));
        } catch (Exception e) {
            System.err.println("Graph load failed: " + e.getMessage());
        }

        // Find the one with the max size
        Optional<LoadResult> best = results.stream()
            .max(Comparator.comparingLong(LoadResult::size));

        if (best.isPresent()) {
            this.dataset = best.get().dataset();
            return SparqlQueryResult.forBottomMsg("Archivo cargado correctamente usando: " +
                    best.get().method() + " con tamaño: " + best.get().size());
        } else {
            return SparqlQueryResult.forBottomMsg("Error: No se pudo cargar el archivo con ningún método.");
        }
    }



    private LoadResult tryDataset(String path) {
        Dataset ds = RDFDataMgr.loadDataset(path);
        long size = ds.getUnionModel().size();
        return new LoadResult("Dataset", ds, size);
    }

    private LoadResult tryModel(String path) {
        Model model = RDFDataMgr.loadModel(path);
        Dataset ds = DatasetFactory.create(model);
        long size =  model.size();
        return new LoadResult("Model", ds, size);
    }

   
    private LoadResult tryGraph(String path) {
        Graph graph = RDFDataMgr.loadGraph(path);
        Model model = ModelFactory.createModelForGraph(graph);
        Dataset ds = DatasetFactory.create(model);
        long size =  model.size();
        return new LoadResult("Graph", ds, size);
    }

    
    private LoadResult tryDatasetGraph(String path) {
        DatasetGraph dsGraph = RDFDataMgr.loadDatasetGraph(path);
        Dataset ds = DatasetFactory.wrap(dsGraph);
        long size = dsGraph.size();
        return new LoadResult("DatasetGraph", ds, size);
    }

    

    /**
     * Load RDF or quads from a URL (HTTP(s), etc.)
     */
    public SparqlQueryResult loadFromURL(String url) {
        try {
            RDFDataMgr.read(this.dataset,url);
            return SparqlQueryResult.forBottomMsg("Grafo remoto cargado correctamente");
        } catch (Exception e) {
            return SparqlQueryResult.forBottomMsg("Error al cargar grafo desde URL: " + e.getMessage());
        }
    }

    /**
     * Load when the format (Lang) is known / forced (e.g. unknown extension)
     */
    public SparqlQueryResult loadWithFormat(String filePath, Lang format) {
        File file = new File(filePath);
        if (!file.exists() || !file.canRead()) {
            return SparqlQueryResult.forBottomMsg("Archivo no accesible: " + filePath);
        }
        try (InputStream in = new FileInputStream(file)) {
            Dataset ds = RDFParser.create()
                .source(in)
                .lang(format)
                .errorHandler(ErrorHandlerFactory.errorHandlerStrict)
                .toDataset();
            this.dataset = ds;
            return SparqlQueryResult.forBottomMsg("Archivo cargado correctamente con formato " + format.getName());
        } catch (Exception e) {
            return SparqlQueryResult.forBottomMsg("Error al leer archivo: " + e.getMessage());
        }
    }

    /**
     * Merge RDF or quad content from a given source (file path or URL) into the existing dataset.
     * The dataset is not replaced, but augmented/merged.
     *
     * @param sourceUriOrPath a file path or URL string (e.g. "http://example.com/data.ttl" or "/path/to/file.ttl")
     * @return a result wrapper conveying success or failure message
     */
    public SparqlQueryResult mergeFromSource(String sourceUriOrPath) {
        if (sourceUriOrPath == null || sourceUriOrPath.isBlank()) {
            return SparqlQueryResult.forBottomMsg("Fuente inválida (cadena vacía): " + sourceUriOrPath);
        }

        boolean isUrl = isValidURL(sourceUriOrPath);

        // For file paths, check existence & readability
        if (!isUrl) {
            File f = new File(sourceUriOrPath);
            if (!f.exists() || !f.canRead()) {
                return SparqlQueryResult.forBottomMsg("Archivo no accesible: " + sourceUriOrPath);
            }
        }


        try {
            RDFDataMgr.read(this.dataset, sourceUriOrPath);
        	return SparqlQueryResult.forBottomMsg(
                String.format("Contenido agregado correctamente desde %s", sourceUriOrPath)
            );
        } catch (Exception e) {
            return SparqlQueryResult.forBottomMsg(
                String.format("Error agregando contenido desde %s: %s", sourceUriOrPath, e.getMessage())
            );
        }
    }


   
    
    private boolean isValidURL(String str) {
        try {
            URL url = URLs.newURL(str);
            String protocol = url.getProtocol();
            return "http".equalsIgnoreCase(protocol) || "https".equalsIgnoreCase(protocol);
        } catch (MalformedURLException e) {
            return false;
        }
    }
}