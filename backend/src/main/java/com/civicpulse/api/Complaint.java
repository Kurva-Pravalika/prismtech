package com.civicpulse.api;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "complaints")
public class Complaint {

    @Id
    public String id;

    public String title;
    public String description;
    public String category;
    public String priority;
    public String status;
    public double lat;
    public double lng;
    public boolean emergency;

    public Complaint() {
    }

    public Complaint(String id, String title, String description,
                     String category, String priority, String status,
                     double lat, double lng, boolean emergency) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.lat = lat;
        this.lng = lng;
        this.emergency = emergency;
    }
}