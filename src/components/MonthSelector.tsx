import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthSelectorProps {
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ onMonthChange }) => {
  const [selectedMonth, setSelectedMonth] = useState('');

  const monthNames = ["Todos os meses", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

  const handleMonthChange = (monthIndex: string) => {
    if (monthIndex === '0') {
      setSelectedMonth('');
      onMonthChange('');
    } else {
      const month = parseInt(monthIndex) ;
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const formattedMonth = `${year}-${(month).toString().padStart(2, '0')}`;
      setSelectedMonth(formattedMonth);
      onMonthChange(formattedMonth);
    }
  };

  return (
    <Select onValueChange={handleMonthChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecionar Mês" />
      </SelectTrigger>
     <SelectContent>
        {monthNames.map((month, index) => (
          <SelectItem key={index} value={index.toString()}>
            {month}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MonthSelector;
