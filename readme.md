# GrainLink  

GrainLink is our attempt to bring transparency and efficiency to the public distribution system. Using blockchain, decentralized storage, and geo-verification, we’ve created a platform that ensures fair and secure resource distribution. Think of it as the future of ration distribution, but smarter and more transparent.  

---

## 🌟 Features  
- **Transparent Record-Keeping**: Blockchain makes sure that every transaction is tamper-proof and transparent.  
- **Decentralized Storage**: Documents and datasets are stored on IPFS, so there’s no central point of failure.  
- **Geo-Verification**: Delivery validation powered by location tracking. No more fake claims!  
- **Smart Contracts**: Automating processes and ensuring trust between stakeholders.  
- **User Dashboards**: Dedicated dashboards for beneficiaries, vendors, and admins.  
- **Wallet Integration**: Login and manage accounts seamlessly with MetaMask.  

---

## 🛠️ Tech Stack  

### **Frontend**  
- **React.js** for creating a dynamic and clean user interface.  
- **TailwindCSS** for a modern, responsive design.  

### **Backend**  
- **Node.js** with **Express.js** to handle APIs and server logic.  

### **Blockchain**  
- **Ethereum** for a decentralized ledger.  
- **Solidity** to write smart contracts.  
- **Web3.js** to connect the frontend to the blockchain.  

### **Storage**  
- **IPFS** to store and access documents securely.  

### **Database**  
- **MongoDB** to keep track of user data, transactions, and delivery logs.  

---

## 🚀 How It Works  

### **For Beneficiaries**  
1. Connect your wallet (MetaMask) to sign up.  
2. Upload your documents to IPFS for verification.  
3. Request rations and track delivery status using geo-verification.  

### **For Vendors**  
1. Log in via MetaMask.  
2. View requests from beneficiaries.  
3. Update delivery status and validate through geo-verification.  

### **For Admins**  
1. Verify user documents uploaded on IPFS.  
2. Monitor all activities and generate reports.  
3. Manage and update distribution policies.

Setup Steps:
git clone https://github.com/your-username/GrainLink.git
cd GrainLink

Install Dependencies

cd frontend && npm install  
cd ../backend && npm install  

Start the server: npm run dev

---

## 📂 Project Structure  

```plaintext
GrainLink/
├── frontend/       # React.js app
│   ├── components/ # Reusable UI elements
│   ├── pages/      # Dashboard, Login, etc.
│   └── App.js      # Main app logic
├── backend/        # Node.js server
│   ├── routes/     # API endpoints
│   ├── models/     # MongoDB schemas
│   └── app.js      # Server logic
├── smart_contracts/ # Solidity contracts
│   └── GrainLink.sol
└── README.md       # This file!
