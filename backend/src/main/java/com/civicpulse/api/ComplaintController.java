package com.civicpulse.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintRepository repository;

    public ComplaintController(ComplaintRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/complaints")
    public Collection<Complaint> all() {
        return repository.findAll();
    }

    @PostMapping("/complaints")
    public ResponseEntity<Complaint> create(
            @RequestBody Complaint complaint) {

        if (complaint.status == null) {
            complaint.status = "Submitted";
        }

        Complaint saved = repository.save(complaint);

        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/complaints/{id}/status")
    public ResponseEntity<Complaint> status(
            @PathVariable String id,
            @RequestParam String value) {

        Complaint complaint =
                repository.findById(id).orElse(null);

        if (complaint == null) {
            return ResponseEntity.notFound().build();
        }

        complaint.status = value;

        return ResponseEntity.ok(
                repository.save(complaint)
        );
    }

    @GetMapping("/health")
    public Map<String, Object> health() {

        return Map.of(
                "service", "CivicPulse API",
                "status", "UP",
                "timestamp", new Date().toString()
        );
    }
}