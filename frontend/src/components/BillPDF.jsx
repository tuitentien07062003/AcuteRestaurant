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
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#0077b6",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 30,
    height: 30,
    backgroundColor: "#0077b6",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  brandText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0077b6",
  },
  brandSubtext: {
    fontSize: 10,
    color: "#666666",
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 10,
    color: "#666666",
  },
  infoValue: {
    flex: 1,
    fontSize: 11,
    color: "#333333",
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0077b6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  col1: { width: "45%" },
  col2: { width: "15%", textAlign: "center" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  itemName: { fontSize: 10, color: "#333333" },
  itemQty: { fontSize: 10, color: "#333333", textAlign: "center" },
  itemPrice: { fontSize: 10, color: "#333333", textAlign: "right" },
  itemTotal: { fontSize: 10, fontWeight: "bold", color: "#0077b6", textAlign: "right" },
  summarySection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    backgroundColor: "#0077b6",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  totalValue: {
    fontSize: 16,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
  },
});

const formatDate = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  return Number(amount).toLocaleString("vi-VN");
};

const getStatusStyle = (status) => {
  const statusStyles = {
    Pending: { bg: "#FEF3C7", color: "#92400E" },
    Cooking: { bg: "#DBEAFE", color: "#1E40AF" },
    Ready: { bg: "#D1FAE5", color: "#065F46" },
    Completed: { bg: "#D1FAE5", color: "#065F46" },
    Refund: { bg: "#FEE2E2", color: "#991B1B" },
  };
  return statusStyles[status] || { bg: "#E5E7EB", color: "#374151" };
};

// Create PDF Document
const createBillDocument = (bill, details, storeName = "Acute Restaurant") => {
  const statusStyle = getStatusStyle(bill?.status);
  const discount = Number(bill?.discount_amount || 0);
  const total = Number(bill?.total_amount || 0);
  const subtotal = total + discount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandContainer}>
              <View style={styles.brandIcon}>
                <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "bold" }}>A</Text>
              </View>
              <View>
                <Text style={styles.brandText}>{storeName}</Text>
                <Text style={styles.brandSubtext}>Hoa don thanh toan</Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.invoiceTitle}>HOA DON</Text>
            <Text style={{ fontSize: 10, color: "#666666" }}>
              #{bill?.order_id || "N/A"}
            </Text>
          </View>
        </View>

        {/* Bill Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ma don hang:</Text>
            <Text style={styles.infoValue}>#{bill?.order_id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngay tao:</Text>
            <Text style={styles.infoValue}>{formatDate(bill?.created_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phuong thuc:</Text>
            <Text style={styles.infoValue}>{bill?.payment_method || "Cash"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trang thai:</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={{ color: statusStyle.color, fontWeight: "bold" }}>{bill?.status}</Text>
            </View>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Ten mon</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>SL</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Don gia</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Thanh tien</Text>
          </View>

          {/* Table Rows */}
          {details?.map((item, index) => (
            <View key={item.id || index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.itemName, styles.col1]}>{item.menu_item?.name || "Unknown"}</Text>
              <Text style={[styles.itemQty, styles.col2]}>{item.quantity}</Text>
              <Text style={[styles.itemPrice, styles.col3]}>
                {formatCurrency(item.total_price / item.quantity)} d
              </Text>
              <Text style={[styles.itemTotal, styles.col4]}>
                {formatCurrency(item.total_price)} d
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tam tinh:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)} d</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giam gia:</Text>
              <Text style={[styles.summaryValue, { color: "#22c55e" }]}>
                -{formatCurrency(discount)} d
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TONG CONG</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)} d</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Cam on quy khach da su dung dich vu!</Text>
          <Text style={{ marginTop: 5 }}>
            {storeName} - Generated on {new Date().toLocaleString("vi-VN")}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Export both the component and a helper function
export { createBillDocument };
export default function BillPDF({ bill, details, storeName }) {
  return createBillDocument(bill, details, storeName);
}

