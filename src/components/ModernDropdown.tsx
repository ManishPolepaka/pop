import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ModernDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
}

const ModernDropdown = ({
  options,
  value,
  onChange,
  width = "w-20",
}: ModernDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${width} h-11 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 flex items-center justify-between px-2 text-black font-bold text-base`}
      >
        <span>{value}</span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 text-gray-600 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left font-semibold text-base transition-all duration-150 ${
                  value === option
                    ? "bg-yellow-600 text-white"
                    : "text-black hover:bg-yellow-100 hover:text-black"
                } ${index !== options.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDropdown;
