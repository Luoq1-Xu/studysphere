import path from "path"
import * as fs from "fs"
import { parse } from 'csv-parse'

export const dynamic = 'force-static'

type Module = {
    code: string
    title: string
    semesters: string
}
 
export async function GET() {
    const headers = ['code', 'title', 'semesters'];
    const csvfile = path.join(process.cwd(), 'public', 'moduleList.csv');
    const fileContent = fs.readFileSync(csvfile, 'utf8');

    return new Promise((resolve, reject) => {
        parse(fileContent, {
            delimiter: ',',
            columns: headers,
            from_line: 2,
        }, (err, records: Module[]) => {
            if (err) {
                reject(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
            } else {
                resolve(new Response(JSON.stringify(records), { status: 200 }));
            }
        });
    });
}