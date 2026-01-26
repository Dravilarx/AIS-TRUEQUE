import { Router } from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import admin from '../config/firebase';
import { authMiddleware } from '../middleware/auth.middleware';

const db = admin.firestore();
const router = Router();

// Aquí le decimos a la app quién eres en Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

// Esta es la dirección que creará el link de cobro
router.post('/create-preference', authMiddleware, async (req, res) => {
    try {
        const uid = req.user?.uid;
        const email = req.user?.email;

        if (!uid || !email) {
            return res.status(400).json({ error: 'Usuario o Email no identificados' });
        }

        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: 'membresia-anual',
                        title: 'Membresía Anual Colegio',
                        quantity: 1,
                        unit_price: 10000,
                        currency_id: 'CLP',
                    }
                ],
                payer: { email: email },
                external_reference: uid,
                back_urls: {
                    success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago-exitoso`,
                    failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago-fallido`,
                    pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago-pendiente`,
                },
                auto_return: 'approved',
                notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
            }
        });

        res.json({ id: response.id, init_point: response.init_point });
    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({ error: 'No pudimos crear el pago' });
    }
});

// Webhook para recibir notificaciones de Mercado Pago
router.post('/webhook', async (req, res) => {
    const { query } = req;
    const topic = query.topic || query.type;

    try {
        if (topic === 'payment') {
            const paymentId = query.id || query['data.id'];
            const payment = new Payment(client);
            const data = await payment.get({ id: String(paymentId) });

            if (data.status === 'approved') {
                const uid = data.external_reference;

                if (uid) {
                    // Actualizar el estado de membresía del usuario en Firestore
                    const userRef = db.collection('users').doc(uid);
                    await userRef.update({
                        'membership.status': 'active',
                        'membership.plan': 'annual',
                        'membership.expiresAt': admin.firestore.Timestamp.fromDate(
                            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        ),
                        'membership.startedAt': admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    console.log(`Membresía activada para el usuario: ${uid}`);
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

export default router;