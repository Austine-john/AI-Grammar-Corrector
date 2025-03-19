import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index", {
        corrected: "",
        originalText: "",
    });
});

// Main logic route
app.post('/correct', async (req, res) => {
    const text = req.body.text.trim();

    if (!text) {
        return res.render("index", {
            corrected: 'Please enter some text to correct',
            originalText: text,
        });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Correct the following text: ${text}` },
                ],
                max_tokens: 100,
                temperature: 0.5
            }),
        });

        if (!response.ok) {
            console.error("Error response from OpenAI:", response.statusText);
            return res.render("index", {
                corrected: 'Error: Unable to process request. Please try again.',
                originalText: text,
            });
        }

        const data = await response.json();

        if (!data.choices || !data.choices.length) {
            return res.render("index", {
                corrected: 'Error: No response received from AI.',
                originalText: text,
            });
        }

        const correctedText = data.choices[0].message.content.trim();

        return res.render("index", {
            corrected: correctedText,
            originalText: text,
        });

    } catch (error) {
        console.error("Request failed:", error);
        return res.render("index", {
            corrected: 'Error: Unable to connect to AI service.',
            originalText: text,
        });
    }
});

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
