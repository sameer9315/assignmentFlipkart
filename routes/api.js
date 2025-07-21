const express = require("express");
const OfferController = require("../controllers/offerController");
const DiscountController = require("../controllers/discountController");

const router = express.Router();

//--------------------------------- Offer routes ---------------------------------
router.post("/offer", OfferController.createOffers);
router.get("/offers", OfferController.getAllOffers);

//--------------------------------- Discount routes ---------------------------------
router.get("/highest-discount", DiscountController.getHighestDiscount);

module.exports = router;
