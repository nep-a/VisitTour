import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';

const Dropdown = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    searchable = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = searchable
        ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
            <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <FaChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
            </div>
            {isOpen && (
                <div className="dropdown-menu">
                    {searchable && (
                        <div className="dropdown-search">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                    <div className="dropdown-options">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    className={`dropdown-option ${value === opt.value ? 'selected' : ''}`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="dropdown-no-results">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
