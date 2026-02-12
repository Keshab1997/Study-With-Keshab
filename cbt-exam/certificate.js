// Certificate Generator
function generateCertificate(examData) {
    const { userName, examName, score, totalQuestions, percentage, date } = examData;
    
    // Create certificate HTML
    const certificateHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Certificate - ${userName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            min-height: 100vh;
            padding: 10px;
            overflow-x: hidden;
        }
        .certificate-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 10px 0;
        }
        .certificate {
            background: white;
            width: 100%;
            max-width: 800px;
            padding: 40px 20px;
            border: 10px solid #667eea;
            border-radius: 5px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            position: relative;
            text-align: center;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 10px; left: 10px; right: 10px; bottom: 10px;
            border: 2px solid #764ba2;
            pointer-events: none;
        }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 40px; margin-bottom: 10px; }
        .title { font-size: 28px; color: #2c3e50; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
        .subtitle { font-size: 16px; color: #7f8c8d; font-style: italic; }
        .awarded-to { font-size: 16px; color: #7f8c8d; margin: 20px 0 10px; }
        .recipient-name { font-size: 32px; color: #2c3e50; font-weight: bold; border-bottom: 2px solid #667eea; display: inline-block; margin-bottom: 20px; padding: 0 10px; }
        .description { font-size: 14px; color: #34495e; line-height: 1.5; }
        .exam-name { font-size: 20px; color: #667eea; font-weight: bold; margin: 15px 0; }
        .score-section { display: flex; justify-content: center; gap: 20px; margin: 20px 0; }
        .score-item .score-label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; }
        .score-value { font-size: 24px; color: #27ae60; font-weight: bold; }
        .footer { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 20px; text-align: center; }
        .handwritten-signature { font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; font-size: 28px; color: #2c3e50; font-weight: normal; font-style: italic; margin-bottom: 5px; }
        .signature-name { font-size: 14px; font-weight: bold; border-top: 1px solid #2c3e50; padding-top: 5px; margin-top: 5px; }
        .date-value { font-size: 14px; font-weight: bold; border-top: 1px solid #2c3e50; padding-top: 5px; }
        .actions { margin: 20px 0; display: flex; gap: 10px; justify-content: center; width: 100%; }
        .btn { padding: 10px 20px; border: none; border-radius: 25px; font-size: 14px; font-weight: bold; cursor: pointer; color: white; }
        .btn-print { background: #27ae60; }
        .btn-download { background: #e74c3c; }
        @media print { body { background: white; padding: 0; } .actions { display: none; } .certificate { border: 15px solid #667eea !important; box-shadow: none; } }
        @media (max-width: 480px) { .title { font-size: 22px; } .recipient-name { font-size: 24px; } .footer { flex-direction: row; font-size: 12px; } .certificate { padding: 30px 10px; } .handwritten-signature { font-size: 22px; } }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <div class="certificate">
            <div class="header">
                <div class="logo">🏆</div>
                <h1 class="title">Certificate of Achievement</h1>
                <p class="subtitle">Study With Keshab</p>
            </div>
            
            <div class="content">
                <p class="awarded-to">This certificate is proudly presented to</p>
                <h2 class="recipient-name">${userName}</h2>
                <p class="description">For successfully completing the examination in</p>
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
                <div class="date-box">
                    <div class="date-value">${date}</div>
                    <div class="score-label">Date</div>
                </div>
                <div class="sig-box">
                    <div class="handwritten-signature">Keshab Sarkar</div>
                    <div class="signature-name">Keshab Sarkar</div>
                    <div class="score-label">Instructor</div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="actions">
        <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
        <button class="btn btn-download" onclick="window.close()">✖ Close</button>
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
