const express = require('express');
const app = express();
const PORT = 3000;

const data = {
    name: 'John Doe',
    age: 30,
    email: 'john.doe@example.com'
}
app.get('/hello', (req, res) => {
  res.send('Hello, World!');
  res.json({data});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
