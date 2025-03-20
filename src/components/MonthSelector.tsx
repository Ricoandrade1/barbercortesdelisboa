import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthSelectorProps {
  onMonthChange: (month: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ onMonthChange }) => {
  const [selectedMonth, setSelectedMonth] = useState('');

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    onMonthChange(parseInt(month));
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
