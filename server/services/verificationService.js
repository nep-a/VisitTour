const fs = require('fs');
const path = require('path');

/**
 * Simulates an automated identity verification process.
 * In a real application, this would integrate with services like Stripe Identity, Onfido, or AWS Rekognition.
 */
exports.verifyDocument = async (user, file, legalName) => {
    return new Promise((resolve) => {
        const hostType = user.host_type || 'individual';
        // Simulate processing delay
        setTimeout(async () => {
            try {
                // 1. Basic Validation
                if (!file) {
                    return resolve({
                        success: false,
                        reason: 'No document uploaded.'
                    });
                }

                const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
                const ext = path.extname(file.originalname).toLowerCase();
                if (!validExtensions.includes(ext)) {
                    return resolve({
                        success: false,
                        reason: 'Invalid file format. Please upload JPG, PNG, or PDF.'
                    });
                }

                // 2. Simulate OCR and Fraud Detection
                // For demo purposes:
                // - Filenames containing "fake", "invalid", "blur" will fail.
                // - Legal names containing "Unknown" will fail.

                const isFake = file.originalname.toLowerCase().includes('fake');
                const isBlurry = file.originalname.toLowerCase().includes('blur');
                const isInvalid = file.originalname.toLowerCase().includes('invalid');

                if (isFake || isInvalid) {
                    return resolve({
                        success: false,
                        reason: 'Document appears to be invalid or digitally altered.'
                    });
                }

                if (isBlurry) {
                    return resolve({
                        success: false,
                        reason: 'Document is blurry. Please upload a clear image.'
                    });
                }

                // 3. Check Document Type based on Host Type
                if (hostType === 'business') {
                    // Simulate check for business keywords
                    const isBusinessDoc = file.originalname.toLowerCase().includes('cert') ||
                        file.originalname.toLowerCase().includes('registration') ||
                        file.originalname.toLowerCase().includes('business');

                    if (!isBusinessDoc) {
                        // For demo, we might be lenient or strict. Let's be strict if it doesn't look like a cert.
                        // But for now, let's just warn or allow if not explicitly invalid.
                        // Actually, let's enforce it for the demo to show the feature.
                        if (file.originalname.toLowerCase().includes('passport') || file.originalname.toLowerCase().includes('id')) {
                            return resolve({
                                success: false,
                                reason: 'Individual ID provided for Business account. Please upload Business Registration Certificate.'
                            });
                        }
                    }
                } else {
                    // Individual
                    if (file.originalname.toLowerCase().includes('business') || file.originalname.toLowerCase().includes('cert')) {
                        return resolve({
                            success: false,
                            reason: 'Business document provided for Individual account. Please upload National ID or Passport.'
                        });
                    }
                }

                // 3. Simulate Name Matching
                // In a real app, OCR would extract the name from the document.
                // Here we assume the document name matches if the provided legal name doesn't contain "Mismatch".
                if (legalName && legalName.toLowerCase().includes('mismatch')) {
                    return resolve({
                        success: false,
                        reason: 'Name on document does not match the registered legal name.'
                    });
                }

                // Success
                resolve({
                    success: true,
                    extractedName: legalName // Simulated extraction
                });

            } catch (error) {
                console.error("Verification Error:", error);
                resolve({
                    success: false,
                    reason: 'Internal verification error.'
                });
            }
        }, 2000); // 2 second simulated delay
    });
};
