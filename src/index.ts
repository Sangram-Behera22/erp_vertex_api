import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`ERP Vertex running smoothly with Prisma on http://localhost:${PORT}`);
});
