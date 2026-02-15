const mongoose = require('mongoose');
const dns = require('dns');

const uri = 'mongodb+srv://foodshare:shahidkh1@cluster0.am2unay.mongodb.net/foodshare?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔍 Testing MongoDB Connection...');
console.log(`📡 URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // Hide password

// 1. Test DNS Resolution
const hostname = 'cluster0.am2unay.mongodb.net';
console.log(`\n1. Resolving DNS for ${hostname}...`);
dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
    if (err) {
        console.error('❌ DNS SRV Resolution Failed:', err.code);
        console.error('   This usually means your network is blocking MongoDB SRV records.');
        console.error('   Try using a different network (e.g. mobile hotspot) or VPN.');
    } else {
        console.log('✅ DNS SRV Resolved:', addresses);
    }
});

// 2. Test Mongoose Connection
console.log('\n2. Attempting Mongoose Connect...');
mongoose.connect(uri)
    .then(() => {
        console.log('✅ Mongoose Connected Successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Mongoose Connection Failed:');
        console.error(err);
        process.exit(1);
    });
