

export async function GET(request: Request) {
    const url = new URL(request.url);
    const shortUrl = url.searchParams.get('url');

    if (!shortUrl) {
        return new Response(JSON.stringify({ error: 'Short URL is required' }), { status: 400 });
    }

    try {
        const apiUrl = new URL(`/api/expandUrl?shortUrl=${encodeURIComponent(shortUrl)}`, request.url).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            redirect: 'follow'
        });

        const fullUrl = await response.json();
        const searchParams = new URLSearchParams(new URL(fullUrl).search);
        const modules: Record<string, Record<string, string>> = {};

        console.log('Full URL:', fullUrl);

        searchParams.forEach((value, key) => {
            console.log('Key:', key, 'Value:', value);
            const moduleCode = key;
            if (!modules[moduleCode]) {
                modules[moduleCode] = {};
            }
            value.split(',').forEach((lesson) => {
                const [lessonType, lessonNumber] = lesson.split(':');
                modules[moduleCode][lessonType] = lessonNumber;
            });
        });
    
        console.log('Parsed Modules:', modules);
        return new Response(JSON.stringify(modules), { status: 200 });
    } catch (error) {
        console.error('Error expanding URL:', error);
        return new Response(JSON.stringify({ error: 'Failed to expand URL' }), { status: 500 });
    }
}