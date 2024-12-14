// /api/expandUrl/[shortUrl]


export async function GET(req: Request) {
    const url = new URL(req.url);
    const shortUrl = url.searchParams.get('shortUrl');

    if (!shortUrl || typeof shortUrl !== 'string') {
        return new Response(JSON.stringify({ error: 'Short Url is required' }), { status: 400 });
    }

    try {
        const response = await fetch(`${shortUrl}`, {
            method: 'GET',
            redirect: 'follow'
        });

        const fullUrl = response.url;

        return new Response(JSON.stringify(fullUrl), { status: 200 })
    } catch (error) {
        console.error('Error expanding URL:', error);
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}