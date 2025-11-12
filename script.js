let selectedFile = null;

function createCertificatePDF(fullName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Certificate background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Elegant border - outer (Crimson Red)
    doc.setDrawColor(220, 20, 60);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    // Inner border
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 267, 180);
    
    // Decorative corner elements (Gold)
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(1.5);
    doc.line(20, 25, 40, 25);
    doc.line(20, 25, 20, 45);
    doc.line(257, 25, 277, 25);
    doc.line(277, 25, 277, 45);
    doc.line(20, 185, 40, 185);
    doc.line(20, 165, 20, 185);
    doc.line(257, 185, 277, 185);
    doc.line(277, 165, 277, 185);

    // Title (Crimson Red)
    doc.setFontSize(36);
    doc.setTextColor(220, 20, 60);
    doc.setFont(undefined, 'bold');
    doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 45, { align: 'center' });
    
    // Conference name (Gold)
    doc.setFontSize(18);
    doc.setTextColor(218, 165, 32);
    doc.setFont(undefined, 'bold');
    doc.text('ACADEMIC GLOBAL CONFERENCE', 148.5, 60, { align: 'center' });

    // Presented to text
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'italic');
    doc.text('This is to certify that', 148.5, 80, { align: 'center' });

    // Name
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(fullName, 148.5, 100, { align: 'center' });
    
    // Line under name (Crimson Red)
    doc.setDrawColor(220, 20, 60);
    doc.setLineWidth(0.5);
    doc.line(70, 105, 227, 105);

    // Description
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    doc.text('has successfully participated in the Academic Global Conference', 148.5, 120, { align: 'center' });
    doc.text('demonstrating commitment to academic excellence and professional development', 148.5, 130, { align: 'center' });

    // Date
    const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Issued on: ${currentDate}`, 148.5, 155, { align: 'center' });
    
    // Signature lines
    doc.setLineWidth(0.3);
    doc.line(50, 175, 110, 175);
    doc.line(187, 175, 247, 175);
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Conference Director', 80, 182, { align: 'center' });
    doc.text('Academic Committee Chair', 217, 182, { align: 'center' });

    return doc;
}

function generateCertificate() {
    const fullName = document.getElementById('fullName').value.trim();
    const preview = document.getElementById('preview');
    
    if (!fullName) {
        preview.innerHTML = '<span style="color: #dc3545;">Please enter your full name</span>';
        return;
    }

    const doc = createCertificatePDF(fullName);
    doc.save(`Certificate_${fullName.replace(/\s+/g, '_')}.pdf`);
    
    preview.innerHTML = '✓ Certificate generated successfully!';
    setTimeout(() => {
        preview.innerHTML = '';
    }, 3000);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileNameSpan = document.getElementById('fileName');
    const fileLabel = document.querySelector('.file-label');
    const bulkBtn = document.getElementById('bulkGenerateBtn');
    
    if (file && file.type === 'text/plain') {
        selectedFile = file;
        fileNameSpan.textContent = file.name;
        fileLabel.classList.add('has-file');
        bulkBtn.disabled = false;
    } else {
        selectedFile = null;
        fileNameSpan.textContent = 'Choose text file...';
        fileLabel.classList.remove('has-file');
        bulkBtn.disabled = true;
    }
}

async function generateBulkCertificates() {
    const bulkPreview = document.getElementById('bulkPreview');
    
    if (!selectedFile) {
        bulkPreview.innerHTML = '<span style="color: #dc3545;">Please select a file first</span>';
        return;
    }

    const format = document.querySelector('input[name="format"]:checked').value;
    bulkPreview.innerHTML = '<span style="color: #1e3a8a;">Processing...</span>';
    
    try {
        const text = await selectedFile.text();
        const names = text.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        if (names.length === 0) {
            bulkPreview.innerHTML = '<span style="color: #dc3545;">No names found in file</span>';
            return;
        }

        if (format === 'zip') {
            // Generate ZIP with separate PDFs
            const zip = new JSZip();
            
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                bulkPreview.innerHTML = `<span style="color: #1e3a8a;">Generating ${i + 1} of ${names.length}...</span>`;
                
                const doc = createCertificatePDF(name);
                const pdfBlob = doc.output('blob');
                
                const fileName = `Certificate_${name.replace(/\s+/g, '_')}.pdf`;
                zip.file(fileName, pdfBlob);
            }

            bulkPreview.innerHTML = '<span style="color: #1e3a8a;">Creating ZIP file...</span>';
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = 'Certificates.zip';
            link.click();
            
            bulkPreview.innerHTML = `✓ Generated ${names.length} certificates in ZIP!`;
        } else {
            // Generate single PDF with multiple pages
            const { jsPDF } = window.jspdf;
            let multiPageDoc = null;
            
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                bulkPreview.innerHTML = `<span style="color: #1e3a8a;">Generating page ${i + 1} of ${names.length}...</span>`;
                
                const doc = createCertificatePDF(name);
                
                if (i === 0) {
                    multiPageDoc = doc;
                } else {
                    multiPageDoc.addPage('a4', 'landscape');
                    
                    // Copy the certificate content to the new page
                    const tempDoc = createCertificatePDF(name);
                    const pageCount = tempDoc.internal.getNumberOfPages();
                    
                    // Get the current page content
                    multiPageDoc.setPage(i + 1);
                    
                    // Recreate certificate on new page
                    const certDoc = createCertificatePDF(name);
                    const imgData = certDoc.output('dataurlstring');
                    
                    // Since we can't easily copy between docs, regenerate on each page
                    // This is a workaround - we'll create the certificate directly
                    createCertificateOnPage(multiPageDoc, name);
                }
            }
            
            bulkPreview.innerHTML = '<span style="color: #1e3a8a;">Creating PDF file...</span>';
            
            multiPageDoc.save('Certificates_All.pdf');
            
            bulkPreview.innerHTML = `✓ Generated ${names.length} certificates in single PDF!`;
        }
        
        setTimeout(() => {
            bulkPreview.innerHTML = '';
        }, 3000);
        
    } catch (error) {
        bulkPreview.innerHTML = '<span style="color: #dc3545;">Error processing file</span>';
        console.error(error);
    }
}

function createCertificateOnPage(doc, fullName) {
    // Certificate background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Elegant border - outer (Crimson Red)
    doc.setDrawColor(220, 20, 60);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    // Inner border
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 267, 180);
    
    // Decorative corner elements (Gold)
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(1.5);
    doc.line(20, 25, 40, 25);
    doc.line(20, 25, 20, 45);
    doc.line(257, 25, 277, 25);
    doc.line(277, 25, 277, 45);
    doc.line(20, 185, 40, 185);
    doc.line(20, 165, 20, 185);
    doc.line(257, 185, 277, 185);
    doc.line(277, 165, 277, 185);

    // Title (Crimson Red)
    doc.setFontSize(36);
    doc.setTextColor(220, 20, 60);
    doc.setFont(undefined, 'bold');
    doc.text('CERTIFICATE OF PARTICIPATION', 148.5, 45, { align: 'center' });
    
    // Conference name (Gold)
    doc.setFontSize(18);
    doc.setTextColor(218, 165, 32);
    doc.setFont(undefined, 'bold');
    doc.text('ACADEMIC GLOBAL CONFERENCE', 148.5, 60, { align: 'center' });

    // Presented to text
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'italic');
    doc.text('This is to certify that', 148.5, 80, { align: 'center' });

    // Name
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(fullName, 148.5, 100, { align: 'center' });
    
    // Line under name (Crimson Red)
    doc.setDrawColor(220, 20, 60);
    doc.setLineWidth(0.5);
    doc.line(70, 105, 227, 105);

    // Description
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    doc.text('has successfully participated in the Academic Global Conference', 148.5, 120, { align: 'center' });
    doc.text('demonstrating commitment to academic excellence and professional development', 148.5, 130, { align: 'center' });

    // Date
    const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Issued on: ${currentDate}`, 148.5, 155, { align: 'center' });
    
    // Signature lines
    doc.setLineWidth(0.3);
    doc.line(50, 175, 110, 175);
    doc.line(187, 175, 247, 175);
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Conference Director', 80, 182, { align: 'center' });
    doc.text('Academic Committee Chair', 217, 182, { align: 'center' });
}

// Allow Enter key to generate certificate
document.getElementById('fullName').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        generateCertificate();
    }
});
