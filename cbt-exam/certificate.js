// Certificate Generator
function generateCertificate(examData) {
    const { userName, examName, score, totalQuestions, percentage, date } = examData;
    
    // Create certificate HTML
    const certificateHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - ${userName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .certificate {
            background: white;
            width: 100%;
            max-width: 900px;
            padding: 60px;
            border: 15px solid #667eea;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid #764ba2;
            pointer-events: none;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 10px;
        }
        .title {
            font-size: 42px;
            color: #2c3e50;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .subtitle {
            font-size: 18px;
            color: #7f8c8d;
            font-style: italic;
        }
        .content {
            text-align: center;
            margin: 40px 0;
        }
        .awarded-to {
            font-size: 20px;
            color: #7f8c8d;
            margin-bottom: 15px;
        }
        .recipient-name {
            font-size: 48px;
            color: #2c3e50;
            font-weight: bold;
            margin-bottom: 30px;
            border-bottom: 3px solid #667eea;
            display: inline-block;
            padding-bottom: 10px;
        }
        .description {
            font-size: 18px;
            color: #34495e;
            line-height: 1.8;
            margin-bottom: 30px;
        }
        .exam-name {
            font-size: 24px;
            color: #667eea;
            font-weight: bold;
            margin: 20px 0;
        }
        .score-section {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        .score-item {
            text-align: center;
        }
        .score-label {
            font-size: 14px;
            color: #7f8c8d;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .score-value {
            font-size: 32px;
            color: #27ae60;
            font-weight: bold;
        }
        .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #ecf0f1;
        }
        .signature {
            text-align: center;
        }
        .signature-line {
            width: 200px;
            border-top: 2px solid #2c3e50;
            margin-bottom: 10px;
        }
        .signature-name {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
        }
        .signature-title {
            font-size: 14px;
            color: #7f8c8d;
        }
        .date {
            text-align: center;
        }
        .date-label {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 5px;
        }
        .date-value {
            font-size: 16px;
            color: #2c3e50;
            font-weight: bold;
        }
        .actions {
            text-align: center;
            margin-top: 30px;
        }
        .btn {
            padding: 12px 30px;
            margin: 0 10px;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            color: white;
            text-decoration: none;
            display: inline-block;
        }
        .btn-print {
            background: linear-gradient(135deg, #667eea, #764ba2);
        }
        .btn-download {
            background: linear-gradient(135deg, #28a745, #218838);
        }
        @media print {
            body { background: white; padding: 0; }
            .actions { display: none; }
        }
        @media (max-width: 768px) {
            .certificate { padding: 30px 20px; border-width: 10px; }
            .title { font-size: 28px; }
            .recipient-name { font-size: 32px; }
            .score-section { gap: 20px; }
            .footer { flex-direction: column; gap: 30px; align-items: center; }
            .signature-line { width: 150px; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="logo">🏆</div>
            <h1 class="title">Certificate of Achievement</h1>
            <p class="subtitle">Study With Keshab</p>
        </div>
        
        <div class="content">
            <p class="awarded-to">This certificate is proudly presented to</p>
            <h2 class="recipient-name">${userName}</h2>
            <p class="description">
                For successfully completing the examination and demonstrating
                excellent knowledge and skills in
            </p>
            <div class="exam-name">${examName}</div>
            
            <div class="score-section">
                <div class="score-item">
                    <div class="score-label">Score</div>
                    <div class="score-value">${score}/${totalQuestions}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Percentage</div>
                    <div class="score-value">${percentage}%</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="signature">
                <div class="signature-line" style="font-family: 'Brush Script MT', cursive; font-size: 24px; color: #2c3e50; border: none; margin-bottom: 5px;">Keshab Sarkar</div>
                <div class="signature-name" style="font-size: 14px;">Keshab Sarkar</div>
                <div class="signature-title">Founder & Instructor</div>
            </div>
            
            <div class="date">
                <div class="date-label">Date of Issue</div>
                <div class="date-value">${date}</div>
            </div>
        </div>
    </div>
    
    <div class="actions">
        <button class="btn btn-print" onclick="window.print()">
            🖨️ Print Certificate
        </button>
        <button class="btn btn-download" onclick="window.close()">
            ✖️ Close
        </button>
    </div>
</body>
</html>
    `;
    
    // Open certificate in new window
    const certWindow = window.open('', '_blank', 'width=1000,height=800');
    certWindow.document.write(certificateHTML);
    certWindow.document.close();
}

// Export function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateCertificate };
}
