import React, { useState, useEffect } from 'react';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({
  placeholder = "Поиск...",
  value = "",
  onChange,
  onSearch,
  delay = 300,
  className = "",
  inputClassName = "",
  iconClassName = "",
  showClearButton = true
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch && searchTerm !== value) {
        onSearch(searchTerm);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay, onSearch, value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onChange) {
      onChange('');
    }
    if (onSearch) {
      onSearch('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`flex items-center border rounded-lg transition-all duration-200 ${
        isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'
      }`}>
        <div className={`pl-3 pr-2 ${iconClassName}`}>
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`flex-1 py-2 pr-4 text-gray-700 focus:outline-none ${inputClassName}`}
          aria-label="Search input"
        />
        
        {showClearButton && searchTerm && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
            type="button"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;