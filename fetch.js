const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const runFetch = async () => {
    try {
        const today = (new Date()).toISOString().split('T')[0];

        //get the fetch from chrome developer console then add "agent: httpsAgent," if you need to ignore selfSigned SSL errors
        const result = await fetch(`https://covid-19-data.p.rapidapi.com/report/country/name?name=Norway&date=${today}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "covid-19-data.p.rapidapi.com",
                "x-rapidapi-key": '57f8ffe761msha0e4b3cbbefced3p132043jsn53310872fe7c'
            },
            agent: httpsAgent,
        });
        console.log(result);
        const data = await result.text();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

runFetch();