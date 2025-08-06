import { ethers } from "ethers";

// Educational NFT Contract ABI (simplified for basic NFT functionality)
const EDUCATIONAL_NFT_ABI = [
  "function mint(address to, string memory tokenURI) external returns (uint256)",
  "function mintBadge(address to, string memory badgeType, string memory tokenURI) external returns (uint256)",
  "function issueCertificate(address to, string memory courseId, uint256 grade, string memory tokenURI) external returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

export class EduChainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract | null = null;
  private networkConfig: any;

  constructor() {
    this.initializeNetwork();
  }

  private initializeNetwork() {
    const isTestnet = process.env.EDUCHAIN_NETWORK === "testnet";

    this.networkConfig = {
      name: isTestnet ? "EDU Chain Testnet" : "EDU Chain Mainnet",
      chainId: isTestnet ? 656476 : 41923,
      rpcUrl: isTestnet
        ? process.env.EDUCHAIN_RPC_URL ||
          "https://rpc.open-campus-codex.gelato.digital"
        : "https://rpc.edu-chain.raas.gelato.cloud",
      explorer: isTestnet
        ? "https://opencampus-codex.blockscout.com"
        : "https://educhain.blockscout.com",
      faucet: "https://educhain-community-faucet.vercel.app/",
      currency: "EDU",
    };

    if (!process.env.EDUCHAIN_PRIVATE_KEY) {
      console.warn(
        "EDUCHAIN_PRIVATE_KEY not set. Blockchain features will be disabled."
      );
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(this.networkConfig.rpcUrl);
      this.wallet = new ethers.Wallet(
        process.env.EDUCHAIN_PRIVATE_KEY,
        this.provider
      );

      if (process.env.EDUCHAIN_CONTRACT_ADDRESS) {
        this.contract = new ethers.Contract(
          process.env.EDUCHAIN_CONTRACT_ADDRESS,
          EDUCATIONAL_NFT_ABI,
          this.wallet
        );
      }
    } catch (error) {
      console.error("Failed to initialize EduChain service:", error);
    }
  }

  // Check if the service is properly configured
  isConfigured(): boolean {
    return !!(this.provider && this.wallet);
  }

  // Get network information
  getNetworkInfo() {
    return {
      ...this.networkConfig,
      walletAddress: this.wallet?.address,
      contractAddress: process.env.EDUCHAIN_CONTRACT_ADDRESS,
      isConfigured: this.isConfigured(),
    };
  }

  // Get wallet balance in EDU
  async getWalletBalance(): Promise<string> {
    try {
      if (!this.provider || !this.wallet) {
        throw new Error("Service not properly configured");
      }

      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      console.error("Error getting wallet balance:", error);
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  // Test connection to EDUCHAIN network
  async testConnection(): Promise<{
    success: boolean;
    networkInfo: any;
    balance?: string;
  }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          networkInfo: this.networkConfig,
          balance: "Service not configured",
        };
      }

      const balance = await this.getWalletBalance();
      const blockNumber = await this.provider.getBlockNumber();

      return {
        success: true,
        networkInfo: {
          ...this.networkConfig,
          currentBlock: blockNumber,
          walletAddress: this.wallet.address,
        },
        balance: `${balance} EDU`,
      };
    } catch (error: any) {
      return {
        success: false,
        networkInfo: this.networkConfig,
        balance: `Error: ${error.message}`,
      };
    }
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
      if (!this.contract) {
        throw new Error(
          "Smart contract not configured. Please deploy contract and set EDUCHAIN_CONTRACT_ADDRESS"
        );
      }

      // Create metadata JSON (in production, upload to IPFS)
      const tokenURI = `data:application/json;base64,${Buffer.from(
        JSON.stringify(metadata)
      ).toString("base64")}`;

      // Use mintBadge if available, otherwise use generic mint
      let tx;
      try {
        tx = await this.contract.mintBadge(recipient, badgeType, tokenURI);
      } catch {
        // Fallback to generic mint function
        tx = await this.contract.mint(recipient, tokenURI);
      }

      const receipt = await tx.wait();

      // Extract token ID from Transfer event
      const transferEvent = receipt.logs?.find(
        (log: any) =>
          log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      );
      const tokenId = transferEvent
        ? BigInt(transferEvent.topics[3]).toString()
        : Date.now().toString();

      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId,
        blockNumber: receipt.blockNumber,
        network: this.networkConfig.name,
        explorerUrl: `${this.networkConfig.explorer}/tx/${receipt.hash}`,
        gasUsed: receipt.gasUsed?.toString(),
        metadata,
      };
    } catch (error: any) {
      console.error("Badge minting error:", error);
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
      if (!this.contract) {
        throw new Error("Smart contract not configured");
      }

      const certificateMetadata = {
        name: `Kosa Quest Course Certificate`,
        description: `Certificate for completing ${courseId} with ${grade}% grade`,
        image: `https://certificates.kosaquest.com/${courseId}.png`,
        attributes: [
          { trait_type: "Course ID", value: courseId },
          { trait_type: "Grade", value: grade.toString() },
          {
            trait_type: "Completion Date",
            value: completionDate.toISOString(),
          },
          { trait_type: "Platform", value: "Kosa Quest" },
          { trait_type: "Network", value: "EDUCHAIN" },
          { trait_type: "Type", value: "Course Certificate" },
        ],
      };

      const tokenURI = `data:application/json;base64,${Buffer.from(
        JSON.stringify(certificateMetadata)
      ).toString("base64")}`;

      // Try specific certificate function, fallback to generic mint
      let tx;
      try {
        tx = await this.contract.issueCertificate(
          studentAddress,
          courseId,
          grade,
          tokenURI
        );
      } catch {
        tx = await this.contract.mint(studentAddress, tokenURI);
      }

      const receipt = await tx.wait();

      const transferEvent = receipt.logs?.find(
        (log: any) =>
          log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      );
      const certificateId = transferEvent
        ? BigInt(transferEvent.topics[3]).toString()
        : Date.now().toString();

      return {
        success: true,
        certificateId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        network: this.networkConfig.name,
        explorerUrl: `${this.networkConfig.explorer}/tx/${receipt.hash}`,
        metadata: certificateMetadata,
      };
    } catch (error: any) {
      console.error("Certificate issuance error:", error);
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }

  // Get user's educational assets
  async getUserEducationalAssets(userAddress: string) {
    try {
      if (!this.contract) {
        throw new Error("Smart contract not configured");
      }

      const balance = await this.contract.balanceOf(userAddress);
      const assets = [];

      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.contract.tokenOfOwnerByIndex(
            userAddress,
            i
          );
          const tokenURI = await this.contract.tokenURI(tokenId);

          let metadata = null;
          if (tokenURI.startsWith("data:application/json;base64,")) {
            const base64Data = tokenURI.split(",")[1];
            metadata = JSON.parse(Buffer.from(base64Data, "base64").toString());
          }

          assets.push({
            tokenId: tokenId.toString(),
            tokenURI,
            metadata,
            explorerUrl: `${this.networkConfig.explorer}/token/${process.env.EDUCHAIN_CONTRACT_ADDRESS}?a=${tokenId}`,
          });
        } catch (tokenError) {
          console.warn(`Failed to fetch token at index ${i}:`, tokenError);
        }
      }

      return {
        success: true,
        totalAssets: balance.toString(),
        network: this.networkConfig.name,
        contractAddress: process.env.EDUCHAIN_CONTRACT_ADDRESS,
        assets,
      };
    } catch (error: any) {
      console.error("Error fetching educational assets:", error);
      throw new Error(`Failed to fetch educational assets: ${error.message}`);
    }
  }

  // Verify certificate authenticity
  async verifyCertificate(tokenId: string) {
    try {
      if (!this.contract) {
        throw new Error("Smart contract not configured");
      }

      // Check if token exists by trying to get its owner
      const owner = await this.contract.ownerOf(tokenId);
      const tokenURI = await this.contract.tokenURI(tokenId);

      let metadata = null;
      if (tokenURI.startsWith("data:application/json;base64,")) {
        const base64Data = tokenURI.split(",")[1];
        metadata = JSON.parse(Buffer.from(base64Data, "base64").toString());
      }

      return {
        isValid: true,
        tokenId,
        owner,
        metadata,
        network: this.networkConfig.name,
        contractAddress: process.env.EDUCHAIN_CONTRACT_ADDRESS,
        explorerUrl: `${this.networkConfig.explorer}/token/${process.env.EDUCHAIN_CONTRACT_ADDRESS}?a=${tokenId}`,
        verificationTimestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Certificate verification error:", error);
      return {
        isValid: false,
        tokenId,
        error: error.message,
        verificationTimestamp: new Date(),
      };
    }
  }

  // Create learning credential
  async createCredential(
    studentAddress: string,
    skillName: string,
    level: string,
    evidenceHash?: string
  ) {
    try {
      if (!this.contract) {
        throw new Error("Smart contract not configured");
      }

      const credentialMetadata = {
        name: `${skillName} - ${level} Level`,
        description: `Learning credential for ${skillName} at ${level} level`,
        image: `https://credentials.kosaquest.com/${skillName.toLowerCase()}-${level.toLowerCase()}.png`,
        attributes: [
          { trait_type: "Skill Name", value: skillName },
          { trait_type: "Level", value: level },
          { trait_type: "Platform", value: "Kosa Quest" },
          { trait_type: "Network", value: "EDUCHAIN" },
          { trait_type: "Type", value: "Learning Credential" },
          ...(evidenceHash
            ? [{ trait_type: "Evidence Hash", value: evidenceHash }]
            : []),
        ],
      };

      const tokenURI = `data:application/json;base64,${Buffer.from(
        JSON.stringify(credentialMetadata)
      ).toString("base64")}`;
      const tx = await this.contract.mint(studentAddress, tokenURI);
      const receipt = await tx.wait();

      const transferEvent = receipt.logs?.find(
        (log: any) =>
          log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      );
      const credentialId = transferEvent
        ? BigInt(transferEvent.topics[3]).toString()
        : Date.now().toString();

      return {
        success: true,
        credentialId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        network: this.networkConfig.name,
        explorerUrl: `${this.networkConfig.explorer}/tx/${receipt.hash}`,
        metadata: credentialMetadata,
      };
    } catch (error: any) {
      console.error("Credential creation error:", error);
      throw new Error(`Failed to create credential: ${error.message}`);
    }
  }
}

// Create singleton instance
export const eduChainService = new EduChainService();
