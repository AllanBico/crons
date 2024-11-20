const axios = require('axios');
const aiGenerate = require('./generative')
const fs = require('fs');
// Define the API endpoint
const apiUrl = 'https://api.earthlog.org/species';

// Function to fetch species data
async function fetchSpecies() {
    try {
        // Make a GET request to the API
        const response = await axios.get(apiUrl);

        // Check if the response contains data
        if (response.data) {
            return response.data;
        } else {
            return 'No inactive species found';
        }
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            return `Error: ${error.response.status} ${error.response.data}`;
        } else if (error.request) {
            // The request was made but no response was received
            return `No response received: ${error.request}`;
        } else {
            // Something happened in setting up the request that triggered an Error
            return `Error setting up the request: ${error.message}`;
        }
    }
}
async function dataSetup() {
    const data = await fetchSpecies();
    if (data) {
        const speciesName = `${data.genus} ${data.species}`;
        console.log('Generating data for:', speciesName);
        console.log('data id',data.id)
        try {
            const article = await aiGenerate(speciesName);
            if (article) {
                try {
                    //fs.rmSync(`./data`, { recursive: true, force: true });
                    //fs.mkdirSync(`./data`);
                    //fs.writeFileSync(`./data/${speciesName.replace(/\s+/g, '_')}.json`, article);
                    //console.log('Data generated and saved for:', speciesName);
                    const articleData = {
                        speciesId: data.id,
                        article: article
                    };
                    const response = await axios.post(apiUrl, articleData);
                    console.log('Data sent to API:', response.data);
                } catch (parseError) {
                    console.error(`Error sending article for ${speciesName}:`, parseError);
                }
            } else {
                console.error(`Error generating article for ${speciesName}`);
            }
        } catch (error) {
            console.error(`Error generating article for ${speciesName}:`, error);
        }
    } else {
        console.error(`Error getting species data`);
    }
}
async function main() {
    setInterval(async () => {
        try {
            await dataSetup();
        } catch (error) {
          console.error('Error running dataAutomate:', error);
        }
      }, 60000); // 60000 milliseconds = 1 minute
    
}

main();