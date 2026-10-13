'use strict';

const { Router } = require('express');
const healthRouter     = require('./health');
const authRouter       = require('./auth');
const propertiesRouter = require('./properties');
const favoritesRouter  = require('./favorites');
const inquiriesRouter  = require('./inquiries');

const router = Router();

router.use('/health',     healthRouter);
router.use('/auth',       authRouter);
router.use('/properties', propertiesRouter);
router.use('/favorites',  favoritesRouter);
router.use('/inquiries',  inquiriesRouter);

module.exports = router;
