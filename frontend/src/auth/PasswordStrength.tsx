// File: src/auth/PasswordStrength.tsx
import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ValidationCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialChar: boolean;
}

interface Props {
  password?: string;
}

const Requirement: React.FC<{ text: string; met: boolean }> = ({ text, met }) => (
    <div className={`flex items-center text-xs transition-colors ${met ? 'text-green-600' : 'text-gray-500'}`}>
        {met ? <CheckCircle2 size={14} className="mr-2" /> : <XCircle size={14} className="mr-2" />}
        {text}
    </div>
);

const PasswordStrength: React.FC<Props> = ({ password = '' }) => {
    const criteria: ValidationCriteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        specialChar: /[\W_]/.test(password),
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <Requirement text="At least 8 characters" met={criteria.length} />
            <Requirement text="At least one uppercase letter" met={criteria.uppercase} />
            <Requirement text="At least one lowercase letter" met={criteria.lowercase} />
            <Requirement text="At least one number" met={criteria.number} />
            <Requirement text="At least one special character" met={criteria.specialChar} />
        </div>
    );
};

export default PasswordStrength;