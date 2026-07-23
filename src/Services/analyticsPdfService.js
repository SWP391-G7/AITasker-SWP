import { jsPDF } from 'jspdf'

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

const drawSectionTitle = (doc, title, y) => {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...colors.navy)
  doc.text(title, 15, y)
}

const drawReportHeader = (doc, year) => {
  doc.setFillColor(...colors.navy)
  doc.rect(0, 0, 210, 25, 'F')
  doc.setTextColor(...colors.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text('AITasker Platform Analytics Report', 15, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Reporting year: ${year}`, 15, 19)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 19, { align: 'right' })
}

const drawKpiCards = (doc, kpis, startY) => {
  const cardWidth = 87
  const cardHeight = 22

  kpis.slice(0, 4).forEach((kpi, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = 15 + column * 92
    const y = startY + row * 27

    doc.setFillColor(...colors.panel)
    doc.setDrawColor(...colors.border)
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...colors.muted)
    doc.text(String(kpi.label || '').toUpperCase(), x + 5, y + 7)
    doc.setFontSize(14)
    doc.setTextColor(...colors.navy)
    doc.text(String(kpi.value || '0'), x + 5, y + 15)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...colors.cyan)
    doc.text(String(kpi.trend || ''), x + cardWidth - 5, y + 15, { align: 'right' })
  })
}

const drawMonthlyRevenue = (doc, bars, startY) => {
  const rowHeight = 6.5

  doc.setFillColor(...colors.navy)
  doc.rect(15, startY, 180, 8, 'F')
  doc.setTextColor(...colors.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Month', 20, startY + 5.3)
  doc.text('Released revenue', 190, startY + 5.3, { align: 'right' })

  bars.slice(0, 12).forEach((bar, index) => {
    const y = startY + 8 + index * rowHeight
    doc.setFillColor(...(index % 2 === 0 ? colors.panel : colors.white))
    doc.rect(15, y, 180, rowHeight, 'F')
    doc.setTextColor(...colors.text)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(String(bar.label || ''), 20, y + 4.4)
    doc.text(
      Number(bar.amount || 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
      190,
      y + 4.4,
      { align: 'right' },
    )
  })
}

const drawEngagementMetrics = (doc, metrics, startY) => {
  metrics.slice(0, 3).forEach((metric, index) => {
    const y = startY + index * 8
    doc.setTextColor(...colors.text)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text(String(metric.label || ''), 18, y + 5)
    doc.setFont('helvetica', 'bold')
    doc.text(String(metric.value || '0%'), 192, y + 5, { align: 'right' })
    doc.setDrawColor(...colors.border)
    doc.line(15, y + 7, 195, y + 7)
  })
}

const drawExpertLeaderboard = (doc, experts, year) => {
  doc.addPage()
  doc.setFillColor(...colors.navy)
  doc.rect(0, 0, 210, 20, 'F')
  doc.setTextColor(...colors.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`Top 10 AI Experts - ${year}`, 15, 13)

  const columns = [
    { label: '#', x: 15, width: 10 },
    { label: 'Expert', x: 25, width: 40 },
    { label: 'Specialization', x: 65, width: 55 },
    { label: 'Completion', x: 120, width: 25 },
    { label: 'Revenue', x: 145, width: 28 },
    { label: 'Status', x: 173, width: 22 },
  ]
  let y = 30

  doc.setFillColor(...colors.blue)
  doc.rect(15, y, 180, 9, 'F')
  doc.setTextColor(...colors.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  columns.forEach((column) => doc.text(column.label, column.x + 2, y + 5.8))
  y += 9

  experts.slice(0, 10).forEach((expert, index) => {
    const nameLines = doc.splitTextToSize(String(expert.name || 'AI Expert'), 36)
    const specializationLines = doc.splitTextToSize(String(expert.specialization || 'AI Specialist'), 51)
    const lineCount = Math.max(nameLines.length, specializationLines.length)
    const rowHeight = Math.max(10, lineCount * 4.2 + 4)

    doc.setFillColor(...(index % 2 === 0 ? colors.panel : colors.white))
    doc.rect(15, y, 180, rowHeight, 'F')
    doc.setTextColor(...colors.text)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text(String(expert.rank || index + 1), 17, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.text(nameLines, 27, y + 5.5)
    doc.setFont('helvetica', 'normal')
    doc.text(specializationLines, 67, y + 5.5)
    doc.text(String(expert.completion || '0%'), 122, y + 6)
    doc.setTextColor(...colors.cyan)
    doc.setFont('helvetica', 'bold')
    doc.text(String(expert.revenue || '$0'), 171, y + 6, { align: 'right' })
    doc.setTextColor(...colors.text)
    doc.setFont('helvetica', 'normal')
    doc.text(String(expert.status || 'Active'), 175, y + 6)
    y += rowHeight
  })

  if (experts.length === 0) {
    doc.setTextColor(...colors.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('No expert performance data is available for this year.', 105, 52, { align: 'center' })
  }
}

const drawPageFooters = (doc, year) => {
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...colors.border)
    doc.line(15, 284, 195, 284)
    doc.setTextColor(...colors.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`AITasker Admin Analytics - ${year}`, 15, 289)
    doc.text(`Page ${page} of ${pageCount}`, 195, 289, { align: 'right' })
  }
}

export const createAnalyticsReportPdf = ({ year, analyticsData }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const kpis = analyticsData?.kpis || []
  const revenueBars = analyticsData?.revenueBars || []
  const engagementMetrics = analyticsData?.engagementMetrics || []
  const topExperts = (analyticsData?.allExperts || analyticsData?.topExperts || []).slice(0, 10)

  drawReportHeader(doc, year)
  drawSectionTitle(doc, 'Performance Summary', 45)
  drawKpiCards(doc, kpis, 50)
  drawSectionTitle(doc, 'Monthly Revenue', 110)
  drawMonthlyRevenue(doc, revenueBars, 115)
  drawSectionTitle(doc, 'Engagement Overview', 207)
  drawEngagementMetrics(doc, engagementMetrics, 212)
  drawSectionTitle(doc, 'Calculation Notes', 246)
  doc.setTextColor(...colors.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  const notes = [
    analyticsData?.definitions?.revenue || 'Revenue uses completed escrow releases in the selected year.',
    analyticsData?.definitions?.engagement || 'Engagement counts active accounts that joined at least one project.',
  ]
  doc.text(doc.splitTextToSize(notes.join(' '), 176), 17, 252)

  drawExpertLeaderboard(doc, topExperts, year)
  drawPageFooters(doc, year)
  return doc
}

export const downloadAnalyticsReportPdf = ({ year, analyticsData }) => {
  const doc = createAnalyticsReportPdf({ year, analyticsData })
  doc.save(`aitasker-analytics-report-${year}.pdf`)
}
