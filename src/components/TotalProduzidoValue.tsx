import React, { memo } from 'react';

interface TotalProduzidoValueProps {
  produzidoMesVisible: boolean;
  produzidoMesDate: Date | undefined;
  productionResults: any[];
  filterProductionResultsByMonth: (results: any[], month: number, year: number) => any[];
}

const TotalProduzidoValue: React.FC<TotalProduzidoValueProps> = ({
  produzidoMesVisible,
  produzidoMesDate,
  productionResults,
  filterProductionResultsByMonth,
}) => {
  const [totalProduzido, setTotalProduzido] = React.useState(0);

  React.useEffect(() => {
    if (produzidoMesDate) {
      const total = filterProductionResultsByMonth(productionResults, produzidoMesDate.getMonth(), produzidoMesDate.getFullYear())
        .reduce((sum, result) => sum + (Number(result.price) || 0) + (Number(result.totalPrice) || 0), 0);
      setTotalProduzido(total);
    }
  }, [produzidoMesDate, productionResults, filterProductionResultsByMonth]);

  return (
    <>
      <p
        className="text-3xl font-bold mt-2"
        style={{ visibility: produzidoMesVisible ? 'visible' : 'hidden' }}
      >
        €{totalProduzido.toFixed(2)}
      </p>
      <p
        className="text-3xl font-bold mt-2"
        style={{ visibility: produzidoMesVisible ? 'hidden' : 'visible' }}
      >
        ******
      </p>
    </>
  );
};

export default memo(TotalProduzidoValue);
