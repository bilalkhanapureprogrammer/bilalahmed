package com.smartcity.dto;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class RechargeRequest {
    private BigDecimal amount;
    private String method; // "Online","UPI","Counter","Card"
}