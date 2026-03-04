import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({ 
    family: "Roboto", 
    src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff", 
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Roboto" },
  section: { marginBottom: 10 },
  header: { fontSize: 18, marginBottom: 10 },
  text: { fontSize: 12 },
  total: { fontSize: 14, fontWeight: "bold", marginTop: 10 }
});

const BillPDF = ({ bill, details }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Chi tiết đơn hàng</Text>
        <Text style={styles.text}>Mã đơn: {bill.order_id}</Text>
        <Text style={styles.text}>Thanh toán: {bill.payment_method}</Text>
        <Text style={styles.text}>
          Ngày tạo: {new Date(bill.created_at).toLocaleString("vi-VN")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Danh sách món</Text>
        {details.map(item => (
          <Text key={item.id} style={styles.text}>
            {item.menu_item?.name} - SL: {item.quantity} -{" "}
            {Number(item.total_price).toLocaleString("vi-VN")} đ
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.total}>
          Tổng tiền: {Number(bill.total_amount).toLocaleString("vi-VN")} đ
        </Text>
      </View>
    </Page>
  </Document>
);

export default BillPDF;
