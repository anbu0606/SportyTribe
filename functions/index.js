/**
 * This file contains multiple Firebase functions for:
 *   Sending individual and bulk emails via SendGrid
 *   Validating user event registrations
 *   Auto-completing past events
 *   Responding to user queries using Gemini AI API
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Defining secrets for secure API keys
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

//sendEmail: Handles sending a single email via SendGrid
exports.sendEmail = onRequest(
  {
    secrets: [SENDGRID_API_KEY],
  },
  async (req, res) => {
    // CORS configuration: Allow only specific origins
    const allowedOrigins = [
      "http://localhost:5173",
      "https://fit5032-assignmentrepo.pages.dev",
    ];
    const origin = req.get("origin");
    if (allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }

    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
      sgMail.setApiKey(SENDGRID_API_KEY.value());
      const { to, subject, text, attachment } = req.body;

      if (!subject || !text) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields." });
      }

      const msg = {
        to: to || "anbuchandran06@gmail.com",
        from: "anbu.amaze@gmail.com",
        subject,
        text,
      };

      if (attachment) {
        msg.attachments = [
          {
            content: attachment.content,
            filename: attachment.filename,
            type: attachment.type,
            disposition: "attachment",
          },
        ];
      }

      await sgMail.send(msg);
      logger.info("Contact form email sent successfully");

      return res
        .status(200)
        .json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
      logger.error("Error sending contact form email:", error);
      return res.status(500).json({
        success: false,
        message: error.response?.body?.errors?.[0]?.message || error.message,
      });
    }
  }
);

// sendBulkEventEmail: Sends bulk emails to event participants
exports.sendBulkEventEmail = onRequest(
  {
    secrets: [SENDGRID_API_KEY],
  },
  async (req, res) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://fit5032-assignmentrepo.pages.dev",
    ];
    const origin = req.get("origin");
    if (allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }

    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
      sgMail.setApiKey(SENDGRID_API_KEY.value());
      const { participants, subject, text } = req.body;

      if (!participants || !Array.isArray(participants) || !subject || !text) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const promises = participants.map(async (p) => {
        const msg = {
          to: p.email,
          from: "anbu.amaze@gmail.com",
          subject,
          text: text.replace("{{name}}", p.name || "Participant"),
        };
        await sgMail.send(msg);
      });

      await Promise.all(promises);
      logger.info(`Bulk emails sent to ${participants.length} participants`);

      return res.status(200).json({
        success: true,
        message: `Emails sent to ${participants.length} participants`,
      });
    } catch (error) {
      logger.error("Error sending bulk event emails:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 validateBookingData: Validates event registration document
 Updates document status to "Registered" or "Pending Review"
 */
exports.validateBookingData = onDocumentCreated(
  "adminUserEvents/{docId}",
  async (event) => {
    const doc = event.data;
    if (!doc) return;

    const data = doc.data();
    const docRef = doc.ref;
    const issues = [];

    if (!data.name || data.name.trim().length < 3) {
      issues.push("Invalid or missing name");
    }
    if (!data.gender || !["Male", "Female", "Other", "Not Specified"].includes(data.gender)) {
      issues.push("Invalid or missing gender");
    }
    if (!data.email || !data.email.includes("@")) {
      issues.push("Invalid or missing email");
    }
    if (!data.Event || !data.Location) {
      issues.push("Missing event details");
    }

    if (issues.length > 0) {
      await docRef.update({
        Status: "Pending Review",
        _validated: false,
        _validatedAt: admin.firestore.FieldValue.serverTimestamp(),
        _validationErrors: issues,
      });
      logger.warn(`Document ${docRef.id} marked as Pending Review`, issues);
    } else {
      await docRef.update({
        Status: "Registered",
        _validated: true,
        _validatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info(`Document ${docRef.id} successfully validated`);
    }
  }
);


//autoCompletePastEvents: Automatically mark past events as Completed
exports.autoCompletePastEvents = onSchedule("every 24 hours", async () => {
  const db = admin.firestore();
  const today = new Date();

  try {
    const snapshot = await db
      .collection("adminUserEvents")
      .where("Status", "==", "Registered")
      .get();

    const batch = db.batch();
    let updatedCount = 0;

    snapshot.forEach((doc) => {
      const eventDate = new Date(doc.data().date);
      if (eventDate < today) {
        batch.update(doc.ref, { Status: "Completed" });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      logger.info(`Updated ${updatedCount} past events to Completed.`);
    } else {
      logger.info("No past events found to update.");
    }

    return null;
  } catch (err) {
    logger.error("autoCompletePastEvents failed:", err);
    throw err;
  }
});


//getGeminiResponse: Sends questions to Gemini AI API
exports.getGeminiResponse = onRequest(
  {
    secrets: [GEMINI_API_KEY],
    cors: ["http://localhost:5173", "https://fit5032-assignmentrepo.pages.dev"],
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(204).send("");

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    try {
      const GEMINI_KEY = GEMINI_API_KEY.value();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: question }] }],
          }),
        }
      );

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No valid response from Gemini.";

      return res.json({ text });
    } catch (err) {
      logger.error("Gemini API error:", err);
      return res.status(500).json({ error: "Failed to fetch response from Gemini" });
    }
  }
);
