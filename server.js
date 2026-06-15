import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import trackRoute from './routes/track.js';
import productViewed from './routes/shopify/productViewed.js';
import productAddedToCart from './routes/shopify/productAddedToCart.js';
import checkoutStarted from './routes/shopify/checkoutStarted.js';
import checkoutCompleted from './routes/shopify/checkoutCompleted.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/test', trackRoute);

// Shopify analytics routes
app.use('/shopify-events/product-viewed', productViewed);
app.use('/shopify-events/product-added-to-cart', productAddedToCart);
app.use('/shopify-events/checkout-started', checkoutStarted);
app.use('/shopify-events/checkout-completed', checkoutCompleted);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
