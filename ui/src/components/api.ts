export default async function getGameDetails(url: string) {
  const res = await fetch('/api/apps', { method: 'POST', body: JSON.stringify({ url }), headers: { 'Content-Type': 'application/json' } })
  return res.json()
}