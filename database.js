const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const mongoDbPath = path.join(__dirname, "data", "mongodb");
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const mongoDbName = process.env.MONGODB_DB || "foodrescue";
const stageOrder = ["pending", "picked_up", "in_transit", "delivered"];

let client;
let database;
let initPromise;

function nowIso() {
  return new Date().toISOString();
}

function toIso(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toPositiveNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : fallback;
}

async function getDb() {
  if (!initPromise) {
    initPromise = initializeDatabase().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  await initPromise;
  return database;
}

async function initializeDatabase() {
  fs.mkdirSync(mongoDbPath, { recursive: true });

  client = new MongoClient(mongoUri);
  await client.connect();

  database = client.db(mongoDbName);
  const donationsCollection = database.collection("donations");
  const deliveriesCollection = database.collection("deliveries");

  await Promise.all([
    donationsCollection.createIndex({ id: 1 }, { unique: true }),
    donationsCollection.createIndex({ status: 1 }),
    donationsCollection.createIndex({ donorType: 1 }),
    deliveriesCollection.createIndex({ id: 1 }, { unique: true }),
    deliveriesCollection.createIndex({ donationId: 1 }, { unique: true }),
    deliveriesCollection.createIndex({ stage: 1 }),
    deliveriesCollection.createIndex({ trackingCode: 1 }, { unique: true }),
    database.collection("counters").createIndex({ name: 1 }, { unique: true })
  ]);

  await ensureSeedData();
}

async function getNextSequence(counterName) {
  const db = await getDb();
  const counters = db.collection("counters");

  await counters.updateOne(
    { name: counterName },
    { $inc: { value: 1 } },
    { upsert: true }
  );

  const counter = await counters.findOne({ name: counterName });
  return counter?.value || 1;
}

async function syncCounters() {
  const db = await getDb();
  const counters = db.collection("counters");
  const donations = db.collection("donations");
  const deliveries = db.collection("deliveries");

  const lastDonation = await donations.find().sort({ id: -1 }).limit(1).next();
  const lastDelivery = await deliveries.find().sort({ id: -1 }).limit(1).next();

  await counters.updateOne(
    { name: "donationId" },
    { $max: { value: lastDonation?.id || 0 } },
    { upsert: true }
  );

  await counters.updateOne(
    { name: "deliveryId" },
    { $max: { value: lastDelivery?.id || 0 } },
    { upsert: true }
  );
}

async function ensureSeedData() {
  const db = await getDb();
  const donations = db.collection("donations");
  const deliveries = db.collection("deliveries");

  const totalDonations = await donations.countDocuments();
  if (totalDonations > 0) {
    await syncCounters();
    return;
  }

  const createdAt = nowIso();
  await donations.insertMany([
    {
      id: 1,
      organizationName: "Grand Palace Hotel",
      donorType: "Hotel",
      contactName: "John Doe",
      contactPhone: "+91 98765 43210",
      foodType: "Mixed Cuisine (Indian & Continental)",
      foodDescription:
        "Leftover from wedding reception - Vegetarian biryani, dal makhani, paneer dishes, salads, and desserts.",
      quantityKg: 50,
      servings: 100,
      area: "Connaught Place, New Delhi",
      address: "Block A, Connaught Place, New Delhi",
      pickupTime: "2026-02-10T21:00:00.000Z",
      bestBefore: "2026-02-10T23:00:00.000Z",
      status: "available",
      claimedByOrg: null,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: 2,
      organizationName: "Spice Garden Restaurant",
      donorType: "Restaurant",
      contactName: "Amit Sharma",
      contactPhone: "+91 98765 00001",
      foodType: "North Indian Cuisine",
      foodDescription: "Fresh prepared food - Roti, rice, chicken curry, vegetable dishes.",
      quantityKg: 25,
      servings: 50,
      area: "Karol Bagh, New Delhi",
      address: "Street 14, Karol Bagh, New Delhi",
      pickupTime: "2026-02-10T22:00:00.000Z",
      bestBefore: "2026-02-11T00:00:00.000Z",
      status: "available",
      claimedByOrg: null,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: 3,
      organizationName: "Royal Banquet Hall",
      donorType: "Event",
      contactName: "Nisha Verma",
      contactPhone: "+91 98765 00002",
      foodType: "Traditional Indian",
      foodDescription: "Wedding ceremony food - Dal, sabzi, roti, rice, raita, and sweets.",
      quantityKg: 60,
      servings: 120,
      area: "Dwarka, New Delhi",
      address: "Sector 9, Dwarka, New Delhi",
      pickupTime: "2026-02-10T23:00:00.000Z",
      bestBefore: "2026-02-11T01:00:00.000Z",
      status: "delivered",
      claimedByOrg: "Serving Humanity",
      createdAt,
      updatedAt: createdAt
    }
  ]);

  await deliveries.insertOne({
    id: 1,
    donationId: 3,
    trackingCode: "TRK-D2",
    stage: "delivered",
    recipientOrg: "Serving Humanity",
    recipientLocation: "Jamia Nagar, New Delhi",
    driverName: "Amit Singh",
    driverPhone: "+91 99887 66554",
    estimatedMinutes: 0,
    createdAt,
    updatedAt: createdAt
  });

  await syncCounters();
}

function stripMongoId(document) {
  if (!document) {
    return null;
  }

  const { _id, ...rest } = document;
  return rest;
}

async function listDonations(filters = {}) {
  const db = await getDb();
  const query = {};

  if (filters.search) {
    const safeSearch = escapeRegex(filters.search.trim());
    if (safeSearch) {
      query.$or = [
        { organizationName: { $regex: safeSearch, $options: "i" } },
        { foodType: { $regex: safeSearch, $options: "i" } },
        { area: { $regex: safeSearch, $options: "i" } }
      ];
    }
  }

  if (filters.donorType && filters.donorType !== "All") {
    query.donorType = filters.donorType;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const donations = await db.collection("donations").find(query).sort({ createdAt: -1 }).toArray();
  return donations.map(stripMongoId);
}

async function getDonationById(id) {
  const db = await getDb();
  const donation = await db.collection("donations").findOne({ id: Number(id) });
  return stripMongoId(donation);
}

async function createDonation(payload) {
  const db = await getDb();
  const pickupIso = toIso(payload.pickupTime);
  const bestBeforeIso = toIso(payload.bestBefore);

  if (!pickupIso || !bestBeforeIso) {
    const error = new Error("Invalid pickupTime or bestBefore format.");
    error.status = 400;
    throw error;
  }

  const createdAt = nowIso();
  const nextId = await getNextSequence("donationId");

  const donation = {
    id: nextId,
    organizationName: payload.organizationName,
    donorType: payload.donorType,
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    foodType: payload.foodType,
    foodDescription: payload.foodDescription,
    quantityKg: toPositiveNumber(payload.quantityKg, 0),
    servings: toPositiveNumber(payload.servings, 0),
    area: payload.area,
    address: payload.address,
    pickupTime: pickupIso,
    bestBefore: bestBeforeIso,
    status: "available",
    claimedByOrg: null,
    createdAt,
    updatedAt: createdAt
  };

  await db.collection("donations").insertOne(donation);
  return stripMongoId(donation);
}

async function claimDonation(donationId, payload) {
  const db = await getDb();
  const numericDonationId = Number(donationId);
  const now = nowIso();

  const updateResult = await db.collection("donations").updateOne(
    { id: numericDonationId, status: "available" },
    {
      $set: {
        status: "claimed",
        claimedByOrg: payload.recipientOrg,
        updatedAt: now
      }
    }
  );

  if (updateResult.matchedCount === 0) {
    const existing = await db.collection("donations").findOne({ id: numericDonationId });
    if (!existing) {
      const notFoundError = new Error("Donation not found.");
      notFoundError.status = 404;
      throw notFoundError;
    }

    const conflictError = new Error("Donation is not available for claim.");
    conflictError.status = 409;
    throw conflictError;
  }

  const nextDeliveryId = await getNextSequence("deliveryId");
  const trackingCode = `TRK-D${numericDonationId}-${Date.now().toString().slice(-4)}`;
  const delivery = {
    id: nextDeliveryId,
    donationId: numericDonationId,
    trackingCode,
    stage: "pending",
    recipientOrg: payload.recipientOrg,
    recipientLocation: payload.recipientLocation,
    driverName: payload.driverName,
    driverPhone: payload.driverPhone,
    estimatedMinutes: toPositiveNumber(payload.estimatedMinutes, 45),
    createdAt: now,
    updatedAt: now
  };

  await db.collection("deliveries").insertOne(delivery);
  const donation = await getDonationById(numericDonationId);
  const storedDelivery = await getDeliveryById(nextDeliveryId);
  return { donation, delivery: storedDelivery };
}

async function listDeliveries(filters = {}) {
  const db = await getDb();
  const query = {};

  if (filters.stage) {
    query.stage = filters.stage;
  }

  const deliveries = await db.collection("deliveries").find(query).sort({ createdAt: -1 }).toArray();
  if (!deliveries.length) {
    return [];
  }

  const donationIds = [...new Set(deliveries.map((delivery) => delivery.donationId))];
  const donationDocuments = await db
    .collection("donations")
    .find({ id: { $in: donationIds } })
    .toArray();

  const donationMap = new Map(donationDocuments.map((donation) => [donation.id, stripMongoId(donation)]));

  return deliveries.map((delivery) => {
    const deliveryValue = stripMongoId(delivery);
    return {
      ...deliveryValue,
      donation: donationMap.get(delivery.donationId) || null
    };
  });
}

async function getDeliveryById(id) {
  const db = await getDb();
  const delivery = await db.collection("deliveries").findOne({ id: Number(id) });
  if (!delivery) {
    return null;
  }

  const donation = await getDonationById(delivery.donationId);
  return {
    ...stripMongoId(delivery),
    donation
  };
}

async function updateDeliveryStage(deliveryId, stage, estimatedMinutes) {
  if (!stageOrder.includes(stage)) {
    const validationError = new Error("Invalid stage value.");
    validationError.status = 400;
    throw validationError;
  }

  const db = await getDb();
  const numericDeliveryId = Number(deliveryId);
  const existingDelivery = await getDeliveryById(numericDeliveryId);
  if (!existingDelivery) {
    const notFoundError = new Error("Delivery not found.");
    notFoundError.status = 404;
    throw notFoundError;
  }

  const currentIndex = stageOrder.indexOf(existingDelivery.stage);
  const requestedIndex = stageOrder.indexOf(stage);
  if (requestedIndex < currentIndex) {
    const conflictError = new Error("Cannot move delivery stage backwards.");
    conflictError.status = 409;
    throw conflictError;
  }

  const now = nowIso();
  const nextEstimatedMinutes =
    estimatedMinutes === undefined || estimatedMinutes === null
      ? existingDelivery.estimatedMinutes
      : toPositiveNumber(estimatedMinutes, existingDelivery.estimatedMinutes);

  await db.collection("deliveries").updateOne(
    { id: numericDeliveryId },
    {
      $set: {
        stage,
        estimatedMinutes: nextEstimatedMinutes,
        updatedAt: now
      }
    }
  );

  if (stage === "delivered") {
    await db.collection("donations").updateOne(
      { id: existingDelivery.donationId },
      {
        $set: {
          status: "delivered",
          updatedAt: now
        }
      }
    );
  }

  return getDeliveryById(numericDeliveryId);
}

async function getStats() {
  const db = await getDb();
  const donations = db.collection("donations");
  const deliveries = db.collection("deliveries");

  const [
    totalDonations,
    availableDonations,
    claimedDonations,
    deliveredDonations,
    totalDeliveries,
    completedDeliveries,
    servingsAggregation
  ] = await Promise.all([
    donations.countDocuments(),
    donations.countDocuments({ status: "available" }),
    donations.countDocuments({ status: "claimed" }),
    donations.countDocuments({ status: "delivered" }),
    deliveries.countDocuments(),
    deliveries.countDocuments({ stage: "delivered" }),
    donations.aggregate([{ $group: { _id: null, totalServings: { $sum: "$servings" } } }]).toArray()
  ]);

  return {
    totalDonations,
    totalServings: servingsAggregation[0]?.totalServings || 0,
    availableDonations,
    claimedDonations,
    deliveredDonations,
    totalDeliveries,
    completedDeliveries
  };
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    database = null;
    initPromise = null;
  }
}

module.exports = {
  mongoUri,
  mongoDbName,
  mongoDbPath,
  createDonation,
  claimDonation,
  listDonations,
  getDonationById,
  listDeliveries,
  getDeliveryById,
  updateDeliveryStage,
  getStats,
  closeDatabase
};
