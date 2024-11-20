const { GoogleGenerativeAI, DynamicRetrievalMode } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const apikey = process.env.apikey; 
const dataFilePath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
const genAI = new GoogleGenerativeAI(apikey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
// const model = genAI.getGenerativeModel(
//     {
//       model: "models/gemini-1.5-pro-002",
//       tools: [
//         {
//           googleSearchRetrieval: {
//             dynamicRetrievalConfig: {
//               mode: DynamicRetrievalMode.MODE_DYNAMIC,
//               dynamicThreshold: 0.7,
//             },
//           },
//         },
//       ],
//     },
//     { apiVersion: "v1beta" },
//   );

async function aiGenerate(species) {
    if (typeof species !== 'string') {
        throw new Error('species must be a string');
    }

    const prompt = `
As a wildlife database expert, generate comprehensive scientific and educational data about the ${species}. Follow this exact JSON structure and guidelines:\n\nUse the following template structure exactly (preserving all keys):\n${JSON.stringify(data, null, 2)}\n\nImportant:\n1. Return ONLY the JSON object\n2. Do NOT include any markdown formatting or explanatory text\n3. Ensure all JSON keys match the template exactly\n4. Use proper JSON syntax with double quotes for keys and string values\n5. Use 'None' where necessary\n6. Format arrays as proper JSON arrays with square brackets\n7. Use factual, verifiable information only\n8. Provide context or explanations where beneficial\n\nFollow these guidelines while creating SEO data:\n1. **Front-Load Keywords:** Place main keywords at the start of titles and descriptions.\n2. **Stay Concise:** Keep meta descriptions under 160 characters to prevent truncation.\n3. **Unique for Each Page:** Write distinct metadata for every page to avoid duplication.\n4. **Long-Tail Keywords:** Use specific phrases to target niche searches with high intent.\n5. **Localize Content:** Add location-based keywords for better local SEO.\n6. **Use Power Words:** Add words like 'ultimate,' 'top,' or 'essential' for emotional appeal.\n7. **Natural Tone:** Write conversationally; avoid forced keyword stuffing.\n8. **Include a CTA:** Add 'Learn more' or 'Explore now' to boost click-through rates.\n9. **Match Search Intent:** Tailor keywords to what users are actively searching for.\n10. **Monitor & Adjust:** Track metadata performance and tweak for continuous improvement.\n\nIMPORTANT: Return the raw JSON object only, with no additional formatting or markdown.`;

    try {
        const result = await model.generateContent([prompt]);
        let responseText = result.response.text();
        console.log('responseText', responseText)
        // Remove markdown code blocks and any surrounding whitespace
        responseText = responseText.replace(/```json\s*|\s*```/g, '').trim();

        // Additional cleanup for common formatting issues
        responseText = responseText.replace(/^\s*{\s*/, '{').replace(/\s*}\s*$/, '}');

        // Validate and format JSON
        try {
            const parsedResponse = JSON.parse(responseText);
            return JSON.stringify(parsedResponse, null, 2);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            console.error('Raw response:', responseText);
            return null;
        }
    } catch (error) {
        console.error('API error:', error);
        return null;
    }
}

module.exports = aiGenerate;