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
    
    // Border
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);
    
    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    // Title
    doc.setFontSize(40);
    doc.setTextColor(102, 126, 234);
    doc.setFont(undefined, 'bold');
    doc.text('CERTIFICATE', 148.5, 50, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('OF ACHIEVEMENT', 148.5, 65, { align: 'center' });

    // Presented to
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text('This certificate is proudly presented to', 148.5, 90, { align: 'center' });

    // Name
    doc.setFontSize(32);
    doc.setTextColor(51, 51, 51);
    doc.setFont(undefined, 'bold');
    doc.text(fullName, 148.5, 110, { align: 'center' });
    
    // Line under name
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(60, 115, 237, 115);

    // Description
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('For outstanding dedication and achievement', 148.5, 130, { align: 'center' });

    // Date
    const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.setFontSize(11);
    doc.text(`Date: ${currentDate}`, 148.5, 170, { align: 'center' });

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

    bulkPreview.innerHTML = '<span style="color: #667eea;">Processing...</span>';
    
    try {
        const text = await selectedFile.text();
        const names = text.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        if (names.length === 0) {
            bulkPreview.innerHTML = '<span style="color: #dc3545;">No names found in file</span>';
            return;
        }

        const zip = new JSZip();
        
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            bulkPreview.innerHTML = `<span style="color: #667eea;">Generating ${i + 1} of ${names.length}...</span>`;
            
            const doc = createCertificatePDF(name);
            const pdfBlob = doc.output('blob');
            
            const fileName = `Certificate_${name.replace(/\s+/g, '_')}.pdf`;
            zip.file(fileName, pdfBlob);
        }

        bulkPreview.innerHTML = '<span style="color: #667eea;">Creating ZIP file...</span>';
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = 'Certificates.zip';
        link.click();
        
        bulkPreview.innerHTML = `✓ Generated ${names.length} certificates successfully!`;
        setTimeout(() => {
            bulkPreview.innerHTML = '';
        }, 3000);
        
    } catch (error) {
        bulkPreview.innerHTML = '<span style="color: #dc3545;">Error processing file</span>';
        console.error(error);
    }
}

// Allow Enter key to generate certificate
document.getElementById('fullName').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        generateCertificate();
    }
});
