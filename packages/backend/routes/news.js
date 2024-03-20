/**
 * /api/v1/news
 * news management routes
*/

import express from 'express';
import { createNews, getLastNews } from '../controllers/news.mjs';

import { authenticate } from "../middleware/auth.mjs";

const router = express.Router();
router.use(express.json());

/**
 * Create a new news article.
 * @name POST /api/v1/news
 * @param {string} title - The news article's title.
 * @param {string} body - The news article's body.
 * @returns {Object} The created news article.
 */
router.post('/', async (req, res) => {
    const body = req.body;
    if (!body.title || !body.body) {
        return res.status(400).send('Missing required field');
    }
    const news = await createNews(body);
    if (!news.title || !news.body) {
        return res.status(400).send('Missing required field');
    }
    res.send(news);
}
);

/**
 * Get last new.
 * @name GET /api/v1/news
 * @returns {Object} The last news article.
 */
router.get('/', async (req, res) => {
    const news = await getLastNews();
    if (!news) {
        return res.status(400).send('Missing required field');
    }
    res.send(news);
}
);

export default router;