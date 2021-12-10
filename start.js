const mysql = require('mysql2/promise');
const XLSX = require('xlsx');
const fs = require('fs');
const sql = require('mssql/msnodesqlv8');

const config = JSON.parse(fs.readFileSync('./config.json', {encoding:'utf8', flag:'r'}));

const dbTestMYSQL = async () => {
    console.log('Starting to connect to MYSQL db');
    const conn = await mysql.createConnection(config.develop.mysql);
    
    const [result] = await conn.execute("SELECT * FROM reporting_portal_local.Users LIMIT 10");
    console.log('Data recieved from MYSQL, converting to Excel');
    const data = convertJsonToExcelJson(result);
    toXlsx(data, 'jsontoxlsxMYSQL.xlsx');
    console.log('Done fetching from MYSQL to XLSX');
};

const dbTestMSSQL = async () => {
    try {
        console.log('Starting to connect to MSSQL db using trusted connection');
        await sql.connect(config.develop.mssql);
        const result = await sql.query`select top 10 * from applicationLog ORDER BY ApplicationLogID DESC`
        console.log('Data recieved from MSSQL, converting to Excel');
        const data = convertJsonToExcelJson(result.recordset);
        toXlsx(data, 'jsontoxlsxMSSQL.xlsx');
        console.log('Done fetching from MSSQL to XLSX');
    } catch (err) {
        console.dir(err)
    }
}

//Convert JSON objects into array with first line equal to header for each column
const convertJsonToExcelJson = (result) => {
    if (result.length > 0) {
        const data = [];
        data.push([]);
        for (const key in result[0]) {
            if (Object.hasOwnProperty.call(result[0], key)) {
                data[0].push(key);
            }
        }
        for (let i = 0; i < result.length; i++) {
            const element = result[i];
            data.push([]);
            for (const key in element) {
                if (Object.hasOwnProperty.call(element, key)) {
                    data[i + 1].push(element[key]);
                }
            }
        }
        return data;
    }
}

//delets previous file or continues if it does not exist, converts JSON to Excel
const toXlsx = (jsondata, file) => {
    fs.unlink(file, (err) => {
        if (err && err.code !== 'ENOENT') throw err;

        var wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "JSON to XLSX",
            CreatedDate: new Date(2017, 12, 19)
        };
        var ws = XLSX.utils.aoa_to_sheet(jsondata);
        XLSX.utils.book_append_sheet(wb, ws, 'JSONData');
        XLSX.writeFile(wb, file);
    });
}
 dbTestMYSQL();
 dbTestMSSQL();