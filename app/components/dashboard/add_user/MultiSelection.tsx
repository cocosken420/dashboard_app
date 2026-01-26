import { useState, useRef, useEffect } from "react"

interface MultiSelectDropdownProps {
  options: string[]
  setSelected: (e: string[]) => void
  selected: string[]
}

const MultiSelectDropdown = ({ options, setSelected, selected }: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(o => o !== option))
    } else {
      setSelected([...selected, option])
    }
  }

  return (
    <div className="relative " ref={dropdownRef}>
      {/* Trigger */}
      <div
        className="cursor-pointer flex justify-between items-center px-4 py-2 border rounded-md  "
        onClick={() => setOpen(!open)}
      >
        <span>Wybierz branżę </span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>&#9662;</span>
      </div>

      {/* Dropdown list */}
      <div
        className={`absolute left-0 right-0 mt-1 bg-secondary border rounded-md shadow-md transition-all duration-200 ease-in-out z-50`}
      >
        {options
          .filter(opt => opt !== "X")
          .map(option => (
            <div
              key={option}
              className="flex items-center px-4 py-2   cursor-pointer"
              onClick={() => toggleOption(option)}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                readOnly
                className="mr-2"
              />
              <span>{option}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default MultiSelectDropdown
