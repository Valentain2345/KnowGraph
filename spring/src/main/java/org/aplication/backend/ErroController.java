package org.aplication.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/error")
public class ErroController {
		
	@GetMapping("/")
	public String handleError() {
			    return "An error occurred while processing your request.";
	}
}
