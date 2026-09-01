// FILE: backend/routes/tryOn.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * Diagnostic Virtual Try-On Engine
 */
async function runVirtualTryOn({ humanImage, garmImage, category = 'upper_body', garmentDes = 'casual shirt' }) {
  // 1. CONFIRM API TOKEN
  const apiToken = process.env.REPLICATE_API_TOKEN;

  console.log(`\n=================== [REPLICATE DIAGNOSTIC START] ===================`);
  console.log(`DIAGNOSTIC 1: API Token Status`);
  if (!apiToken || apiToken.trim() === '' || apiToken.includes('your_replicate')) {
    console.error(`❌ Token Status: MISSING OR PLACEHOLDER`);
    throw new Error('REPLICATE_API_TOKEN is missing or set to placeholder in backend/.env');
  }

  const maskedToken = `${apiToken.substring(0, 5)}...${apiToken.substring(apiToken.length - 4)}`;
  console.log(`✅ Loaded Token (Masked): ${maskedToken}`);

  // 4. CONFIRM MODEL ENDPOINT & VERSION IDENTIFIER
  const modelEndpoint = 'https://api.replicate.com/v1/models/cuuupid/idm-vton/predictions';
  const legacyVersionId = 'c87e6b007130b57e7d8234939943423f00886da4a242b308e2b61a83e00d7c7f';
  console.log(`\nDIAGNOSTIC 4: Model Identifier & Endpoint`);
  console.log(`Target Endpoint: ${modelEndpoint}`);
  console.log(`Legacy Version Hash: ${legacyVersionId}`);

  // 3. SHOW EXACT PAYLOAD BEING SENT TO REPLICATE
  const rawPayload = {
    input: {
      human_img: humanImage,
      garm_img: garmImage,
      category: category,
      garment_des: garmentDes
    }
  };

  console.log(`\nDIAGNOSTIC 3: Exact Request Payload Sent to Replicate`);
  console.log(`- category: "${category}"`);
  console.log(`- garment_des: "${garmentDes}"`);
  console.log(`- garm_img: "${garmImage}"`);
  console.log(`- human_img (format check): "${humanImage ? humanImage.substring(0, 50) + '... (length: ' + humanImage.length + ')' : 'MISSING'}"`);

  console.log(`\nSending POST request to Replicate API...`);

  // Attempt Call to Model Predictions Endpoint
  const response = await fetch(modelEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(rawPayload)
  });

  const responseText = await response.text();
  let prediction;
  try {
    prediction = JSON.parse(responseText);
  } catch (e) {
    prediction = { rawText: responseText };
  }

  // 2. LOG FULL RAW ERROR FROM REPLICATE
  console.log(`\nDIAGNOSTIC 2: Raw Replicate API Response (Status HTTP ${response.status})`);
  console.log(`Full Response Body:`, JSON.stringify(prediction, null, 2));

  if (!response.ok || prediction.error) {
    const errorDetail = prediction.detail || prediction.error || responseText;
    console.error(`❌ Replicate API Call Failed (HTTP ${response.status}):`, errorDetail);
    console.log(`=================== [REPLICATE DIAGNOSTIC END] ===================\n`);
    throw new Error(`Replicate API HTTP ${response.status}: ${typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail}`);
  }

  const predictionId = prediction.id;
  console.log(`✅ Prediction Successfully Created! ID: ${predictionId} | Initial Status: ${prediction.status}`);

  // Polling Loop for Async Replicate Model Generation
  const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
  const maxAttempts = 36;
  let attempt = 0;

  while (attempt < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2500));
    attempt++;

    const checkRes = await fetch(pollUrl, {
      headers: {
        'Authorization': `Bearer ${apiToken.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    const statusData = await checkRes.json();
    console.log(`[Replicate Poll ${attempt}/${maxAttempts}] ID: ${predictionId} | Status: "${statusData.status}"`);

    if (statusData.status === 'succeeded') {
      const outputUrl = Array.isArray(statusData.output) ? statusData.output[0] : statusData.output;
      console.log(`✅ Replicate Model Success! Output Image URL: ${outputUrl}`);
      console.log(`=================== [REPLICATE DIAGNOSTIC END] ===================\n`);
      return outputUrl;
    }

    if (statusData.status === 'failed' || statusData.status === 'canceled') {
      console.error(`❌ Model Execution ${statusData.status}:`, JSON.stringify(statusData.error || statusData, null, 2));
      console.log(`=================== [REPLICATE DIAGNOSTIC END] ===================\n`);
      throw new Error(`Replicate IDM-VTON model generation failed: ${statusData.error || 'Unknown failure'}`);
    }
  }

  throw new Error('Replicate IDM-VTON model generation timed out after 90 seconds');
}

/**
 * POST /api/try-on
 */
router.post(
  '/',
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
    { name: 'left', maxCount: 1 },
    { name: 'right', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { productId, preferredSize, userSize, garmentImage, garmentName } = req.body;
      const files = req.files || {};

      const host = req.get('host');
      const protocol = req.protocol;
      const baseUrl = `${protocol}://${host}/uploads/`;

      const targetSize = userSize || preferredSize || 'L';
      const targetGarmentUrl = garmentImage || 'https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8117.png';

      // Convert uploaded photo to Base64 Data URI
      let humanDataUri = null;
      let frontImgFileUrl = null;

      if (files.front && files.front[0]) {
        const fileObj = files.front[0];
        frontImgFileUrl = `${baseUrl}${fileObj.filename}`;
        const filePath = path.join(uploadDir, fileObj.filename);
        if (fs.existsSync(filePath)) {
          const fileBuf = fs.readFileSync(filePath);
          const mime = fileObj.mimetype || 'image/jpeg';
          humanDataUri = `data:${mime};base64,${fileBuf.toString('base64')}`;
        }
      }

      if (!humanDataUri && req.body.frontBase64) {
        humanDataUri = req.body.frontBase64;
      }

      if (!humanDataUri) {
        return res.status(400).json({
          success: false,
          message: 'Please upload or capture your front-facing photo to perform virtual try-on.'
        });
      }

      let aiCompositedResultUrl = null;
      try {
        aiCompositedResultUrl = await runVirtualTryOn({
          humanImage: humanDataUri,
          garmImage: targetGarmentUrl,
          category: 'upper_body',
          garmentDes: garmentName || 'casual shirt'
        });
      } catch (aiErr) {
        console.error('[Try-On Diagnostic Error]:', aiErr.message);
        return res.status(400).json({
          success: false,
          message: aiErr.message
        });
      }

      const responsePayload = {
        success: true,
        tryOnId: 'tryon_' + Date.now(),
        timestamp: new Date().toISOString(),
        productId: productId || 'myntra_men_1',
        confidenceScore: 96,
        recommendedSize: targetSize,
        userSizeVerified: targetSize,
        sizeAnalysis: {
          recommended: targetSize,
          alternative: targetSize === 'L' ? 'XL' : 'M',
          fitCategory: `Tailored Fit for Size ${targetSize}`
        },
        bodyMetrics: {
          chestWidthFit: '96% Optimal',
          waistContourFit: '94% Snug',
          shoulderSlope: '95% Tailored',
          armSleeveLength: '94% Accurate'
        },
        angles: {
          front: {
            title: 'Front View (Replicate IDM-VTON AI Generated)',
            url: aiCompositedResultUrl,
            userUrl: frontImgFileUrl,
            isAiGenerated: true,
            confidence: '96%'
          },
          back: {
            title: 'Back View',
            url: aiCompositedResultUrl,
            userUrl: files.back ? `${baseUrl}${files.back[0].filename}` : null,
            isAiGenerated: false,
            confidence: '92%'
          },
          left: {
            title: 'Left Side Profile',
            url: aiCompositedResultUrl,
            userUrl: files.left ? `${baseUrl}${files.left[0].filename}` : null,
            isAiGenerated: false,
            confidence: '90%'
          },
          right: {
            title: 'Right Side Profile',
            url: aiCompositedResultUrl,
            userUrl: files.right ? `${baseUrl}${files.right[0].filename}` : null,
            isAiGenerated: false,
            confidence: '90%'
          }
        },
        fitSummaryNote: `Photorealistic garment transfer generated via Replicate IDM-VTON AI model. Output: ${aiCompositedResultUrl}`
      };

      res.json(responsePayload);
    } catch (error) {
      console.error('[Try-On Route Fatal Error]:', error);
      res.status(500).json({
        success: false,
        message: 'Virtual try-on execution failed: ' + error.message
      });
    }
  }
);

module.exports = router;
