import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";

import { Resend } from "resend";

dotenv.config();

let stripeClient: Stripe | null = null;
let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn("RESEND_API_KEY is not set. Real emails will be simulated in logs.");
      return null;
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn("STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.");
      return null;
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email Service
async function sendOrderConfirmationEmail(orderData: any) {
  const resend = getResend();
  
  const emailHtml = `
    <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h1 style="color: #D4AF37; text-align: center;">אישור הזמנה - BYOND Intima</h1>
      <p>שלום ${orderData.firstName},</p>
      <p>תודה שרכשת ב-BYOND Intima! ההזמנה שלך (${orderData.orderId}) התקבלה בהצלחה.</p>
      
      <div style="background: #fdfbf7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">פירוט הזמנה:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #eee;">
              <th style="text-align: right; padding: 10px;">מוצר</th>
              <th style="text-align: center; padding: 10px;">כמות</th>
              <th style="text-align: left; padding: 10px;">מחיר</th>
            </tr>
          </thead>
          <tbody>
            ${orderData.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${item.name}</td>
                <td style="text-align: center; padding: 10px;">${item.quantity}</td>
                <td style="text-align: left; padding: 10px;">₪${item.price || 119}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align: left; margin-top: 15px; font-weight: bold; font-size: 18px;">
          סה"כ לתשלום: ₪${orderData.total}
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <p><strong>כתובת למשלוח:</strong> ${orderData.address}, ${orderData.city}</p>
        <p><strong>טלפון ליצירת קשר:</strong> ${orderData.phone}</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="text-align: center; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} BYOND Intima. כל הזכויות שמורות.
      </p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: 'BYOND Intima <orders@yourdomain.com>', // You need to verify your domain in Resend
        to: orderData.email,
        subject: `אישור הזמנה #${orderData.orderId} - BYOND Intima`,
        html: emailHtml,
      });
      console.log("REAL EMAIL SENT TO:", orderData.email);
      return true;
    } catch (error) {
      console.error("Failed to send real email:", error);
    }
  }

  // Fallback to Simulation
  console.log("=========================================");
  console.log("SIMULATED EMAIL SENT TO:", orderData.email);
  console.log("SUBJECT: אישור הזמנה - BYOND Intima");
  console.log("BODY (HTML Preview):", emailHtml.substring(0, 100) + "...");
  console.log("=========================================");
  
  return true;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  // TMDB Proxy Routes
  app.get("/api/movies/search", async (req, res) => {
    const { query } = req.query;
    try {
      const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}&language=he-IL`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  app.get("/api/movies/popular", async (req, res) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=he-IL`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  app.get("/api/movies/top_rated", async (req, res) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=he-IL`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  app.get("/api/movies/genre/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const response = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${id}&language=he-IL&sort_by=popularity.desc`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  app.get("/api/movies/details/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const [movieRes, videoRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=he-IL`),
        fetch(`${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`)
      ]);
      const movieData = await movieRes.json();
      const videoData = await videoRes.json();
      res.json({ ...movieData, videos: videoData.results });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  // Decks Checkout Route
  app.post("/api/checkout/decks", async (req, res) => {
    const { formData, cart, total, paymentMethod, orderId: providedOrderId } = req.body;
    const orderId = providedOrderId || 'BYD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    try {
      // 1. Handle Payment Logic
      let paymentUrl = null;

      if (paymentMethod === 'credit-card') {
        const stripe = getStripe();
        if (stripe) {
          // Real Stripe Integration
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: Object.values(cart).map((item: any) => ({
              price_data: {
                currency: "ils",
                product_data: { name: `BYOND ${item.name || 'Product'}` },
                unit_amount: Math.round((item.price || 119) * 100),
              },
              quantity: item.quantity,
            })),
            mode: "payment",
            success_url: `${baseUrl}/order-confirmation?success=true&orderId=${orderId}`,
            cancel_url: `${baseUrl}/checkout?canceled=true`,
          });
          paymentUrl = session.url;
        } else {
          // Simulated Success for Demo if Stripe not configured
          console.log("Stripe not configured, simulating success...");
        }
      }

      // 2. Send Confirmation Email (Simulated)
      await sendOrderConfirmationEmail({
        ...formData,
        orderId,
        total,
        items: Object.values(cart)
      });

      // 3. Save to Database (Optional, but good for tracking)
      // db.prepare("INSERT INTO orders ...").run(...);

      res.json({ 
        success: true, 
        orderId,
        paymentUrl,
        message: paymentMethod === 'phone' ? "הזמנה טלפונית התקבלה" : "הזמנה בוצעה בהצלחה"
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Checkout Session Route
  app.post("/api/create-checkout-session", async (req, res) => {
    const { priceId, packageName } = req.body;
    const stripe = getStripe();

    if (!stripe) {
      console.log("Stripe not configured, simulating success for package:", packageName);
      return res.json({ url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard?success=true&simulated=true` });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "ils",
              product_data: {
                name: packageName,
                description: `Beyond Intima Experience Package: ${packageName}`,
              },
              unit_amount: priceId === "spark" ? 29900 : priceId === "velvet" ? 49900 : 79900, // Prices in agorot
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard?success=true`,
        cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/experience?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
