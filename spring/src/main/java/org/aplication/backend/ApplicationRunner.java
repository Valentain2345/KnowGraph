
package org.aplication.backend;

import org.aplication.backend.sparql.SparqlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableAutoConfiguration
@ComponentScan
public class ApplicationRunner implements CommandLineRunner {

	
	@Autowired
	private SparqlService sparqlService;

	@Override
	public void run(String... args) {
		System.out.println(this.sparqlService.getHelloMessage());
	}

	public static void main(String[] args) {
		SpringApplication.run(ApplicationRunner.class, args);
	}
}
