import cors from 'cors';

const allowedOrigins = [
    'http://localhost:5173',           // Vite dev server
    'http://localhost:5174',           // Vite dev server (alt port)
    'http://localhost:3000',           // Alternative dev
    'https://ais-trueque.vercel.app',  // Production
];

export const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Allow allowed origins or any vercel.app subdomain
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.warn(`Blocked CORS for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
    maxAge: 86400, // 24 hours
};

export default corsOptions;
