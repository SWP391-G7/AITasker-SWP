/**
 * Frontend module: Services/pdfExportService.js
 *
 * Vai trò: Service PDF Export Service: đóng gói logic tạo và tải về file PDF cho Admin, Client, và Expert.
 * Luồng chính: Nhận dữ liệu dữ liệu cần xuất, định dạng văn bản / bảng biểu bằng jsPDF, và kích hoạt download file.
 * Lưu ý bảo trì: Giữ quy chuẩn styling thống nhất (màu sắc, font chữ, lề) trên toàn bộ báo cáo PDF.
 */
import { jsPDF } from 'jspdf'
import { createAnalyticsReportPdf } from './analyticsPdfService'

const colors = {
  navy: [8, 21, 45],
  blue: [37, 99, 235],
  cyan: [20, 184, 166],
  text: [15, 23, 42],
  muted: [100, 116, 139],
  border: [203, 213, 225],
  panel: [248, 250, 252],
  white: [255, 255, 255],
}

/**
 * Xuất báo cáo Analytics PDF cho Admin Dashboard
 */
export const downloadAnalyticsReportPdf = ({ year, analyticsData }) => {
  const doc = createAnalyticsReportPdf({ year, analyticsData })
  doc.save(`aitasker-analytics-report-${year}.pdf`)
}

/**
 * Format tiền tệ USD
 */
const formatMoney = (amount) => {
  const val = Number(amount) || 0
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format ngày tháng
 */
const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A'
  const date = new Date(dateVal)
  if (Number.isNaN(date.getTime())) return String(dateVal)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

/**
 * Vẽ Header chung cho các file báo cáo Billing / Earnings
 */
const drawStatementHeader = (doc, { title, userName, userRole, stats = [] }) => {
  // Top Banner
  doc.setFillColor(...colors.navy)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(...colors.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('AITasker', 15, 14)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(title, 15, 22)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 22, { align: 'right' })

  // Account Info section
  doc.setTextColor(...colors.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Account Statement - ${userRole}`, 15, 38)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...colors.muted)
  doc.text(`Account Holder: ${userName || 'Valued User'}`, 15, 45)
  doc.text(`Date Range: Lifetime to Date (${new Date().toLocaleDateString()})`, 15, 51)

  doc.setDrawColor(...colors.border)
  doc.setLineWidth(0.3)
  doc.line(15, 56, 195, 56)

  // Stat summary row
  if (stats.length > 0) {
    const cardWidth = (180 - (stats.length - 1) * 6) / stats.length
    stats.forEach((stat, index) => {
      const x = 15 + index * (cardWidth + 6)
      doc.setFillColor(...colors.panel)
      doc.setDrawColor(...colors.border)
      doc.roundedRect(x, 61, cardWidth, 18, 2, 2, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...colors.muted)
      doc.text(String(stat.label || '').toUpperCase(), x + 4, 67)

      doc.setFontSize(11)
      doc.setTextColor(...colors.navy)
      doc.text(String(stat.value || '$0.00'), x + 4, 74)
    })
  }
}

/**
 * Vẽ footer từng trang
 */
const drawStatementFooter = (doc, reportType) => {
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...colors.border)
    doc.line(15, 282, 195, 282)
    doc.setTextColor(...colors.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text(`AITasker Platform - ${reportType}`, 15, 287)
    doc.text(`Page ${page} of ${pageCount}`, 195, 287, { align: 'right' })
  }
}

/**
 * Tải về Client Billing Statement PDF
 */
export const downloadClientBillingPdf = ({ user, transactions = [], stats = {} }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  const summaryStats = [
    { label: 'Available Budget', value: formatMoney(stats.budget || 0) },
    { label: 'In Escrow', value: formatMoney(stats.inEscrow || 0) },
    { label: 'Recorded Spend', value: formatMoney(stats.totalLifetime || 0) },
  ]

  drawStatementHeader(doc, {
    title: 'Client Payment & Escrow Statement',
    userName: user?.name || user?.email || 'Client',
    userRole: 'Client',
    stats: summaryStats,
  })

  // Table
  let y = 88
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...colors.navy)
  doc.text('Transaction Details', 15, y)

  y += 5
  doc.setFillColor(...colors.navy)
  doc.rect(15, y, 180, 8, 'F')

  doc.setTextColor(...colors.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('TX ID', 18, y + 5.3)
  doc.text('Project / Description', 50, y + 5.3)
  doc.text('Type', 115, y + 5.3)
  doc.text('Date', 145, y + 5.3)
  doc.text('Status', 168, y + 5.3)
  doc.text('Amount', 190, y + 5.3, { align: 'right' })

  y += 8

  transactions.forEach((tx, index) => {
    if (y > 265) {
      doc.addPage()
      y = 20
    }

    const rowBg = index % 2 === 0 ? colors.panel : colors.white
    const rowHeight = 8
    doc.setFillColor(...rowBg)
    doc.rect(15, y, 180, rowHeight, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...colors.text)

    const txId = tx.id ? `TX-${String(tx.id).slice(0, 8).toUpperCase()}` : 'TX-PENDING'
    const projTitle = tx.project_title || tx.project || 'Unassigned project'
    const typeLabel = (tx.type || tx.normalizedType || 'escrow_deposit').replace('_', ' ')
    const dateStr = formatDate(tx.complete_at || tx.date)
    const amountStr = formatMoney(tx.amount)
    const statusStr = String(tx.status || tx.normalizedStatus || 'completed').toUpperCase()

    doc.text(txId, 18, y + 5.2)
    doc.text(projTitle.length > 32 ? `${projTitle.slice(0, 30)}...` : projTitle, 50, y + 5.2)
    doc.text(typeLabel, 115, y + 5.2)
    doc.text(dateStr, 145, y + 5.2)

    if (statusStr === 'COMPLETED') {
      doc.setTextColor(...colors.cyan)
    } else {
      doc.setTextColor(...colors.muted)
    }
    doc.text(statusStr, 168, y + 5.2)

    doc.setTextColor(...colors.navy)
    doc.setFont('helvetica', 'bold')
    doc.text(amountStr, 190, y + 5.2, { align: 'right' })

    y += rowHeight
  })

  if (!transactions.length) {
    doc.setFillColor(...colors.panel)
    doc.rect(15, y, 180, 15, 'F')
    doc.setTextColor(...colors.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('No transaction records found.', 105, y + 9, { align: 'center' })
  }

  drawStatementFooter(doc, 'Client Billing Statement')
  doc.save(`aitasker-client-billing-${new Date().toISOString().slice(0, 10)}.pdf`)
}

/**
 * Tải về Expert Earnings Statement PDF
 */
export const downloadExpertEarningsPdf = ({ user, transactions = [], incomeSummary = {} }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  const summaryStats = [
    { label: 'Gross Revenue', value: incomeSummary.gross || '$0.00' },
    { label: 'Platform Fees (10%)', value: incomeSummary.fees || '$0.00' },
    { label: 'Net Earnings', value: incomeSummary.net || '$0.00' },
  ]

  drawStatementHeader(doc, {
    title: 'Expert Earnings & Payout Statement',
    userName: user?.name || user?.email || 'Expert',
    userRole: 'Expert',
    stats: summaryStats,
  })

  // Table
  let y = 88
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...colors.navy)
  doc.text('Completed Payouts & Releases', 15, y)

  y += 5
  doc.setFillColor(...colors.navy)
  doc.rect(15, y, 180, 8, 'F')

  doc.setTextColor(...colors.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('ID', 18, y + 5.3)
  doc.text('Project / Milestone', 50, y + 5.3)
  doc.text('Date', 130, y + 5.3)
  doc.text('Status', 155, y + 5.3)
  doc.text('Net Amount', 190, y + 5.3, { align: 'right' })

  y += 8

  transactions.forEach((tx, index) => {
    if (y > 265) {
      doc.addPage()
      y = 20
    }

    const rowBg = index % 2 === 0 ? colors.panel : colors.white
    const rowHeight = 8
    doc.setFillColor(...rowBg)
    doc.rect(15, y, 180, rowHeight, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...colors.text)

    const txId = tx.id || '#tx-0000'
    const projTitle = tx.project || 'Payment Release'
    const dateStr = formatDate(tx.date)
    const statusStr = String(tx.status || 'COMPLETED').toUpperCase()
    const amountStr = String(tx.amount || '$0.00')

    doc.text(txId, 18, y + 5.2)
    doc.text(projTitle.length > 40 ? `${projTitle.slice(0, 38)}...` : projTitle, 50, y + 5.2)
    doc.text(dateStr, 130, y + 5.2)

    doc.setTextColor(...colors.cyan)
    doc.text(statusStr, 155, y + 5.2)

    doc.setTextColor(...colors.navy)
    doc.setFont('helvetica', 'bold')
    doc.text(amountStr, 190, y + 5.2, { align: 'right' })

    y += rowHeight
  })

  if (!transactions.length) {
    doc.setFillColor(...colors.panel)
    doc.rect(15, y, 180, 15, 'F')
    doc.setTextColor(...colors.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('No earnings transaction records found.', 105, y + 9, { align: 'center' })
  }

  drawStatementFooter(doc, 'Expert Earnings Statement')
  doc.save(`aitasker-expert-earnings-${new Date().toISOString().slice(0, 10)}.pdf`)
}
