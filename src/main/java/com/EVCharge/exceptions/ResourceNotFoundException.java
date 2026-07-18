package com.EVCharge.exceptions;

public class ResourceNotFoundException extends RuntimeException{
    public String getMessage(){
        return super.getMessage();
    }
    public ResourceNotFoundException(String message){
        super(message);
    }
}
