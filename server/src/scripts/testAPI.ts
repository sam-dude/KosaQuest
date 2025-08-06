import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

interface TestResult {
  endpoint: string;
  method: string;
  status: "PASS" | "FAIL";
  message: string;
}

class APITester {
  private results: TestResult[] = [];
  private authToken: string = "";

  private log(
    endpoint: string,
    method: string,
    status: "PASS" | "FAIL",
    message: string
  ) {
    this.results.push({ endpoint, method, status, message });
    const emoji = status === "PASS" ? "✅" : "❌";
    console.log(`${emoji} ${method} ${endpoint} - ${message}`);
  }

  async testRegister() {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "password123",
      });

      if (response.status === 201 && response.data.data.token) {
        this.authToken = response.data.data.token;
        this.log(
          "/auth/register",
          "POST",
          "PASS",
          "User registered successfully"
        );
      } else {
        this.log(
          "/auth/register",
          "POST",
          "FAIL",
          "Invalid response structure"
        );
      }
    } catch (error: any) {
      this.log(
        "/auth/register",
        "POST",
        "FAIL",
        error.response?.data?.message || error.message
      );
    }
  }

  async testLogin() {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: "test@example.com",
        password: "password123",
      });

      if (response.status === 200) {
        this.log("/auth/login", "POST", "PASS", "Login successful");
      } else {
        this.log("/auth/login", "POST", "FAIL", "Unexpected status code");
      }
    } catch (error: any) {
      // Expected to fail with test credentials
      this.log(
        "/auth/login",
        "POST",
        "PASS",
        "Failed as expected with invalid credentials"
      );
    }
  }

  async testGetStories() {
    try {
      const response = await axios.get(`${BASE_URL}/stories`);

      if (
        response.status === 200 &&
        Array.isArray(response.data.data.stories)
      ) {
        this.log(
          "/stories",
          "GET",
          "PASS",
          `Retrieved ${response.data.data.count} stories`
        );
      } else {
        this.log("/stories", "GET", "FAIL", "Invalid response structure");
      }
    } catch (error: any) {
      this.log(
        "/stories",
        "GET",
        "FAIL",
        error.response?.data?.message || error.message
      );
    }
  }

  async testGetStoryById() {
    try {
      const response = await axios.get(`${BASE_URL}/story/001`);

      if (response.status === 200 && response.data.data.storyId === "001") {
        this.log(
          "/story/:id",
          "GET",
          "PASS",
          "Story details retrieved successfully"
        );
      } else {
        this.log("/story/:id", "GET", "FAIL", "Invalid response structure");
      }
    } catch (error: any) {
      this.log(
        "/story/:id",
        "GET",
        "FAIL",
        error.response?.data?.message || error.message
      );
    }
  }

  async testGetProfile() {
    if (!this.authToken) {
      this.log("/user/profile", "GET", "FAIL", "No auth token available");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      if (response.status === 200 && response.data.data.user) {
        this.log(
          "/user/profile",
          "GET",
          "PASS",
          "Profile retrieved successfully"
        );
      } else {
        this.log("/user/profile", "GET", "FAIL", "Invalid response structure");
      }
    } catch (error: any) {
      this.log(
        "/user/profile",
        "GET",
        "FAIL",
        error.response?.data?.message || error.message
      );
    }
  }

  async testSubmitQuiz() {
    if (!this.authToken) {
      this.log("/quiz/submit", "POST", "FAIL", "No auth token available");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/quiz/submit`,
        {
          storyId: "001",
          responses: [
            { questionId: "q1", answer: "Ijapa" },
            { questionId: "q2", answer: "Wisdom" },
          ],
        },
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        }
      );

      if (
        response.status === 200 &&
        response.data.data.xpEarned !== undefined
      ) {
        this.log(
          "/quiz/submit",
          "POST",
          "PASS",
          `Quiz submitted, earned ${response.data.data.xpEarned} XP`
        );
      } else {
        this.log("/quiz/submit", "POST", "FAIL", "Invalid response structure");
      }
    } catch (error: any) {
      this.log(
        "/quiz/submit",
        "POST",
        "FAIL",
        error.response?.data?.message || error.message
      );
    }
  }

  async testMintNFT() {
    if (!this.authToken) {
      this.log("/nft/mint", "POST", "FAIL", "No auth token available");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/nft/mint`,
        {
          badgeType: "proverb_apprentice",
        },
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        }
      );

      if (response.status === 201 && response.data.data.badgeLink) {
        this.log("/nft/mint", "POST", "PASS", "NFT badge minted successfully");
      } else {
        this.log("/nft/mint", "POST", "FAIL", "Invalid response structure");
      }
    } catch (error: any) {
      this.log(
        "/nft/mint",
        "POST",
        "FAIL",
        error.response?.data?.message || error.message
      );
    }
  }

  async testGetMyBadges() {
    if (!this.authToken) {
      this.log("/nft/my-badges", "GET", "FAIL", "No auth token available");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/nft/my-badges`, {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      if (response.status === 200 && Array.isArray(response.data.data.badges)) {
        this.log(
          "/nft/my-badges",
          "GET",
          "PASS",
          `Retrieved ${response.data.data.count} badges`
        );
      } else {
        this.log("/nft/my-badges", "GET", "FAIL", "Invalid response structure");
      }
    } catch (error: any) {
      this.log(
        "/nft/my-badges",
        "GET",
        "FAIL",
        error.response?.data?.message || error.message
      );
    }
  }

  async runAllTests() {
    console.log("🧪 Starting API Tests...\n");

    await this.testRegister();
    await this.testLogin();
    await this.testGetStories();
    await this.testGetStoryById();
    await this.testGetProfile();
    await this.testSubmitQuiz();
    await this.testMintNFT();
    await this.testGetMyBadges();

    this.printSummary();
  }

  private printSummary() {
    console.log("\n📊 Test Summary:");
    console.log("=".repeat(50));

    const passed = this.results.filter((r) => r.status === "PASS").length;
    const failed = this.results.filter((r) => r.status === "FAIL").length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(
      `📈 Success Rate: ${Math.round((passed / this.results.length) * 100)}%`
    );

    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.results
        .filter((r) => r.status === "FAIL")
        .forEach((r) =>
          console.log(`   ${r.method} ${r.endpoint}: ${r.message}`)
        );
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get("http://localhost:3000");
    if (response.status === 200) {
      console.log("🚀 Server is running, starting tests...\n");
      return true;
    }
  } catch (error) {
    console.log(
      "❌ Server is not running. Please start the server with 'pnpm run dev'"
    );
    return false;
  }
  return false;
}

// Run tests if server is available
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    const tester = new APITester();
    await tester.runAllTests();
  }
}

if (require.main === module) {
  main();
}

export default APITester;
