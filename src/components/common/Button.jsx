import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Button.css';

function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    onClick,
    disabled = false,
    fullWidth = false,
    className = ''
}) {
    const buttonClass = `
    btn
    btn-${variant}
    btn-${size}
    ${fullWidth ? 'btn-full' : ''}
    ${disabled ? 'btn-disabled' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <button
            className={buttonClass}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span className="btn-icon-left">{icon}</span>}
            <span>{children}</span>
        </button>
    );
}

export default Button;
