import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface DateSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function DateSelector({ selectedDate, onChange }: DateSelectorProps) {
  const handlePrevDay = () => {
    onChange(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    onChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-4 p-4 rounded-lg bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 shadow-md transition-all duration-300">
      <button
        onClick={handlePrevDay}
        className="p-2 hover:dark:bg-gray-700 rounded-full"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-5 w-5 dark:text-gray-300" />
      </button>
      
      <div className="flex items-center space-x-4">
        <span className="text-lg font-medium dark:text-gray-100">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </span>
        <button
          onClick={handleToday}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Today
        </button>
      </div>

      <button
        onClick={handleNextDay}
        className="p-2 hover:dark:bg-gray-700 rounded-full"
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5 dark:text-gray-300" />
      </button>
    </div>
  );
}
