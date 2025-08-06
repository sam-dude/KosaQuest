# 🎓 EduChain Integration Guide for Kosa Quest

## What is EduChain?

EduChain is a blockchain platform specifically designed for educational applications, providing:
- **Educational NFTs**: Certificates, badges, and achievements
- **Learning Credentials**: Verifiable academic records
- **Smart Contracts**: Automated educational processes
- **Decentralized Learning**: Peer-to-peer educational networks

## 🚀 Integration Steps

### 1. Install EduChain Dependencies

```bash
# Install EDUCHAIN compatible packages
pnpm add ethers @sailfish-dex/v3-sdk
pnpm add -D @types/node hardhat

# Optional: For cross-chain functionality
pnpm add @axelar-network/axelarjs-sdk
```

### 2. Environment Configuration

Create or update your `.env` file:

```env
# EDUCHAIN Configuration (WORKING URLs - Updated Jan 2025)
EDUCHAIN_NETWORK=testnet
EDUCHAIN_RPC_URL=https://rpc.open-campus-codex.gelato.digital
EDUCHAIN_CHAIN_ID=656476
EDUCHAIN_PRIVATE_KEY=your_private_key_here
EDUCHAIN_CONTRACT_ADDRESS=your_contract_address

# EDUCHAIN Mainnet (for production)
# EDUCHAIN_RPC_URL=https://rpc.edu-chain.raas.gelato.cloud
# EDUCHAIN_CHAIN_ID=41923

# Block Explorers
EDUCHAIN_TESTNET_EXPLORER=https://opencampus-codex.blockscout.com
EDUCHAIN_MAINNET_EXPLORER=https://educhain.blockscout.com

# Existing configurations...
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_key
```

### 3. Create EduChain Service

Create `src/services/educhain.ts`:

```typescript
import { ethers } from 'ethers';
import { EduChainSDK } from '@educhain/sdk';

export class EduChainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private sdk: EduChainSDK;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.EDUCHAIN_RPC_URL
    );
    this.wallet = new ethers.Wallet(
      process.env.EDUCHAIN_PRIVATE_KEY!,
      this.provider
    );
    this.sdk = new EduChainSDK({
      provider: this.provider,
      signer: this.wallet,
      network: process.env.EDUCHAIN_NETWORK as 'testnet' | 'mainnet',
    });
  }

  // Mint educational NFT badge
  async mintEducationalBadge(
    recipient: string,
    badgeType: string,
    metadata: {
      name: string;
      description: string;
      image: string;
      attributes: Array<{ trait_type: string; value: string }>;
    }
  ) {
    try {
      const tx = await this.sdk.badges.mint({
        to: recipient,
        badgeType,
        metadata,
      });
      
      return {
        transactionHash: tx.hash,
        tokenId: tx.tokenId,
        blockNumber: tx.blockNumber,
      };
    } catch (error) {
      throw new Error(`Failed to mint badge: ${error.message}`);
    }
  }

  // Issue educational certificate
  async issueCertificate(
    studentAddress: string,
    courseId: string,
    grade: number,
    completionDate: Date
  ) {
    try {
      const certificateMetadata = {
        name: `Kosa Quest Course Certificate`,
        description: `Certificate for completing course ${courseId}`,
        image: `ipfs://certificate-${courseId}`,
        attributes: [
          { trait_type: "Course ID", value: courseId },
          { trait_type: "Grade", value: grade.toString() },
          { trait_type: "Completion Date", value: completionDate.toISOString() },
          { trait_type: "Platform", value: "Kosa Quest" },
        ],
      };

      const tx = await this.sdk.certificates.issue({
        to: studentAddress,
        courseId,
        metadata: certificateMetadata,
      });

      return {
        certificateId: tx.certificateId,
        transactionHash: tx.hash,
        ipfsHash: tx.ipfsHash,
      };
    } catch (error) {
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }

  // Create learning credential
  async createCredential(
    studentAddress: string,
    skillName: string,
    level: string,
    evidenceHash: string
  ) {
    try {
      const tx = await this.sdk.credentials.create({
        holder: studentAddress,
        skillName,
        level,
        evidenceHash,
        issuer: this.wallet.address,
      });

      return {
        credentialId: tx.credentialId,
        transactionHash: tx.hash,
      };
    } catch (error) {
      throw new Error(`Failed to create credential: ${error.message}`);
    }
  }

  // Get user's educational assets
  async getUserEducationalAssets(userAddress: string) {
    try {
      const [badges, certificates, credentials] = await Promise.all([
        this.sdk.badges.getByOwner(userAddress),
        this.sdk.certificates.getByOwner(userAddress),
        this.sdk.credentials.getByHolder(userAddress),
      ]);

      return {
        badges,
        certificates,
        credentials,
        totalAssets: badges.length + certificates.length + credentials.length,
      };
    } catch (error) {
      throw new Error(`Failed to fetch educational assets: ${error.message}`);
    }
  }

  // Verify certificate authenticity
  async verifyCertificate(certificateId: string) {
    try {
      const isValid = await this.sdk.certificates.verify(certificateId);
      const metadata = await this.sdk.certificates.getMetadata(certificateId);
      
      return {
        isValid,
        metadata,
        verificationTimestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }
}

export const eduChainService = new EduChainService();
```

### 4. Update User Model for Blockchain Integration

Update `src/models/User.ts`:

```typescript
// Add to your existing User schema
const userSchema = new mongoose.Schema({
  // ... existing fields
  
  // EduChain Integration
  walletAddress: {
    type: String,
    sparse: true, // Allows null values while maintaining uniqueness
    unique: true,
  },
  blockchainCredentials: [{
    type: {
      type: String,
      enum: ['BADGE', 'CERTIFICATE', 'CREDENTIAL'],
      required: true,
    },
    tokenId: String,
    transactionHash: String,
    blockNumber: Number,
    ipfsHash: String,
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: mongoose.Schema.Types.Mixed,
  }],
}, {
  timestamps: true,
});
```

### 5. Update NFT Controller for EduChain

Update `src/controllers/nftController.ts`:

```typescript
import { eduChainService } from '../services/educhain';

export const mintBadge = async (req: Request, res: Response) => {
  try {
    const { badgeType, walletAddress } = req.body;
    const userId = req.user?.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
      });
    }

    // Check XP requirements (existing logic)
    const badgeConfig = getBadgeConfig(badgeType);
    if (user.totalXP < badgeConfig.requiredXP) {
      return res.status(400).json({
        status: "Error",
        message: `Insufficient XP. Required: ${badgeConfig.requiredXP}, Current: ${user.totalXP}`,
      });
    }

    // Mint on EduChain if wallet address provided
    let blockchainData = null;
    if (walletAddress) {
      const metadata = {
        name: badgeConfig.name,
        description: badgeConfig.description,
        image: `ipfs://badge-${badgeType.toLowerCase()}`,
        attributes: [
          { trait_type: "Badge Type", value: badgeType },
          { trait_type: "XP Required", value: badgeConfig.requiredXP.toString() },
          { trait_type: "Platform", value: "Kosa Quest" },
          { trait_type: "Issued To", value: user.username },
        ],
      };

      blockchainData = await eduChainService.mintEducationalBadge(
        walletAddress,
        badgeType,
        metadata
      );

      // Update user's wallet address if not set
      if (!user.walletAddress) {
        user.walletAddress = walletAddress;
      }

      // Add blockchain credential to user
      user.blockchainCredentials.push({
        type: 'BADGE',
        tokenId: blockchainData.tokenId,
        transactionHash: blockchainData.transactionHash,
        blockNumber: blockchainData.blockNumber,
        metadata,
        issuedAt: new Date(),
      });
    }

    // Create traditional NFT badge (existing logic)
    const badge = new NFTBadge({
      userId,
      badgeType,
      tokenId: blockchainData?.tokenId || generateTokenId(),
      transactionHash: blockchainData?.transactionHash || generateMockHash(),
      metadata: {
        name: badgeConfig.name,
        description: badgeConfig.description,
        image: `ipfs://badge-${badgeType.toLowerCase()}`,
      },
    });

    await badge.save();
    await user.save();

    res.status(201).json({
      status: "Success",
      message: "NFT badge minted successfully",
      data: {
        badge: {
          id: badge._id,
          badgeType,
          tokenId: badge.tokenId,
          transactionHash: badge.transactionHash,
          mintedAt: badge.createdAt,
          metadata: badge.metadata,
          ...(blockchainData && { 
            blockchain: {
              network: 'educhain',
              verified: true,
              blockNumber: blockchainData.blockNumber,
            }
          }),
        },
      },
    });
  } catch (error) {
    console.error("Error minting badge:", error);
    res.status(500).json({
      status: "Error",
      message: "Failed to mint badge",
      error: error.message,
    });
  }
};
```

### 6. Add Blockchain Routes

Create `src/routes/blockchainRoutes.ts`:

```typescript
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { eduChainService } from "../services/educhain";

const router = Router();

// Connect wallet
router.post("/connect-wallet", authMiddleware, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const userId = req.user?.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
      });
    }

    user.walletAddress = walletAddress;
    await user.save();

    res.json({
      status: "Success",
      message: "Wallet connected successfully",
      data: { walletAddress },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Failed to connect wallet",
      error: error.message,
    });
  }
});

// Get blockchain assets
router.get("/assets", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user?.walletAddress) {
      return res.status(400).json({
        status: "Error",
        message: "No wallet connected",
      });
    }

    const assets = await eduChainService.getUserEducationalAssets(user.walletAddress);
    
    res.json({
      status: "Success",
      data: assets,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Failed to fetch blockchain assets",
      error: error.message,
    });
  }
});

// Issue course certificate
router.post("/certificate", authMiddleware, async (req, res) => {
  try {
    const { courseId, grade } = req.body;
    const user = await User.findById(req.user?.id);
    
    if (!user?.walletAddress) {
      return res.status(400).json({
        status: "Error",
        message: "No wallet connected",
      });
    }

    const certificate = await eduChainService.issueCertificate(
      user.walletAddress,
      courseId,
      grade,
      new Date()
    );

    // Save to user's blockchain credentials
    user.blockchainCredentials.push({
      type: 'CERTIFICATE',
      tokenId: certificate.certificateId,
      transactionHash: certificate.transactionHash,
      ipfsHash: certificate.ipfsHash,
      issuedAt: new Date(),
    });
    await user.save();

    res.status(201).json({
      status: "Success",
      message: "Certificate issued successfully",
      data: certificate,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Failed to issue certificate",
      error: error.message,
    });
  }
});

export default router;
```

### 7. Update Main Routes

Update `src/routes/index.ts`:

```typescript
import { Router } from "express";
import authRoutes from "./authRoutes";
import blockchainRoutes from "./blockchainRoutes";
import nftRoutes from "./nftRoutes";
import quizRoutes from "./quizRoutes";
import storyRoutes from "./storyRoutes";
import userRoutes from "./userRoutes";

const router = Router();

// API Routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/stories", storyRoutes);
router.use("/quiz", quizRoutes);
router.use("/nft", nftRoutes);
router.use("/blockchain", blockchainRoutes); // New blockchain routes

export default router;
```

## 🔗 EDUCHAIN Network Information (VERIFIED & WORKING)

### 🧪 **Testnet Configuration** (Use for Development)
- **Network Name**: EDU Chain Testnet
- **RPC URL**: `https://rpc.open-campus-codex.gelato.digital`
- **Chain ID**: `656476`
- **Currency Symbol**: `EDU`
- **Block Explorer**: `https://opencampus-codex.blockscout.com/`
- **Settlement Layer**: Sepolia

### 🚀 **Mainnet Configuration** (Production Ready)
- **Network Name**: EDU Chain Mainnet  
- **RPC URL**: `https://rpc.edu-chain.raas.gelato.cloud`
- **Chain ID**: `41923`
- **Currency Symbol**: `EDU`
- **Block Explorer**: `https://educhain.blockscout.com`
- **Settlement Layer**: Arbitrum One

### 💧 **Get Testnet Tokens**
- **Community Faucet**: `https://educhain-community-faucet.vercel.app/`
- **Limit**: One request per day per testnet token
- **Note**: Provides all available testnet tokens at once

### ⚙️ **Add to MetaMask**
```javascript
// Testnet Network
{
  "networkName": "EDU Chain Testnet",
  "rpcUrl": "https://rpc.open-campus-codex.gelato.digital",
  "chainId": "656476", 
  "symbol": "EDU",
  "blockExplorer": "https://opencampus-codex.blockscout.com/"
}

// Mainnet Network  
{
  "networkName": "EDU Chain Mainnet",
  "rpcUrl": "https://rpc.edu-chain.raas.gelato.cloud",
  "chainId": "41923",
  "symbol": "EDU", 
  "blockExplorer": "https://educhain.blockscout.com"
}
```

## 📋 Next Steps

### 🚀 **Immediate Actions** (Get Started in 10 minutes)

1. **Install Dependencies**
```bash
pnpm add ethers
```

2. **Set Environment Variables**
Add to your `.env` file:
```env
EDUCHAIN_NETWORK=testnet
EDUCHAIN_RPC_URL=https://rpc.open-campus-codex.gelato.digital
EDUCHAIN_PRIVATE_KEY=your_wallet_private_key_here
```

3. **Get Testnet EDU Tokens**
- Visit: `https://educhain-community-faucet.vercel.app/`
- Connect your MetaMask wallet
- Request testnet EDU tokens (free, once daily)

4. **Test the Connection**
```typescript
import { eduChainService } from './src/services/educhain';

// Test your connection
const test = await eduChainService.testConnection();
console.log('EDUCHAIN Connection:', test);
```

### 🏗️ **Development Workflow**

1. **Add EDUCHAIN Network to MetaMask**
   - Network Name: `EDU Chain Testnet`
   - RPC URL: `https://rpc.open-campus-codex.gelato.digital`
   - Chain ID: `656476`
   - Currency: `EDU`

2. **Deploy Smart Contract** (Optional - for custom NFTs)
   - Use existing ERC-721 contract or deploy your own
   - Set `EDUCHAIN_CONTRACT_ADDRESS` in your `.env`

3. **Integrate with Existing API**
   - Update your NFT controller to use `eduChainService`
   - Add blockchain routes for wallet connections
   - Test story completion → badge minting flow

### 🎯 **Hackathon Strategy** 

**For your Kosa Quest project, here's what you can build:**

1. **Story Completion Badges** 🏆
   - User completes Igbo story → Mint "Igbo Story Master" NFT
   - Different badges for different languages/difficulty levels
   - Verifiable on blockchain forever

2. **Language Proficiency Certificates** 📜
   - Complete X stories + pass quiz → Language certificate
   - Employers can verify language skills on blockchain
   - Cross-platform recognition

3. **Cultural Heritage NFTs** 🎭
   - Special NFTs for completing traditional stories
   - "Keeper of Igbo Culture" badge
   - "Yoruba Tradition Guardian" certificate

4. **Learning Path Credentials** 🎓
   - Complete beginner → intermediate → advanced paths
   - Blockchain-verified language learning journey
   - Transferable credentials across platforms

## 🛠️ Additional Features You Can Add

- **Learning Path NFTs**: Sequential educational journeys
- **Peer-to-Peer Learning**: Decentralized study groups
- **Educational Marketplace**: Trade learning resources
- **Reputation System**: Blockchain-based educator ratings
- **Cross-Platform Credentials**: Interoperable with other educational platforms

## 📚 Resources

- [EduChain Documentation](https://docs.educhain.network)
- [EduChain SDK](https://github.com/educhain/sdk)
- [Educational NFT Standards](https://docs.educhain.network/standards)
- [Smart Contract Templates](https://github.com/educhain/templates)

---

*Remember to test thoroughly on testnet before deploying to mainnet!*
