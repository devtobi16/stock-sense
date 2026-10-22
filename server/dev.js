require('dotenv').config();
require('./portfolioApp').createApp().listen(process.env.PORT || 3001, () => console.log('Portfolio API ready'));
