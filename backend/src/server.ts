import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`
  🚀 AIS Trueque API Server
  ========================
  Environment: ${process.env.NODE_ENV || 'development'}
  Port: ${PORT}
  Health: http://localhost:${PORT}/health
  API: http://localhost:${PORT}/api
  `);
});
