package org.logicaGrafo;

import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.StmtIterator;
import org.apache.jena.vocabulary.RDF;

/** NodeSelector by RDF type membership (node classes). */
public class RdfTypeNodeSelector implements NodeSelector {
   private final Set<String> allowedTypeUris;

   public RdfTypeNodeSelector(Collection<String> typeUris) {
       this.allowedTypeUris = new HashSet<>(typeUris);
   }

   @Override
   public boolean include(Resource res, Model model) {
       StmtIterator it = model.listStatements(res, RDF.type, (RDFNode) null);
       while (it.hasNext()) {
           Statement st = it.next();
           if (allowedTypeUris.contains(st.getObject().toString())) {
               return true;
           }
       }
       return false;
   }

   @Override
   public String label(Resource res) {
       return nodeLabelDefault(res);
   }

   private String nodeLabelDefault(Resource r) {
       if (r.isURIResource()) return r.getURI();
       else if (r.isAnon()) return "_:" + r.getId().getLabelString();
       else return r.toString();
   }

   @Override
   public Iterator<String> getAllowedUris() {
	// TODO Auto-generated method stub
	return allowedTypeUris.iterator();
   }
}
