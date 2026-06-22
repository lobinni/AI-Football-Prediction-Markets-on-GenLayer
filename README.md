<div align="center">

# 🧠⚽ AI Football Prediction Markets on GenLayer

### Decentralized Prediction Markets powered by AI Validators & the Equivalence Principle

*Thị trường Dự đoán Bóng đá Phi tập trung vận hành bởi AI Validators & Nguyên lý Đồng thuận*

[![py-genlayer](https://img.shields.io/badge/py--genlayer-v0.2.16-06b6d4?style=for-the-badge)](https://genlayer.com)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6-2535a0?style=for-the-badge&logo=ethereum)](https://docs.ethers.org)

[Features](#-features--tính-năng) • [Demo](#-getting-started--cài-đặ--chạy) • [GenLayer](#-how-genlayer-works--cơ-chế-genlayer) • [Wallet](#-evm-wallet-integration--tích-hợp-ví-evm)

</div>

---

## 📖 Overview / Tổng quan

**AI Football Prediction Markets on GenLayer** is a full-stack decentralized application (DApp) that demonstrates how **GenLayer Intelligent Contracts** can resolve real-world events using AI. Users bet **$GEN** tokens on football match outcomes, and the markets are settled by a network of independent **AI Validators** that read live data from BBC Sport and reach on-chain consensus through the **Equivalence Principle**.

> 🇻🇳 Đây là một ứng dụng phi tập trung (DApp) hoàn chỉnh, minh họa cách **Hợp đồng Thông minh GenLayer** giải quyết sự kiện thực tế bằng AI. Người dùng đặt cược token **$GEN** vào kết quả các trận bóng đá, và thị trường được phân xử bởi mạng lưới các **AI Validator** độc lập đọc dữ liệu trực tiếp từ BBC Sport và đạt đồng thuận on-chain thông qua **Equivalence Principle**.

---

## ✨ Features / Tính năng

### 🌐 Bilingual Interface / Giao diện song ngữ
- Full **Vietnamese 🇻🇳 / English 🇬🇧** localization with one-click toggle.

### 📊 Prediction Markets / Thị trường dự đoán
- Browse live football matches (Premier League, La Liga, Champions League, AFF...).
- Real-time **search**, **league filter**, and **status filter** (Active / Resolved).
- Dynamic **odds & payout ratio** calculated from pool weights.
- Place stakes on **Team 1 / Draw / Team 2**.

### 🧠 AI Consensus Simulation / Mô phỏng đồng thuận AI
- Animated visualization of the GenLayer resolution lifecycle:
  1. `gl.nondet.web.render()` — fetch BBC Sport page
  2. `gl.nondet.exec_prompt()` — LLM extracts score & winner as JSON
  3. `gl.eq_principle.strict_eq()` — verify identical results across nodes
- Three independent **AI Validators** (UK 🇬🇧, Germany 🇩🇪, Singapore 🇸🇬) with live status & terminal output.

### 🚀 Create Markets / Tạo thị trường
- Deploy a new `PredictionMarket` contract by specifying teams, date, league, and initial liquidity.

### 💻 Contract Studio / Hợp đồng thông minh
- View the full `py-genlayer` Python source code with detailed explanations of each GenLayer primitive.

### 👛 EVM Wallet & Wallet Tab / Ví EVM & Quản lý cược
- **Real MetaMask connection** to the **GenLayer Testnet Chain**.
- On-chain **GEN balance**, claimable winnings, and full transaction history.
- Each bet is a **real signed transaction** with a clickable block-explorer link.

---

## 🛠 Tech Stack / Công nghệ

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript |
| **Build Tool** | Vite 7 (single-file output) |
| **Styling** | Tailwind CSS 4 |
| **Icons** | Lucide React |
| **Web3** | Ethers.js 6 + EIP-1193 (MetaMask) |
| **Smart Contract** | py-genlayer v0.2.16 (Python) |

---

## 🔗 EVM Wallet Integration / Tích hợp ví EVM

The app connects to the **GenLayer Testnet Chain** via MetaMask. When a user places a bet, a real on-chain `$GEN` transaction is signed and broadcast.

> 🇻🇳 Ứng dụng kết nối tới **GenLayer Testnet Chain** qua MetaMask. Khi đặt cược, một giao dịch `$GEN` thật được ký và phát lên blockchain.

### Network Configuration / Cấu hình mạng

| Field | Value |
|-------|-------|
| **Network Name** | GenLayer Testnet Chain |
| **RPC URL** | `https://rpc.testnet-chain.genlayer.com` |
| **Chain ID** | `4221` (hex `0x107d`) |
| **Currency Symbol** | `GEN` |
| **Block Explorer** | `https://explorer.testnet-chain.genlayer.com` |

The network is **added automatically** to MetaMask the first time you connect — no manual setup needed.

> ⚠️ **Note:** MetaMask requires a real browser with the extension installed. The in-editor Codespaces preview cannot access MetaMask — deploy the app or open the forwarded port in Chrome/Firefox to test wallet features.

---

## 🚀 Getting Started / Cài đặt & Chạy

### Prerequisites / Yêu cầu
- [Node.js](https://nodejs.org) v18+ and npm
- [MetaMask](https://metamask.io) browser extension (for wallet features)

### Installation / Cài đặt

```bash
# 1. Clone the repository
git clone https://github.com/lobinni/AI-Football-Prediction-Markets-on-GenLayer.git
cd AI-Football-Prediction-Markets-on-GenLayer

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Build for production
npm run build

# 5. Preview the production build
npm run preview
```

The dev server runs at **http://localhost:5173**.

---

## 📂 Project Structure / Cấu trúc thư mục

```
AI-Football-Prediction-Markets-on-GenLayer/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx                    # Navigation + EVM wallet button
│   │   ├── MarketCard.tsx                # Market card + betting form
│   │   ├── ConsensusSimulationModal.tsx  # AI consensus animation
│   │   ├── CreateMarket.tsx              # Deploy new contract form
│   │   ├── ContractStudio.tsx            # Python source viewer
│   │   └── UserBets.tsx                  # Wallet, bets & tx history
│   ├── config/
│   │   └── network.ts                    # GenLayer Testnet config (Chain 4221)
│   ├── hooks/
│   │   └── useWallet.ts                  # MetaMask connection & tx logic
│   ├── data/
│   │   └── mockData.ts                   # Mock markets + i18n strings
│   ├── types.ts                          # TypeScript interfaces
│   ├── App.tsx                           # Main app & state management
│   ├── main.tsx                          # Entry point
│   └── index.css                         # Tailwind + custom styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🧬 How GenLayer Works / Cơ chế GenLayer

GenLayer lets you write smart contracts in **Python** that can access the internet and call LLMs — something impossible on traditional blockchains. The included `PredictionMarket` contract resolves matches like this:

```python
def get_match_result() -> typing.Any:
    # 1. Read real-world data from the web (nondeterministic)
    web_data = gl.nondet.web.render(market_resolution_url, mode="text")

    # 2. Ask an LLM to extract the score & winner as strict JSON
    result = gl.nondet.exec_prompt(task)
    return json.loads(result)

# 3. All validators must agree (Equivalence Principle)
result_json = gl.eq_principle.strict_eq(get_match_result)
```

| Primitive | Purpose |
|-----------|---------|
| `gl.nondet.web.render()` | Fetch real-world webpage content (BBC Sport) without third-party oracles |
| `gl.nondet.exec_prompt()` | Run an LLM to parse the score and determine the winner |
| `gl.eq_principle.strict_eq()` | Reach consensus — state updates only if all validators return identical JSON |

---

## 🎮 Usage Guide / Hướng dẫn sử dụng

1. **Connect Wallet** — Click *Connect Wallet* and approve the GenLayer Testnet network in MetaMask.
2. **Browse Markets** — Explore active matches, search, and filter by league/status.
3. **Place a Bet** — Choose an outcome, enter a `$GEN` amount, and sign the transaction.
4. **Trigger AI Resolve** — Click *Trigger AI Resolve* to watch the validator consensus simulation.
5. **Claim Winnings** — Go to the *My Bets & Wallet* tab to claim payouts and view your transaction history on the explorer.

---

## ☁️ Deployment / Triển khai

Deploy for free on **Vercel**:

1. Sign in to [vercel.com](https://vercel.com) with GitHub.
2. **Add New Project** → select this repository.
3. Vercel auto-detects Vite → click **Deploy**.
4. Get a public live URL in ~1 minute. 🎉

---

## ⚠️ Disclaimer / Tuyên bố

This is a **demonstration / educational DApp** running on a **testnet**. It uses simulated market data and an AI consensus animation for illustrative purposes. No real money is involved. Do not use for actual gambling.

> 🇻🇳 Đây là **DApp minh họa / giáo dục** chạy trên **testnet**, dùng dữ liệu mô phỏng. Không liên quan đến tiền thật và không dùng cho mục đích cá cược thực tế.

---

## 📄 License / Giấy phép

Released under the **MIT License**.

---

<div align="center">

**Built with ❤️ on [GenLayer](https://genlayer.com)** • py-genlayer v0.2.16 & the Equivalence Principle

⭐ Star this repo if you find it useful!

</div>
