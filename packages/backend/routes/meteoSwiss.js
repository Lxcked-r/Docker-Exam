import express from 'express';

const router = express.Router();

router.use(express.json());

/**
 * Get the current API Version.
 * @name GET /api/v1/meteoswiss/weather
 * @returns {Object} The current weather.
 */
router.get('/version', async (req, res) => {
    const url = 'https://www.meteosuisse.admin.ch/product/output/versions.json';  
    const response = await fetch(url, {
      method: 'GET',
    });
    const data = await response.json();
    res.send(data['weather-widget/forecast']);
}
);

/**
 * Get the current weather.
 * @name GET /api/v1/meteoswiss/weather
 * @returns {Object} The current weather.
 */
router.get('/weather', async (req, res) => {
    const version = req.query.version;
    const location = req.query.location;

    if(!version || !location) {
        res.status(404).send({error: 'Missing parameters'});
        return;
    }

    if(!location.match(/^\d{4}$/)) {
        res.status(404).send({error: 'Invalid location'});
        return;
    }

    const url = `https://www.meteosuisse.admin.ch/product/output/weather-widget/forecast/version__${version}/fr/${location}00.json`;
    const response = await fetch(url);
    try {
    const data = await response.json();
    res.send(data);
    } catch (error) {
        console.log(error);
        res.status(404).send({error: 'An error occurred while fetching the data. (Probably bad postal code)'});
    }

}
);

export default router;