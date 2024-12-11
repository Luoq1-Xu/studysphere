import path from "path"
import * as fs from "fs"
import { parse } from 'csv-parse'

type ModuleInfo = {
    moduleCode: string;
    title: string;
    description: string;
    moduleCredit: number;
    department: string;
    faculty: string;
    workload: string;
    gradingBasisDescription: string;
    semesterData: [
        {
            semester: number;
            covidZones: string;
        }
    ]
    prequisites: string;
    preclusions: string;
    attributes: string;
    corequisites: string;

}
 
export async function GET(
    request: Request, 
) {
    const url = new URL(request.url);
    const moduleCode = url.searchParams.get('moduleCode');
    console.log(moduleCode);

    if (!moduleCode) {
        return new Response(JSON.stringify({ error: 'Module code is required' }), { status: 400 });
    }

    const headers = [
        'moduleCode',
        'title',
        'description',
        'moduleCredit',
        'department',
        'faculty',
        'workload',
        'gradingBasisDescription',
        'semesterData',
        'prequisites',
        'preclusions',
        'attributes',
        'corequisites'
    ];
    const csvfile = path.join(process.cwd(), 'public', 'moduleInfo.csv');
    const fileContent = fs.readFileSync(csvfile, 'utf8');

    return new Promise((resolve, reject) => {
        parse(fileContent, {
            delimiter: ',',
            columns: headers
        }, (err, records: ModuleInfo[]) => {
            if (err) {
                console.error('Error parsing CSV file:', err);
                reject(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
            } else {
                const record = records.find(r => r.moduleCode == moduleCode);
                if (record) {
                    resolve(new Response(JSON.stringify(record), { status: 200 }));
                } else {
                    resolve(new Response(JSON.stringify({ error: 'Module not found' }), { status: 404 }));
                }
            }
        });
    });
}