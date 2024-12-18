import path from "path"
import * as fs from "fs"
import { parse } from 'csv-parse'
import { headers, DetailedModuleInfo } from "@/lib/types"

export async function GET( request: Request, ) {
    const url = new URL(request.url);
    const moduleCodes = url.searchParams.getAll('moduleCode');

    if (!moduleCodes) {
        return new Response(JSON.stringify({ error: 'Module code is required' }), { status: 400 });
    }

    const csvfile = path.join(process.cwd(), 'public', 'detailed_module_info.csv');
    const fileContent = fs.readFileSync(csvfile, 'utf8');

    return new Promise((resolve, reject) => {
        parse(fileContent, {
            delimiter: ',',
            columns: headers
        }, (err, records: DetailedModuleInfo[]) => {
            if (err) {
                console.error('Error parsing CSV file:', err);
                reject(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
            } else {
                const results = moduleCodes.map(moduleCode => {
                    const record = records.find(r => r.moduleCode == moduleCode);
                    return record ? record : { error: 'Module not found', moduleCode };
                });
                resolve(new Response(JSON.stringify(results), { status: 200 }));
            }
        });
    });
}