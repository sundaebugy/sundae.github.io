# Certificate Generator

A simple web application to generate PDF certificates with custom names.

## Features

- **Single Certificate Generation**: Enter a name and download a personalized PDF certificate
- **Bulk Certificate Generation**: Upload a text file with multiple names and download all certificates in a ZIP file

## How to Use

### Single Certificate
1. Enter your full name in the input field
2. Click "Generate & Download Certificate"
3. Your certificate will be downloaded as a PDF

### Bulk Certificates
1. Prepare a text file (.txt) with names, one per line:
   ```
   John Smith
   Jane Doe
   Michael Johnson
   ```
2. Click "Choose text file..." and select your file
3. Click "Generate & Download ZIP"
4. All certificates will be downloaded in a ZIP file

## Technologies Used

- HTML5
- CSS3
- JavaScript
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [JSZip](https://stuk.github.io/jszip/) - ZIP file creation

## Getting Started

Simply open `index.html` in your web browser. No installation or build process required!

## License

MIT License
