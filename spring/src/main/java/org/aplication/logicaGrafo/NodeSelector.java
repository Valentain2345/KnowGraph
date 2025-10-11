package org.logicaGrafo;

import java.util.Iterator;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

/** Strategy for selecting which nodes (resources) to include. */
public interface NodeSelector {
    /** Return true if this resource should be included as a node. */
    boolean include(Resource res, Model model);
    /** Get the label for a node. */
    String label(Resource res);
    
    Iterator<String> getAllowedUris();
}
