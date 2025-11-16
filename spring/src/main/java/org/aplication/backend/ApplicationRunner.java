
package org.aplication.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableAutoConfiguration
@ComponentScan
public class ApplicationRunner implements CommandLineRunner {

	@Value("${name:World}")
	private String name;
	
	@Override
	public void run(String... args) {
		System.out.println("Hello "+name);
	}

	public static void main(String[] args) {
		SpringApplication.run(ApplicationRunner.class, args);
	}
}
