import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

function Dropdown({ label, options, isOpen, onToggle, onSelect, selected }) {
  return (
    <div className="relative w-48">
      {/* Button */}
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full border border-gray-300 px-4 py-2 bg-white text-black"
      >
        {selected || label}
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute mt-1 w-full max-h-60 overflow-y-auto border border-gray-200 bg-white shadow-lg z-10 text-black">
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => onSelect(label, opt)}
              className="px-4 py-2 hover:bg-gray-100 bg-slate-100 m-2 cursor-pointer"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function FilterBar() {
  const [openDropdown, setOpenDropdown] = useState(null); // which dropdown is open
  const [selectedValues, setSelectedValues] = useState({}); // store selected values
 
  const filterOptions = {
    "Shoe Size (IND)": ["6", "7", "8", "9", "10", "11"],
    Brand: ["Nike", "Adidas", "Puma", "New Balance", "Reebok"],
    Color: ["Black", "White", "Blue", "Red", "Green", "Grey"],
    Gender: ["Men", "Women", "Kids"],
    Price: ["Under ₹2000", "₹2000 - ₹5000", "₹5000 - ₹10000", "Above ₹10000"],
    "Sort by": ["Popularity", "Newest", "Price: Low to High", "Price: High to Low"],
  };

  const handleToggle = (label) => {
    setOpenDropdown(openDropdown === label ? null : label); // toggle open/close
  };

  const handleSelect = (label, value) => {
    setSelectedValues((prev) => ({ ...prev, [label]: value }));
    setOpenDropdown(null); // close after selecting
  };

  return (
    <div className="flex flex-wrap gap-4 px-20 bg-white shadow-sm">
      {Object.entries(filterOptions).map(([label, options], idx) => (
        <Dropdown
          key={idx}
          label={label}
          options={options}
          isOpen={openDropdown === label}
          onToggle={() => handleToggle(label)}
          onSelect={handleSelect}
          selected={selectedValues[label]}
        />
      ))}
    </div>
  );
}
