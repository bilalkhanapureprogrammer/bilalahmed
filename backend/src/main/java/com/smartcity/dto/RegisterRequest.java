package com.smartcity.dto;
import lombok.Data;
@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String role; // "CITIZEN", "OFFICIAL", "ADMIN", or "DEPARTMENT"
    private String departmentName;
}