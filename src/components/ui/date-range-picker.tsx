import React from 'react';

interface DateRangePickerProps {
  value?: {
    start?: string;
    end?: string;
  };
  onChange?: (range: { start?: string; end?: string }) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value = {},
  onChange,
  className
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({
      ...value,
      start: e.target.value
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({
      ...value,
      end: e.target.value
    });
  };

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">From</label>
        <input
          type="date"
          value={value.start || ''}
          onChange={handleStartDateChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">To</label>
        <input
          type="date"
          value={value.end || ''}
          onChange={handleEndDateChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};
