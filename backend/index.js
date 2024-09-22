const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Your user details
const USER_ID = "your_full_name_ddmmyyyy";
const EMAIL = "your_email@srm.edu.in";
const ROLL_NUMBER = "your_roll_number";

function isValidBase64(str) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

app.post('/bfhl', (req, res) => {
    try {
        const { data, file_b64 } = req.body;

        if (!Array.isArray(data)) {
            throw new Error('Invalid data format. Expected an array.');
        }

        // Process data
        const numbers = data.filter(item => !isNaN(item));
        const alphabets = data.filter(item => isNaN(item) && typeof item === 'string' && item.length === 1);
        const highestLowercase = alphabets
            .filter(char => char === char.toLowerCase())
            .sort((a, b) => b.localeCompare(a))[0] || undefined;

        // Process file
        let fileValid = false;
        let fileMimeType = null;
        let fileSizeKb = null;

        if (file_b64) {
            if (isValidBase64(file_b64)) {
                const buffer = Buffer.from(file_b64, 'base64');
                fileValid = true;
                fileSizeKb = (buffer.length / 1024).toFixed(2);
                
                // Determine MIME type (simple check)
                if (file_b64.startsWith('/9j/')) {
                    fileMimeType = 'image/jpeg';
                } else if (file_b64.startsWith('iVBORw0KGgo')) {
                    fileMimeType = 'image/png';
                } else if (file_b64.startsWith('JVBERi0')) {
                    fileMimeType = 'application/pdf';
                } else {
                    fileMimeType = 'application/octet-stream';
                }
            }
        }

        res.json({
            is_success: true,
            user_id: USER_ID,
            email: EMAIL,
            roll_number: ROLL_NUMBER,
            numbers,
            alphabets,
            highest_lowercase_alphabet: highestLowercase ? [highestLowercase] : [],
            file_valid: fileValid,
            file_mime_type: fileMimeType,
            file_size_kb: fileSizeKb
        });
    } catch (error) {
        res.status(400).json({ is_success: false, error: error.message });
    }
});

app.get('/bfhl', (req, res) => {
    res.json({ operation_code: 1 });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});