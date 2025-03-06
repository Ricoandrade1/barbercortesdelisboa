import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";

interface DatePickerCardProps {
  onDateChange: (date: Date | undefined) => void;
  defaultDate?: Date;
}

const DatePickerCard: React.FC<DatePickerCardProps> = ({ onDateChange, defaultDate }) => {
  const [date, setDate] = useState<Date | undefined>(defaultDate);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    onDateChange(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar Data'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          locale={ptBR}
          defaultMonth={defaultDate}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerCard;
