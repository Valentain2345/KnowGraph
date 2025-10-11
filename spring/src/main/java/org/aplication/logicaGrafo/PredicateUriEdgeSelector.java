package org.logicaGrafo;

import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Statement;

/** EdgeSelector by predicate URI membership. */
public class PredicateUriEdgeSelector implements EdgeSelector {
   private final Set<String> allowedPredicates;

   public PredicateUriEdgeSelector(Collection<String> uris) {
       this.allowedPredicates = new HashSet<>(uris);
   }

   @Override
   public boolean include(Statement st) {
       return allowedPredicates.contains(st.getPredicate().getURI());
   }

   @Override
   public String label(Statement st) {
       RDFNode obj = st.getObject();
       if (obj.isLiteral()) {
           return obj.asLiteral().getString();
       } else if (obj.isResource()) {
           return obj.asResource().isURIResource()
               ? obj.asResource().getURI()
               : "_:" + obj.asResource().getId().getLabelString();
       }
       return obj.toString();
   }

   @Override
   public Iterator<String> getAllowedUris() {
	return allowedPredicates.iterator();
   }
   
   
}