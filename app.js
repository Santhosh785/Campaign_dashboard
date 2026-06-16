import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import trackRoute from './routes/track.js';
import productViewed from './routes/shopify/productViewed.js';
import productAddedToCart from './routes/shopify/productAddedToCart.js';
import checkoutStarted from './routes/shopify/checkoutStarted.js';
import checkoutCompleted from './routes/shopify/checkoutCompleted.js';
import productRemovedFromCart from './routes/shopify/productRemovedFromCart.js';
import dashboardRoute from './routes/dashboard.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/test', trackRoute);
app.use('/api/dashboard', dashboardRoute);

app.use('/shopify-events/product-viewed', productViewed);
app.use('/shopify-events/product-added-to-cart', productAddedToCart);
app.use('/shopify-events/checkout-started', checkoutStarted);
app.use('/shopify-events/checkout-completed', checkoutCompleted);
app.use('/shopify-events/product-removed-from-cart', productRemovedFromCart);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

export default app;
