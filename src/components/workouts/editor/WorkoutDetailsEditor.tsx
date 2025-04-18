import React from 'react';
import type { WorkoutFormData } from '../../../hooks/useWorkoutEditor';

interface WorkoutDetailsEditorProps {
  formData: WorkoutFormData;
  onChange: (field: keyof WorkoutFormData, value: any) => void;
}

export function WorkoutDetailsEditor({ formData, onChange }: WorkoutDetailsEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium dark:text-gray-300">
          Workout Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium dark:text-gray-300">
            Workout Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => onChange('type', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
                <option value="weight training">Weight Training</option>
                <option value="cardio">Cardio</option>
                <option value="metcon">Metcon</option>
          </select>
        </div>

        <div>
          <label htmlFor="scheduled_date" className="block text-sm font-medium dark:text-gray-300">
            Schedule Date
          </label>
          <input
            type="date"
            id="scheduled_date"
            value={formData.scheduled_date}
            onChange={(e) => onChange('scheduled_date', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_wod"
          checked={formData.is_wod}
          onChange={(e) => onChange('is_wod', e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <label htmlFor="is_wod" className="text-sm font-medium dark:text-gray-300">
          Workout of the Day
        </label>
      </div>
    </div>
  );
}
