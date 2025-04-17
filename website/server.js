// Simple Express backend for Stripe Dynamic Checkout
// 1. Install dependencies: npm install express stripe cors dotenv
// 2. Set STRIPE_SECRET_KEY in .env file

const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { price, headline, description, image_url, cta, ad_link, impressions } = req.body;
  if (!price || price < 1) {
    return res.status(400).json({ error: 'Invalid price' });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: headline || 'TabForest Ad',
            description: `${description || ''}\nImpressions: ${impressions || ''}`.trim(),
            images: image_url ? [image_url] : undefined,
          },
          unit_amount: Math.round(Number(price) * 100), // Stripe expects cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/ad-submit.html?success=true',
      cancel_url: 'http://localhost:3000/ad-submit.html?canceled=true',
      metadata: {
        cta: cta || '',
        ad_link: ad_link || '',
        impressions: impressions || '',
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create Stripe session' });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
