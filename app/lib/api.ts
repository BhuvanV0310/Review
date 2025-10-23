export async function fetchTopWorstReviews(url: string = '/top_worst_reviews.json') {
		try {
			const res = await fetch(url, { cache: 'no-store' });
			if (!res.ok) {
				console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
				return [];
			}
			const data = await res.json();
			return data;
		} catch (err) {
			console.error('fetchTopWorstReviews error:', err);
			return [];
		}
}
