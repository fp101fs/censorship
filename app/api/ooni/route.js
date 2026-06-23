export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '200';
  const url = `https://api.ooni.io/api/v1/measurements?confirmed=true&limit=${limit}`;
  const r = await fetch(url, { next: { revalidate: 60 } });
  const data = await r.json();
  return Response.json(data);
}
