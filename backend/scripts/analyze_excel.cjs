
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../ref-des-medicaments-cnops-2014 (1).xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get headers (first row)
    const headers = [];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: 0 })];
        headers.push(cell ? cell.v : undefined);
    }

    console.log("Headers:", headers);

    // Get first data row to see sample format
    const firstRow = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: 1 })];
        firstRow.push(cell ? cell.v : undefined);
    }
    console.log("First Row Data:", firstRow);

} catch (error) {
    console.error("Error reading file:", error);
}
