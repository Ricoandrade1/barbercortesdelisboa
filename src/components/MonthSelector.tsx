import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthSelectorProps {
  onMonthChange: (month: string | number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ onMonthChange }) => {
  const [selectedMonth, setSelectedMonth] = useState('');

  const monthNames = ["Todos os meses", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

 const handleMonthChange = (monthIndex: string) => {
    if (monthIndex === '0') {
      setSelectedMonth('');
      onMonthChange('Todos');
    } else {
      const month = parseInt(monthIndex) - 1;
      setSelectedMonth(month.toString());
      onMonthChange(month);
    }
     console.log('Mês selecionado:', monthIndex);
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
