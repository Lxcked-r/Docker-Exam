/**
 * /api/v1/news
 * news management routes
*/

import express from 'express';
import { createNews, getLastNews, deleteNews } from '../controllers/news.mjs';

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
});

/**
 * Get last new.
 * @name GET /api/v1/news
 * @returns {Object} The last news article.
 */
router.get('/', async (req, res) => {
    const news = await getLastNews();
    if (!news){
        return res.status(400).send('Missing required field');
    }
    if (news.createdAt < new Date(new Date().setDate(new Date().getDate() - 2))){
        return res.status(400).send('No news in the last 48 hours');
    }
    res.send(news);
});

/**
 * Delete a news article.
 * @name DELETE /api/v1/news
 * @param {string} id - The news article's id.
 * @returns {Object} The deleted news article.
 */
router.delete('/', authenticate(), async (req, res) => {
    const body = req.body;
    if (!body.id) {
        return res.status(400).send('Missing required field');
    }
    const news = await deleteNews(body.id);
    if (!news) {
        return res.status(400).send('Missing required field');
    }
    res.send(news);
});

export default router;