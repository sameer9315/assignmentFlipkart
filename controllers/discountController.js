const Offer = require("../models/Offer");
const { Op } = require("sequelize");

class DiscountController {
  static async getHighestDiscount(req, res) {
    try {
      const { amountToPay, bankName, paymentInstrument } = req.query;

      if (!amountToPay || !bankName) {
        return res.status(400).json({
          error:
            "Missing required parameters: amountToPay and bankName are required",
        });
      }

      const amount = parseFloat(amountToPay);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          error: "amountToPay must be a positive number",
        });
      }

      const whereConditions = {
        bankName: bankName.toUpperCase(),
        minAmount: { [Op.lte]: amount },
        isActive: true,
      };

      if (paymentInstrument) {
        whereConditions.paymentInstrument = paymentInstrument;
      }

      const currentDate = new Date();
      whereConditions[Op.or] = [
        { validTo: null },
        { validTo: { [Op.gte]: currentDate } },
      ];
      whereConditions[Op.and] = [
        {
          [Op.or]: [
            { validFrom: null },
            { validFrom: { [Op.lte]: currentDate } },
          ],
        },
      ];

      const offers = await Offer.findAll({
        where: whereConditions,
      });

      if (offers.length === 0) {
        return res.json({
          highestDiscountAmount: 0,
          message: "No applicable offers found for the given criteria",
        });
      }

      let highestDiscount = 0;
      let bestOffer = null;

      for (const offer of offers) {
        const discount = DiscountController.calculateDiscount(offer, amount);
        if (discount > highestDiscount) {
          highestDiscount = discount;
          bestOffer = offer;
        }
      }

      res.json({
        highestDiscountAmount: parseFloat(highestDiscount.toFixed(2)),
        applicableOffersCount: offers.length,
        bestOffer: bestOffer
          ? {
              id: bestOffer.id,
              title: bestOffer.title,
              bankName: bestOffer.bankName,
              paymentInstrument: bestOffer.paymentInstrument,
            }
          : null,
      });
    } catch (error) {
      console.error("Error calculating highest discount:", error);
      res.status(500).json({
        error: "Internal server error while calculating discount",
      });
    }
  }

  static calculateDiscount(offer, amountToPay) {
    try {
      if (offer.discountType === "FLAT") {
        return offer.discountAmount || 0;
      } else if (offer.discountType === "PERCENTAGE") {
        const calculatedDiscount =
          (amountToPay * (offer.discountPercent || 0)) / 100;
        const maxDiscount = offer.maxDiscount || calculatedDiscount;
        return Math.min(calculatedDiscount, maxDiscount);
      }
      return 0;
    } catch (error) {
      console.error("Error in discount calculation:", error);
      return 0;
    }
  }
}

module.exports = DiscountController;
