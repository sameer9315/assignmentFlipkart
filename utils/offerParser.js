function extractOffersFromFlipkartResponse(flipkartResponse) {
  const offers = [];

  try {
    if (flipkartResponse.offers && Array.isArray(flipkartResponse.offers)) {
      flipkartResponse.offers.forEach((offer) => {
        const parsedOffer = parseIndividualOffer(offer);
        if (parsedOffer) {
          offers.push(parsedOffer);
        }
      });
    }

    if (flipkartResponse.data && flipkartResponse.data.offers) {
      flipkartResponse.data.offers.forEach((offer) => {
        const parsedOffer = parseIndividualOffer(offer);
        if (parsedOffer) {
          offers.push(parsedOffer);
        }
      });
    }

    if (flipkartResponse.bankOffers) {
      Object.keys(flipkartResponse.bankOffers).forEach((bank) => {
        const bankOffers = flipkartResponse.bankOffers[bank];
        if (Array.isArray(bankOffers)) {
          bankOffers.forEach((offer) => {
            const parsedOffer = parseIndividualOffer(offer, bank);
            if (parsedOffer) {
              offers.push(parsedOffer);
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Error parsing Flipkart response:", error);
  }

  return offers;
}

function parseIndividualOffer(offer, bankNameOverride = null) {
  try {
    const offerId = offer.id || offer.offerId || generateOfferHash(offer);

    const bankName =
      bankNameOverride ||
      offer.bankName ||
      offer.bank ||
      extractBankFromTitle(offer.title || offer.description);

    if (!bankName || !offerId) {
      return null;
    }

    const paymentInstrument = extractPaymentInstrument(offer);

    const discountInfo = extractDiscountInfo(offer);

    const minAmount = extractMinAmount(offer);

    return {
      offerId: String(offerId),
      title: offer.title || offer.summary || "Bank Offer",
      description: offer.description || offer.details || offer.title || "",
      bankName: bankName.toUpperCase(),
      paymentInstrument: paymentInstrument,
      minAmount: minAmount,
      discountType: discountInfo.type,
      discountAmount: discountInfo.amount,
      discountPercent: discountInfo.percent,
      maxDiscount: discountInfo.maxDiscount,
      validFrom: offer.validFrom ? new Date(offer.validFrom) : null,
      validTo: offer.validTo ? new Date(offer.validTo) : null,
      isActive: offer.isActive !== false,
    };
  } catch (error) {
    console.error("Error parsing individual offer:", error);
    return null;
  }
}

function extractBankFromTitle(text) {
  if (!text) return null;

  const bankPattern =
    /(AXIS|HDFC|ICICI|SBI|KOTAK|IDFC|CITI|AMEX|RBL|YES|INDUSIND|BOB|PNB|CANARA)/i;
  const match = text.match(bankPattern);
  return match ? match[1].toUpperCase() : null;
}

function extractPaymentInstrument(offer) {
  const text = `${offer.title || ""} ${offer.description || ""}`.toLowerCase();

  if (text.includes("emi") || text.includes("installment")) {
    return "EMI_OPTIONS";
  }
  if (text.includes("credit")) {
    return "CREDIT";
  }
  if (text.includes("debit")) {
    return "DEBIT";
  }

  return offer.paymentInstrument || "CREDIT"; // Default assumption
}

function extractDiscountInfo(offer) {
  const result = {
    type: "FLAT",
    amount: null,
    percent: null,
    maxDiscount: null,
  };

  if (offer.discountType) {
    result.type = offer.discountType;
    result.amount = offer.discountAmount;
    result.percent = offer.discountPercent;
    result.maxDiscount = offer.maxDiscount;
    return result;
  }

  const text = `${offer.title || ""} ${offer.description || ""}`;

  const percentMatch = text.match(/(\d+)%.*?(?:upto|up to|maximum).*?₹?(\d+)/i);
  if (percentMatch) {
    result.type = "PERCENTAGE";
    result.percent = parseFloat(percentMatch[1]);
    result.maxDiscount = parseFloat(percentMatch[2]);
    return result;
  }

  const flatMatch = text.match(/₹(\d+)/);
  if (flatMatch) {
    result.type = "FLAT";
    result.amount = parseFloat(flatMatch[1]);
    return result;
  }

  result.amount = 100;
  return result;
}

function extractMinAmount(offer) {
  if (offer.minAmount) {
    return parseFloat(offer.minAmount);
  }

  const text = `${offer.title || ""} ${offer.description || ""}`;
  const minAmountMatch = text.match(/minimum.*?₹(\d+)/i);

  return minAmountMatch ? parseFloat(minAmountMatch[1]) : 0;
}

function generateOfferHash(offer) {
  const hashString = `${offer.title || ""}${offer.description || ""}${
    offer.bankName || ""
  }`;
  return (
    hashString.replace(/\s+/g, "").toLowerCase().substring(0, 20) + Date.now()
  );
}

module.exports = {
  extractOffersFromFlipkartResponse,
  parseIndividualOffer,
};
