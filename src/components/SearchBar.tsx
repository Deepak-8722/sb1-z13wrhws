import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { BuildingCategory } from '../types/campus';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: BuildingCategory | 'all';
  onCategoryChange: (category: BuildingCategory | 'all') => void;
}

const categories: { value: BuildingCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Buildings' },
  { value: 'academic', label: 'Academic' },
  { value: 'library', label: 'Libraries' },
  { value: 'dining', label: 'Dining' },
  { value: 'residential', label: 'Residential' },
  { value: 'recreation', label: 'Recreation' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'parking', label: 'Parking' },
  { value: 'emergency', label: 'Emergency' }
];

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search buildings, departments, or services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Filter className="h-5 w-5" />
          Filters
        </button>
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as BuildingCategory | 'all')}
            className="w-full lg:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}