import axios from 'axios';

async function testSingleSymbol() {
  const apiKey = 'TC2XQM77R76TK82N';
  const symbol = 'JKSE'; // Jakarta Composite Index
  
  try {
    console.log(`Fetching data for ${symbol}...`);
    
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: apiKey
      }
    });

    console.log('\nAPI Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

testSingleSymbol();