import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    padding: 5,
    flex: 1,
    fontSize: 12,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
})

interface ReportPDFProps {
  products: Array<{
    id: string
    name: string
    stock: number
    basePrice: number
  }>
  barbers: Array<{
    id: string
    name: string
    services: number
    rating: number
    balance: number
    email: string;
    phone: string;
    unit: string;
  }>
  productionResults?: Array<{
    id: string;
    barberName: string;
    serviceName: string;
    date: string;
    totalPrice?: number;
    commission?: number;
    price?: number;
  }>
  totalCommission?: number;
  services?: Array<{
    id: string;
    name: string;
    price: number;
  }>
  filterBarber?: string | null;
}

export const ReportPDF = ({ products, barbers, productionResults, totalCommission, services, filterBarber }: ReportPDFProps) => {
  const totalBalance = (barbers || []).reduce((sum, barber) => sum + barber.balance, 0)
  const totalProducts = (products || []).reduce((sum, product) => sum + product.stock, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Relatório da Barbearia</Text>
          {filterBarber === 'services' ? (
            services && services.length > 0 && (
              <View>
                <Text style={styles.subtitle}>Serviços</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableCell}>Nome</Text>
                    <Text style={styles.tableCell}>Preço</Text>
                  </View>
                  {services.map((service) => (
                    <View key={service.id} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{service.name}</Text>
                      <Text style={styles.tableCell}>€{typeof service.price === 'number' ? service.price.toFixed(2) : '0.00'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          ) : (
            <>
              <Text style={styles.subtitle}>Barbeiros</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Nome</Text>
                  <Text style={styles.tableCell}>Email</Text>
                  <Text style={styles.tableCell}>Telefone</Text>
                  <Text style={styles.tableCell}>Unidade</Text>
                </View>
                {barbers.map((barber) => (
                  <View key={barber.id} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{barber.name}</Text>
                    <Text style={styles.tableCell}>{barber.email}</Text>
                    <Text style={styles.tableCell}>{barber.phone}</Text>
                    <Text style={styles.tableCell}>{barber.unit}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.subtitle}>Produtos</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Produto</Text>
                  <Text style={styles.tableCell}>Estoque</Text>
                    <Text style={styles.tableCell}>Preço</Text>
                </View>
                {products.map((product) => (
                  <View key={product.id} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{product.name}</Text>
                    <Text style={styles.tableCell}>{product.stock}</Text>
                    <Text style={styles.tableCell}>€{typeof product.basePrice === 'number' ? product.basePrice.toFixed(2) : '0.00'}</Text>
                  </View>
                ))}
              </View>
              {productionResults && productionResults.length > 0 && (
                <View>
                  <Text style={styles.subtitle}>Produção</Text>
                  <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={styles.tableCell}>Barbeiro</Text>
                      <Text style={styles.tableCell}>Serviço</Text>
                      <Text style={styles.tableCell}>Valor</Text>
                      <Text style={styles.tableCell}>Comissão</Text>
                      <Text style={styles.tableCell}>Data</Text>
                    </View>
                    {productionResults.map((result) => (
                      <View key={result.id} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{result.barberName}</Text>
                        <Text style={styles.tableCell}>{result.serviceName}</Text>
                        <Text style={styles.tableCell}>€{typeof result.totalPrice === 'number' ? result.totalPrice.toFixed(2) : typeof result.price === 'number' ? result.price.toFixed(2) : '0.00'}</Text>
                        <Text style={styles.tableCell}>€{typeof result.commission === 'number' ? result.commission.toFixed(2) : '0.00'}</Text>
                        <Text style={styles.tableCell}>{result.date}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
          <View style={styles.summary}>
            <Text>Resumo:</Text>
             <Text>Total em Comissões: €{typeof totalCommission === 'number' ? totalCommission.toFixed(2) : '0.00'}</Text>
            <Text>Total de Produtos em Estoque: {totalProducts}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
