import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateFilterProps {
  onDateChange: (date: Date | undefined) => void;
  fetchData: (date?: Date) => Promise<void>;
}

const DateFilter: React.FC<DateFilterProps> = ({ onDateChange, fetchData }) => {
  const [date, setDate] = useState<Date | undefined>(undefined);

 const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onDateChange(newDate);
    fetchData(newDate);
  };

  return (
    <div className="flex items-center justify-end mb-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"outline"} >
            {/* @ts-ignore */}
            {format(date || new Date(), 'dd/MM/yyyy', { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={handleDateSelect}
            locale={ptBR}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateFilter;
