import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FullResumeAnalysis, JobDescription } from '../types';

export interface PDFExportOptions {
  fileName?: string;
  targetJob?: JobDescription;
}

export function generateResumeAnalysisPDF(
  analysis: FullResumeAnalysis,
  options?: PDFExportOptions
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const primaryDark: [number, number, number] = [18, 22, 26]; // #12161a
  const cardBg: [number, number, number] = [24, 29, 35]; // #181d23
  const mintAccent: [number, number, number] = [46, 248, 160]; // #2ef8a0
  const emeraldDark: [number, number, number] = [16, 185, 129];
  const textDark: [number, number, number] = [30, 41, 59];
  const textMuted: [number, number, number] = [100, 116, 139];
  const borderGray: [number, number, number] = [226, 232, 240];

  const candidateName = analysis.parsedResume.detectedName || 'Candidate Profile';
  const targetRoleTitle = options?.targetJob?.title || analysis.targetJobFit?.jobTitle || 'Target Role Analysis';
  const atsScore = analysis.atsReadiness.score;
  const atsRating = analysis.atsReadiness.rating;
  const matchScore = analysis.targetJobFit?.matchScore || 0;
  const benchmarkRank = analysis.benchmarking.percentileBand;
  const quantifiedRatio = analysis.parsedResume.quantifiedBulletsPercentage;

  let currentY = 14;

  // ----------------------------------------------------
  // 1. HEADER SECTION (Hero Banner)
  // ----------------------------------------------------
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.roundedRect(margin, currentY, contentWidth, 38, 3, 3, 'F');

  // Mint accent line
  doc.setFillColor(mintAccent[0], mintAccent[1], mintAccent[2]);
  doc.rect(margin, currentY, 4, 38, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RESUME NLP & ATS OPTIMIZATION REPORT', margin + 8, currentY + 11);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(`Candidate: ${candidateName}   |   Target: ${targetRoleTitle}`, margin + 8, currentY + 19);

  // Metadata Row
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.text(`Evaluated File: ${analysis.parsedResume.fileName || 'Uploaded Resume'}   •   Date: ${dateStr}   •   Engine: Static NLP v2.4`, margin + 8, currentY + 28);

  currentY += 44;

  // ----------------------------------------------------
  // 2. EXECUTIVE SCORECARDS
  // ----------------------------------------------------
  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 22;

  const scorecards = [
    { label: 'Role Suitability', value: `${matchScore}%`, sub: 'Job Fit Score', color: mintAccent },
    { label: 'ATS Readiness', value: `${atsScore}/100`, sub: atsRating, color: atsScore >= 80 ? emeraldDark : [234, 179, 8] as [number, number, number] },
    { label: 'Industry Ranking', value: `${analysis.benchmarking.percentileNumber}th %`, sub: benchmarkRank.split(' ')[0], color: [99, 102, 241] as [number, number, number] },
    { label: 'Quantified Ratio', value: `${quantifiedRatio}%`, sub: `${analysis.parsedResume.quantifiedBulletsCount}/${analysis.parsedResume.totalBulletsCount} Bullets`, color: [14, 165, 233] as [number, number, number] }
  ];

  scorecards.forEach((card, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    // Indicator top bar
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.rect(cardX, currentY, cardWidth, 1.8, 'F');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(card.label.toUpperCase(), cardX + 3, currentY + 7);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(card.value, cardX + 3, currentY + 14);

    // Subtext
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(card.sub, cardX + 3, currentY + 19);
  });

  currentY += cardHeight + 6;

  // ----------------------------------------------------
  // 3. EXECUTIVE SUMMARY CALLOUT
  // ----------------------------------------------------
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Executive Diagnostic Summary:', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const splitSummary = doc.splitTextToSize(analysis.aiExecutiveSummary, contentWidth - 8);
  doc.text(splitSummary, margin + 4, currentY + 10.5);

  currentY += 21;

  // ----------------------------------------------------
  // 4. SECTION: JOB FIT BREAKDOWN (TABLE)
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('1. Target Role Alignment & Skill Match Breakdown', margin, currentY);
  currentY += 3;

  const targetFit = analysis.targetJobFit;
  const matchedSkillsList = targetFit?.matchedSkills?.length ? targetFit.matchedSkills.join(', ') : 'None detected';
  const missingSkillsList = targetFit?.missingSkills?.length ? targetFit.missingSkills.join(', ') : 'All target role core skills present';
  const keywordsMatchedList = targetFit?.matchedKeywords?.length ? targetFit.matchedKeywords.slice(0, 8).join(', ') : 'None detected';

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: primaryDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 'auto' }
    },
    head: [['Evaluation Dimension', 'Assessment Findings & Coverage']],
    body: [
      ['Skills Match Score', `${targetFit?.subScores.skillsMatch || 0}% coverage of core required & preferred technical skills.`],
      ['Matched Skills', matchedSkillsList],
      ['Skill Gaps to Address', missingSkillsList],
      ['Contextual Keywords', `${targetFit?.subScores.keywordOverlap || 0}% keyword overlap (${keywordsMatchedList})`],
      ['Experience Relevance', `${targetFit?.subScores.experienceRelevance || 0}% seniority alignment for ${targetFit?.level || 'target level'}.`]
    ]
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ----------------------------------------------------
  // 5. SECTION: ACTIONABLE ATS CHECKLIST TABLE
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('2. Actionable ATS Optimization Checklist', margin, currentY);
  currentY += 3;

  const atsTableRows = analysis.atsReadiness.checks.map(check => {
    const statusLabel = check.status.toUpperCase();
    return [
      statusLabel,
      check.name,
      check.description,
      check.recommendation
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: primaryDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: textDark,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 40, fontStyle: 'bold' },
      2: { cellWidth: 62 },
      3: { cellWidth: 'auto' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const text = String(data.cell.raw);
        if (text === 'PASS') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fillColor = [236, 253, 245];
        } else if (text === 'WARNING') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fillColor = [254, 243, 199];
        } else if (text === 'FAIL') {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fillColor = [255, 241, 242];
        }
      }
    },
    head: [['Status', 'Check Item', 'Diagnostic Findings', 'Actionable Recommendation']],
    body: atsTableRows
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ----------------------------------------------------
  // Check if we need a new page for remaining sections
  // ----------------------------------------------------
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  // ----------------------------------------------------
  // 6. SECTION: BULLET POINT QUALITY & GOOGLE XYZ REWRITES
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('3. Bullet Point Impact & Measurable Outcomes Audit', margin, currentY);
  currentY += 3;

  const sampleAudits = analysis.atsReadiness.bulletAudits.slice(0, 4);
  const auditRows = sampleAudits.map((item, index) => [
    `#${index + 1} (${item.verbStrength.toUpperCase()} verb, ${item.isQuantified ? 'Quantified' : 'Unquantified'})`,
    item.original,
    item.suggestedImprovement
  ]);

  if (auditRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: primaryDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: textDark,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: 70 },
        2: { cellWidth: 'auto', textColor: [15, 118, 110] }
      },
      head: [['Bullet Profile', 'Original Bullet', 'Enhanced High-Impact Version (XYZ Formula)']],
      body: auditRows
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check page height again
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  // ----------------------------------------------------
  // 7. SECTION: BENCHMARK COMPARISON MATRIX
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('4. Candidate Benchmarking vs. Industry Percentiles', margin, currentY);
  currentY += 3;

  const userMetrics = analysis.benchmarking.userMetrics;
  const avgMetrics = analysis.benchmarking.benchmarkAverage;
  const top10Metrics = analysis.benchmarking.benchmarkTop10;

  const benchmarkRows = [
    ['ATS Formatting Readiness', `${userMetrics.atsReadiness}/100`, `${avgMetrics.atsReadiness}/100`, `${top10Metrics.atsReadiness}/100`],
    ['Contextual Keyword Density', `${userMetrics.keywordDensity}/100`, `${avgMetrics.keywordDensity}/100`, `${top10Metrics.keywordDensity}/100`],
    ['Quantified Achievements Ratio', `${userMetrics.quantifiedAchievements}%`, `${avgMetrics.quantifiedAchievements}%`, `${top10Metrics.quantifiedAchievements}%`],
    ['Technical & Domain Depth', `${userMetrics.technicalDepth}/100`, `${avgMetrics.technicalDepth}/100`, `${top10Metrics.technicalDepth}/100`],
    ['Action Verb Strength & Leadership', `${userMetrics.actionVerbStrength}/100`, `${avgMetrics.actionVerbStrength}/100`, `${top10Metrics.actionVerbStrength}/100`]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: primaryDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: textDark,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] },
      2: { cellWidth: 35, halign: 'center', textColor: textMuted },
      3: { cellWidth: 'auto', halign: 'center', fontStyle: 'bold', textColor: [99, 102, 241] }
    },
    head: [['Competency Dimension', 'Your Resume', 'Average Candidate (50th %)', 'Top 10% Candidate']],
    body: benchmarkRows
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check page height
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 16;
  }

  // ----------------------------------------------------
  // 8. SECTION: SKILL GAP REMEDIATION & RECOMMENDED FREE COURSES
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('5. Skill Gap Remediation & Curated Free Learning Resources', margin, currentY);
  currentY += 3;

  const topCourses = analysis.skillGaps.topRecommendedCourses.slice(0, 5);
  const courseRows = topCourses.map(course => [
    course.title,
    course.provider,
    course.duration,
    course.badge,
    course.url
  ]);

  if (courseRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: primaryDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: textDark,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 26, halign: 'center' },
        4: { cellWidth: 'auto', textColor: [37, 99, 235] }
      },
      head: [['Course Title', 'Provider', 'Duration', 'Badge', 'Verified Learning URL']],
      body: courseRows
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ----------------------------------------------------
  // 9. FOOTERS & PAGE NUMBERING FOR ALL PAGES
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Bottom border rule
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('ResumeAI Matcher • Created by Sanjay • Confidential Career & ATS Diagnostic Report', margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 6);
  }

  return doc;
}

export function downloadResumeAnalysisPDF(
  analysis: FullResumeAnalysis,
  options?: PDFExportOptions
): void {
  const doc = generateResumeAnalysisPDF(analysis, options);
  const safeName = (analysis.parsedResume.detectedName || 'Candidate')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();
  const fileName = options?.fileName || `resume_ats_report_${safeName}.pdf`;
  doc.save(fileName);
}
