import React from 'react';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

export const getValidationState = (required, touched, error, warning) => {
    if (touched && error) {
        return "error";
    }
    if (touched && warning) {
        return "warning";
    }
    if (touched) {
        return required ? "success" : null;
    }
    return null;
};

export const FormField = ({
    input, attrs, label, placeholder = label, type, componentClass, children, required, meta: { touched, error, warning } = {}
}) => (
    <FormGroup controlId={input.name} validationState={getValidationState(required || input.value, touched, error, warning)}>
        {
            label &&
            <ControlLabel>
                {label}
                {
                    required && <strong className="text-danger"> *</strong>
                }
            </ControlLabel>
        }
        <FormControl {...input} {...attrs} placeholder={placeholder} type={type} componentClass={componentClass} title={(touched && (error || warning)) || ''}>
            {children}
        </FormControl>
    </FormGroup>
);