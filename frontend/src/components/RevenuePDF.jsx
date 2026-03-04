import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Use default Helvetica font (built-in)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#0077b6",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#0077b6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  brandText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0077b6",
  },
  brandSubtext: {
    fontSize: 10,
    color: "#666666",
  },
  reportTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333333",
  },
  reportDate: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  summaryCards: {
    flexDirection: "row",
    marginBottom: 25,
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  summaryCardLabel: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 5,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0077b6",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0077b6",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  colOrderId: { width: "15%" },
  colPayment: { width: "15%" },
  colDate: { width: "20%" },
  colStatus: { width: "15%" },
  colDiscount: { width: "15%" },
  colTotal: { width: "20%", textAlign: "right" },
  cellText: { fontSize: 9, color: "#333333", textAlign: "center" },
  cellTotal: { fontSize: 9, fontWeight: "bold", color: "#0077b6", textAlign: "right" },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#0077b6",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: "#666666",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 15,
    backgroundColor: "#0077b6",
    borderRadius: 6,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 9,
    color: "#999999",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 10,
  },
  note: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  noteText: {
    fontSize: 10,
    color: "#92400E",
  },
});

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateOnly = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("vi-VN");
};

const getStatusStyle = (status) => {
  const statusStyles = {
    Pending: { bg: "#FEF3C7", color: "#92400E", text: "Cho" },
    Cooking: { bg: "#DBEAFE", color: "#1E40AF", text: "Nau" },
    Ready: { bg: "#D1FAE5", color: "#065F46", text: "San sang" },
    Completed: { bg: "#D1FAE5", color: "#065F46", text: "Hoan thanh" },
    Refund: { bg: "#FEE2E2", color: "#991B1B", text: "Hoan" },
  };
  return statusStyles[status] || { bg: "#E5E7EB", color: "#374151", text: status };
};

// Create PDF Document
const createRevenueDocument = (bills = [], storeName = "Acute Restaurant", date = new Date()) => {
  // Calculate statistics
  const totalRevenue = bills.reduce((sum, order) => {
    const discount = Number(order.discount_amount || 0);
    let refundAmount = 0;
    if (order.status === "Refund") {
      refundAmount += Number(order.total_amount);
    }
    const netSales = Number(order.total_amount) - discount - refundAmount;
    return sum + netSales;
  }, 0);

  const totalDiscount = bills.reduce((sum, order) => {
    return sum + Number(order.discount_amount || 0);
  }, 0);

  const totalRefund = bills.reduce((sum, order) => {
    if (order.status === "Refund") {
      return sum + Number(order.total_amount);
    }
    return sum;
  }, 0);

  const grossRevenue = bills.reduce((sum, order) => {
    return sum + Number(order.total_amount);
  }, 0);

  const orderCount = bills.length;
  const averageOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

  const cashPayments = bills.filter(b => b.payment_method === "Cash").length;
  const momoPayments = bills.filter(b => b.payment_method === "Momo").length;

  const todayStr = new Date(date).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandContainer}>
              <View style={styles.brandIcon}>
                <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}>A</Text>
              </View>
              <View>
                <Text style={styles.brandText}>{storeName}</Text>
                <Text style={styles.brandSubtext}>Bao cao doanh thu</Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.reportTitle}>DOANH THU</Text>
            <Text style={styles.reportDate}>{todayStr}</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { borderLeftColor: "#22c55e" }]}>
            <Text style={styles.summaryCardLabel}>Doanh thu thuan</Text>
            <Text style={[styles.summaryCardValue, { color: "#22c55e" }]}>
              {formatCurrency(totalRevenue)} d
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: "#0077b6" }]}>
            <Text style={styles.summaryCardLabel}>Tong don</Text>
            <Text style={[styles.summaryCardValue, { color: "#0077b6" }]}>
              {orderCount}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: "#8B5CF6" }]}>
            <Text style={styles.summaryCardLabel}>TB/don</Text>
            <Text style={[styles.summaryCardValue, { color: "#8B5CF6" }]}>
              {formatCurrency(averageOrder)} d
            </Text>
          </View>
        </View>

        {/* Orders Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CHI TIET DON HANG</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colOrderId]}>Ma don</Text>
              <Text style={[styles.tableHeaderText, styles.colPayment]}>Thanh toan</Text>
              <Text style={[styles.tableHeaderText, styles.colDate]}>Ngay</Text>
              <Text style={[styles.tableHeaderText, styles.colStatus]}>Trang thai</Text>
              <Text style={[styles.tableHeaderText, styles.colDiscount]}>Giam gia</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Tong tien</Text>
            </View>

            {bills.map((order, index) => {
              const statusStyle = getStatusStyle(order.status);
              const discount = Number(order.discount_amount || 0);
              const netSales = Number(order.total_amount) - discount;

              return (
                <View key={order.id || index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.cellText, styles.colOrderId]}>#{order.order_id}</Text>
                  <Text style={[styles.cellText, styles.colPayment]}>
                    {order.payment_method === "Momo" ? "MoMo" : "Cash"}
                  </Text>
                  <Text style={[styles.cellText, styles.colDate]}>{formatDateOnly(order.created_at)}</Text>
                  <View style={[styles.colStatus, { alignItems: "center" }]}>
                    <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={{ color: statusStyle.color, fontSize: 7, fontWeight: "bold" }}>
                        {statusStyle.text}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.cellText, styles.colDiscount, { color: discount > 0 ? "#22c55e" : "#333" }]}>
                    {discount > 0 ? `-${formatCurrency(discount)}` : "0"}
                  </Text>
                  <Text style={[styles.cellTotal, styles.colTotal]}>
                    {formatCurrency(netSales)} d
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tong doanh thu gross:</Text>
            <Text style={styles.totalValue}>{formatCurrency(grossRevenue)} d</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tong giam gia:</Text>
            <Text style={[styles.totalValue, { color: "#22c55e" }]}>
              -{formatCurrency(totalDiscount)} d
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tong hoan don:</Text>
            <Text style={[styles.totalValue, { color: "#ef4444" }]}>
              -{formatCurrency(totalRefund)} d
            </Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>DOANH THU THUAN</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(totalRevenue)} d</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>PHUONG THUC THANH TOAN</Text>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <View style={{ flex: 1, backgroundColor: "#f8f9fa", padding: 15, borderRadius: 6 }}>
              <Text style={{ fontSize: 10, color: "#666" }}>Tien mat (Cash)</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>{cashPayments} don</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#f8f9fa", padding: 15, borderRadius: 6 }}>
              <Text style={{ fontSize: 10, color: "#666" }}>MoMo</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>{momoPayments} don</Text>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            * Doanh thu thuan = Tong tien - Giam gia - Hoan don
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Bao cao duoc tao tu dong boi {storeName}</Text>
          <Text>Ngay tao: {new Date().toLocaleString("vi-VN")}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Export both the component and a helper function
export { createRevenueDocument };
export default function RevenuePDF({ bills, storeName, date }) {
  return createRevenueDocument(bills, storeName, date);
}

