import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';

const CustomSelect = ({ options, value, onChange, placeholder, label, icon, disabled, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (disabled) return;
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`custom-select-container ${className || ''}`} ref={containerRef} style={{ position: 'relative', minWidth: '200px' }}>
            {label && <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568' }}>{label}</label>}

            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'white',
                    border: isOpen ? '1px solid var(--primary-color)' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(66, 153, 225, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease',
                    opacity: disabled ? 0.6 : 1,
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: selectedOption ? '#2d3748' : '#a0aec0' }}>
                    {icon && <span style={{ color: 'var(--primary-color)' }}>{icon}</span>}
                    <span style={{ fontWeight: selectedOption ? '500' : '400' }}>
                        {selectedOption ? selectedOption.label : placeholder || 'Select...'}
                    </span>
                </div>
                <FaChevronDown
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        color: '#a0aec0',
                        fontSize: '0.8rem'
                    }}
                />
            </div>

            {isOpen && (
                <div
                    className="custom-select-options"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #e2e8f0',
                        zIndex: 1000,
                        maxHeight: '250px',
                        overflowY: 'auto',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            style={{
                                padding: '10px 16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'background 0.2s',
                                background: option.value === value ? '#ebf8ff' : 'transparent',
                                color: option.value === value ? 'var(--primary-color)' : '#4a5568',
                            }}
                            onMouseEnter={(e) => {
                                if (option.value !== value) e.currentTarget.style.background = '#f7fafc';
                            }}
                            onMouseLeave={(e) => {
                                if (option.value !== value) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {option.icon && <span>{option.icon}</span>}
                                <span>{option.label}</span>
                            </div>
                            {option.value === value && <FaCheck style={{ fontSize: '0.8rem' }} />}
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-select-options::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-select-options::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                .custom-select-options::-webkit-scrollbar-thumb {
                    background: #cbd5e0;
                    border-radius: 4px;
                }
                .custom-select-options::-webkit-scrollbar-thumb:hover {
                    background: #a0aec0;
                }
            `}</style>
        </div>
    );
};

export default CustomSelect;
