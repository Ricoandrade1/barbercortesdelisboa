import React, { memo } from 'react';

interface TotalReceberValueProps {
  totalReceberVisible: boolean;
  totalReceberDate: Date | undefined;
  productionResults: any[];
  filterProductionResultsByMonth: (results: any[], month: number, year: number) => any[];
}

const TotalReceberValue: React.FC<TotalReceberValueProps> = ({
  totalReceberVisible,
  totalReceberDate,
  productionResults,
  filterProductionResultsByMonth,
}) => {
  const calculateTotalEarnings = (results: any[]) => {
    return results.reduce((sum, result) => {
      if (result.serviceName === 'Product Sale') {
        return sum + ((Number(result.totalPrice) || 0) / 1.23) * 0.20;
      } else {
        return sum + (Number(result.commission) || (Number(result.price) || 0) * 0.4);
      }
    }, 0);
  };

  return (
    <>
      <p
        className="text-3xl font-bold mt-2"
        style={{ visibility: totalReceberVisible ? 'visible' : 'hidden' }}
      >
        {totalReceberDate ? `€${calculateTotalEarnings(filterProductionResultsByMonth(productionResults, totalReceberDate.getMonth(), totalReceberDate.getFullYear())).toFixed(2)}` : '€0.00'}
      </p>
      <p
        className="text-3xl font-bold mt-2"
        style={{ visibility: totalReceberVisible ? 'hidden' : 'visible' }}
      >
        ******
      </p>
    </>
  );
};

export default memo(TotalReceberValue);
