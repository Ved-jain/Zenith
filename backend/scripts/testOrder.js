const http = require('http');

async function testOrder() {
  const registerData = JSON.stringify({ name: "Test User", email: "test@example.com", password: "password123" });
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(registerData) }
  };

  const req = http.request(options, (res) => {
    const cookie = res.headers['set-cookie']?.[0];
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Ignore if user already exists
      
      const loginData = JSON.stringify({ email: "test@example.com", password: "password123" });
      const loginReq = http.request({ ...options, path: '/auth/login', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) } }, (loginRes) => {
        const loginCookie = loginRes.headers['set-cookie']?.[0];
        
        const orderData = JSON.stringify({ symbol: "INFY", name: "Infosys", mode: "BUY", qty: 10, price: 1500 });
        const orderReq = http.request({
          hostname: 'localhost', port: 3002, path: '/newOrder', method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(orderData),
            'Cookie': loginCookie || cookie
          }
        }, (orderRes) => {
          let orderResponse = '';
          orderRes.on('data', chunk => orderResponse += chunk);
          orderRes.on('end', () => {
            console.log("Order Response:", orderResponse);
            process.exit(0);
          });
        });
        orderReq.write(orderData);
        orderReq.end();
      });
      loginReq.write(loginData);
      loginReq.end();
    });
  });
  req.write(registerData);
  req.end();
}

testOrder();
