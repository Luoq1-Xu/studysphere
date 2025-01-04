import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from './ui/form';

interface TimePickerProps {
  name: string;
  label: string;
  description?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export const TimePicker: React.FC<TimePickerProps> = ({ name, label, description }) => {
  const { control } = useFormContext();

  return (
    <FormItem id="time-picker">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="flex space-x-2">
          <Controller
            name={`${name}.hour`}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name={`${name}.minute`}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage/>
    </FormItem>
  );
};