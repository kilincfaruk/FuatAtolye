export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  try {
    const apiKey = process.env.GOLDAPI_KEY;
    if (!apiKey) {
      return res.status(200).json({ status: 'missing_key', price: null, lastUpdate: null });
    }

    const response = await fetch('https://www.goldapi.io/api/XAU/TRY', {
      headers: {
        'x-access-token': apiKey
      }
    });
    if (!response.ok) {
      const text = await response.text();
      return res.status(200).json({
        status: 'api_error',
        price: null,
        lastUpdate: null,
        code: response.status,
        message: text?.slice(0, 200)
      });
    }
    const data = await response.json();
    if (!data || Object.keys(data).length === 0) {
      return res.status(200).json({ status: 'empty_response', price: null, lastUpdate: null });
    }
    if (data.error || data.message) {
      return res.status(200).json({
        status: 'api_error',
        price: null,
        lastUpdate: null,
        message: data.message || data.error
      });
    }
    const gram24k = parseFloat(data.price_gram_24k);
    let gramPrice = gram24k;
    if (Number.isNaN(gramPrice)) {
      const ouncePrice = parseFloat(data.price);
      if (!Number.isNaN(ouncePrice)) {
        gramPrice = ouncePrice / 31.1034768;
      }
    }
    if (Number.isNaN(gramPrice)) {
      return res.status(200).json({
        status: 'parse_error',
        price: null,
        lastUpdate: null,
        sample: {
          price: data.price,
          price_gram_24k: data.price_gram_24k,
          keys: Object.keys(data)
        }
      });
    }

    const price = gramPrice.toFixed(2);
    if (!price) {
      return res.status(200).json({ status: 'pending', price: null, lastUpdate: null });
    }
    return res.status(200).json({ status: 'success', price, lastUpdate: new Date().toISOString() });
  } catch (error) {
    return res.status(200).json({ status: 'pending', price: null, lastUpdate: null });
  }
}
