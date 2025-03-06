import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WeekSelectorProps {
  onWeekChange: (week: number) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ onWeekChange }) => {
  const [selectedWeek, setSelectedWeek] = useState('');

  const getWeeksInMonth = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const totalDays = lastDayOfMonth.getDate();
    let weekCount = 1;
    let currentWeekStart = 1;

    while (currentWeekStart <= totalDays) {
      currentWeekStart += 7;
      weekCount++;
    }

    return Math.min(weekCount, 6);
  };

  const weeksInMonth = getWeeksInMonth();
  const weekOptions = Array.from({ length: weeksInMonth - 1 }, (_, i) => i + 1);

  const handleWeekChange = (week: string) => {
    setSelectedWeek(week);
    onWeekChange(parseInt(week));
  };

  return (
    <Select onValueChange={handleWeekChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecionar Semana" />
      </SelectTrigger>
      <SelectContent>
        {weekOptions.map((week) => (
          <SelectItem key={week} value={week.toString()}>
            Semana {week}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default WeekSelector;
