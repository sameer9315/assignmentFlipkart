const Offer = require("../models/Offer");
const { extractOffersFromFlipkartResponse } = require("../utils/offerParser");

class OfferController {
  static async createOffers(req, res) {
    try {
      const { flipkartOfferApiResponse } = req.body;

      if (!flipkartOfferApiResponse) {
        return res.status(400).json({
          error: "Missing flipkartOfferApiResponse in request body",
        });
      }

      const extractedOffers = extractOffersFromFlipkartResponse(
        flipkartOfferApiResponse
      );

      if (extractedOffers.length === 0) {
        return res.status(400).json({
          error: "No offers found in the provided response",
          noOfOffersIdentified: 0,
          noOfNewOffersCreated: 0,
        });
      }

      let newOffersCreated = 0;
      const creationPromises = [];

      for (const offer of extractedOffers) {
        const promise = Offer.findOrCreate({
          where: { offerId: offer.offerId },
          defaults: offer,
        }).then(([offerInstance, created]) => {
          if (created) {
            newOffersCreated++;
          }
          return { created, offer: offerInstance };
        });

        creationPromises.push(promise);
      }

      await Promise.all(creationPromises);

      res.json({
        noOfOffersIdentified: extractedOffers.length,
        noOfNewOffersCreated: newOffersCreated,
      });
    } catch (error) {
      console.error("Error creating offers:", error);
      res.status(500).json({
        error: "Internal server error while processing offers",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  static async getAllOffers(req, res) {
    try {
      const { bankName, paymentInstrument, isActive = true } = req.query;

      const where = { isActive };

      if (bankName) {
        where.bankName = bankName.toUpperCase();
      }

      if (paymentInstrument) {
        where.paymentInstrument = paymentInstrument;
      }

      const offers = await Offer.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });

      res.json({
        offers,
        count: offers.length,
      });
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({
        error: "Internal server error while fetching offers",
      });
    }
  }
}

module.exports = OfferController;
