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
    <div ref={dropdownRef} className={`relative ${width}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 rounded-xl bg-yellow-50 border border-black/25 hover:bg-yellow-100 focus:outline-none focus:bg-yellow-100 focus:border-black/40 transition-colors duration-150 flex items-center justify-between px-3 text-black font-black text-base"
      >
        <span>{value}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 text-black shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-yellow-50 border border-black/25 rounded-xl z-50 overflow-hidden shadow-lg">
          <div className="max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <button
                type="button"
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-left font-bold text-base transition-colors duration-100 ${
                  value === option
                    ? "bg-black text-yellow-300"
                    : "text-black hover:bg-yellow-100"
                } ${index !== options.length - 1 ? "border-b border-black/10" : ""}`}
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
