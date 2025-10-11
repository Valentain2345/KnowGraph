package org.logicaGrafo;

import java.util.HashSet;
import java.util.Set;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.StmtIterator;

/** Filter (or project) a model to one that respects given selectors. */
public class GraphModelFilter {
   public static Model filter(Model source, NodeSelector nodeSel, EdgeSelector edgeSel) {
       Model out = ModelFactory.createDefaultModel();
       Set<Resource> allowedNodes = new HashSet<>();
       ResIterator rit = source.listSubjects();
       while (rit.hasNext()) {
           Resource r = rit.next();
           if (nodeSel.include(r, source)) {
               allowedNodes.add(r);
           }
       }
       // For each statement, include if subject is allowed & edgeSel says include.
       StmtIterator sit = source.listStatements();
       while (sit.hasNext()) {
           Statement st = sit.next();
           if (allowedNodes.contains(st.getSubject()) && edgeSel.include(st)) {
               out.add(st);
           }
       }
       return out;
   }
}
