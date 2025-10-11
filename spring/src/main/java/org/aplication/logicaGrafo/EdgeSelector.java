package org.logicaGrafo;

import java.util.Iterator;

import org.apache.jena.rdf.model.Statement;

/** Strategy for selecting which edges (predicates) to include. */
public interface EdgeSelector {
    /** Return true if a statement (edge) should be included. */
    boolean include(Statement stmt);
    /** Get the label for the edge (e.g. from object or property). */
    String label(Statement stmt);
    Iterator<String> getAllowedUris();

}
