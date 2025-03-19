const axios = require('axios');

const processWithGPT = async (text) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: `Analyze this document:\n\n${text}\n\nGenerate actionable insights.`,
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('GPT API Error:', error.message);
    throw new Error('Error processing with GPT');
  }
};

module.exports = { processWithGPT };
