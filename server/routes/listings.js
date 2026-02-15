const express = require('express');
const router = express.Router();
const { createListing, getListings, getNearbyListings, getListingById,
    updateListing, deleteListing, getMyListings } = require('../controllers/listingController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getListings);
router.get('/nearby', getNearbyListings);
router.get('/my', auth, getMyListings);
router.get('/:id', getListingById);
router.post('/', auth, upload.array('images', 5), createListing);
router.put('/:id', auth, upload.array('images', 5), updateListing);
router.delete('/:id', auth, deleteListing);

module.exports = router;
