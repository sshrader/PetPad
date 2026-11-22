# PetPaws

A pump.fun launchpad with a cosy pet-rescue-shelter theme: every coin is adopted by one of eight original shelter pets (dogs and cats) as its logo, and the launcher can send part of the creator fees to an animal charity. Anyone can launch from their own wallet. The character they get is locked to their coin for good, and reports the coin's public numbers (a five-star heat level on the coin page) read from the chain.

This is its own service: its own data volume, env vars and domain. It lives at the root of this repo, so Railway needs no Root Directory.

- **`/`** is the whole app: an intro (a shelter at dusk, four pets in round frames and a ride rolling to a new home, until the visitor presses Proceed), then the launchpad over a dusk-sky backdrop.
- A launcher connects Phantom, picks an open agent (or asks for a random one), names the coin, and launches. The launch uses the official `@pump-fun/pump-sdk`, with the launcher's first buy in the same transaction.
- **Classes and abilities:** each agent has a class with one special ability (Holder Radar, Cap Tracker, Dev Watch, Record Board, Milestone Log, Graduation Pace, Self-Check, Plain Brief, Authority Audit, Launch Block Scan, Sell Impact; the flagship has Command Sweep). They only use public chain numbers and what the agent saw on earlier visits (kept in `watch-<cluster>.json`). None of them trades or predicts.
- **Pets:** 48 x 48 adoption portraits (a sitting pet with a collar and a heart tag), drawn by code (`grid.js`, no image files). Eight breeds, all original designs: Shiba, Corgi, Pug, Husky, Akita (dogs) and Siamese, Black Cat, Tabby (cats). Each has four coats and optional extras (bandana, bowtie, bell, flower, sunglasses, party hat), and no two in a set look alike. They are original drawings of ordinary breeds, not real meme animals or brand characters.
- **Classes:** the breeds map to `RANGER` (Shiba), `PILOT` (Corgi), `ENGINEER` (Pug), `NAVIGATOR` (Husky), `COMMANDER` (Akita), `OBSERVER` (Siamese), `TROOPER` (Black Cat), `SCIENTIST` (Tabby). Each maps to a report in `report.js` (`ability.fn`) that works from real chain numbers.
- **The agent report** (`report.js`) is on every coin page. It turns the numbers read from the chain into plain sentences: curve progress and milestones, market cap, dev share, top-10 concentration, holder count, and flags for a large dev or concentrated holders. It only reads public data. It does not trade, hold funds, predict prices or give advice, and the page says so. It is built from the same cached chain read as the rest of the coin page.
- **Titan (flagship):** one flagship outside the numbered set (a golden Akita with a gold collar and a little crown), launchable only by `FOUNDER_WALLET`.
- **Reserve, then lock:** picking an agent holds it for 15 minutes. After the launch lands, the server reads the transaction from the chain (signed by that wallet, includes the new mint and the pump.fun program) and only then locks the agent to the coin.
- **Recent launches**, the **Creator fees** panel and **coin pages** (`/coin/<mint>`) are on the same pages. The fee payout calls were written from pump.fun's docs and need a devnet check.
- **The logo** is the held character, drawn by the server as a 512 by 512 PNG. The founder wallet may upload its own logo instead (the browser squares it to a 512 px PNG; the server refuses it from anyone else).
- **Fees:** no platform fee on the launch. Trading creator fees are split 95% to the launcher and 5% to `PLATFORM_WALLET`, set up by the launcher's wallet after the launch. The launcher has to approve that step, so the 5% is a request the page makes, not something the server can force.
- Starts on **devnet**. Set `CLUSTER=mainnet` only when you are ready for real SOL.

## Run

```
npm install
npm run build  # bundles the pump.fun launch code to dist/launch.js
npm start      # http://localhost:3000
npm test
```

Needs Node 20 or newer. The server itself uses no packages; only the browser launch bundle needs `npm install`.

## Settings (environment variables)

| Variable | Purpose |
| --- | --- |
| `CLUSTER` | `devnet` (default) or `mainnet`. Each keeps its own set of claimed characters. |
| `RPC_URL` | Your private **mainnet** RPC URL (for example Helius). Used only when `CLUSTER=mainnet`. A Helius URL also gives full holder counts. |
| `DEVNET_RPC_URL` | Optional private devnet endpoint. Devnet never reads from `RPC_URL`. |
| `PLATFORM_WALLET` | Receives 5% of each coin's creator fees. If unset, there is no split. |
| `FOUNDER_WALLET` | The one wallet that may launch the flagship. |
| `SLOTS` | How many pets exist, 1 to 100. Default 8. If you set this in Railway earlier, it overrides the default. |
| `PUBLIC_URL` | This service's domain, used in each coin's metadata and logo links. Set it before any mainnet launch: those links are permanent. |
| `IMAGE_SECRET` | Optional. Decides how each agent looks and is named. If unset, one is created in the data folder. |
| `BLOCKED_WORDS` | Optional, comma separated. Extra words refused in names, tickers and descriptions. |
| `CHARITY_DOG_WALLET`, `CHARITY_DOG_NAME`, `CHARITY_DOG_URL` | Optional. A real donation wallet for a dog charity, its name, and its https link. Launchers who get a dog can send 10, 25 or 50% of their creator fees to it. Not offered unless the wallet and name are both set. |
| `CHARITY_CAT_WALLET`, `CHARITY_CAT_NAME`, `CHARITY_CAT_URL` | The same for cats. |
| `ADMIN_TOKEN` | Password for `/admin`, where you can see every agent, free a locked one or attach a coin to one. Off while unset. |
| `DATA_DIR` | Where agent state, logos and metadata are stored. Defaults to `/data` if it exists. Attach a Railway volume at `/data`: a coin's logo link points here. |

## Animal charity share

The launcher can choose to send 10, 25 or 50% of the coin's creator fees to an animal charity chosen by the pet they get (a dog rescue for dogs, a cat rescue for cats). It is one more shareholder in the same on-chain fee split the launcher already approves in their wallet, so pump.fun pays it straight to the charity wallet and PetPaws never holds the money. The coin page shows the signed share.

Before you turn it on:
- Use a wallet the charity itself confirms accepts crypto donations (many charities publish one, or use a donation service such as The Giving Block or Endaoment). Do not guess an address: fees sent to a wrong address are gone.
- Do not describe it as an official partnership unless the charity agreed to it, and keep the charity's name and link accurate.
- Fundraising for charity can have legal rules in your area. Get advice before you promote it.
- The share is a promise the launcher signs, not something the server can force. The coin page only shows it when the launch recorded a signed split.

## Deploy on Railway

1. Add a service from this repo with no Root Directory, and attach a volume mounted at `/data`.
2. Set `PUBLIC_URL`, `PLATFORM_WALLET`, `FOUNDER_WALLET` and (for mainnet) `RPC_URL`. Add this service's own domain.
3. Test on devnet first, which is the default.

## Limits to know

- Anyone can launch, so names and tickers go through a basic word filter only. PetPaws does not vouch for any coin.
- The agents report; they do not act. A coin's agent has no promised value and says nothing about where the price is going.
- The 5% fee split depends on the launcher signing it.
- A hold lasts 15 minutes. If a launch lands but the page closes before the agent is locked, it frees up when the hold expires (or you can attach it from `/admin`).
- Back up the data folder. It holds which agent belongs to which coin.

## Quote pairs (optional, off by default)

Pairs are **off by default**. On a mainnet server, turn them on or off from `/admin` (the Quote pairs panel; saved in `DATA_DIR/settings.json`). `ENABLE_PAIRS=1` only sets the starting value before anything is saved. When on, the launch form gets a **Pair with** menu, filled from the quote coins the pump program lists (tokenized stocks and other listed coins). Leave it on SOL for a normal launch.

A paired launch is create-only for now: no first buy and no creator fee split, so all creator fees go to the launcher's wallet and are paid in the quote coin. Pump coins whose quote sits on a deeper chain are refused. This path is untested on-chain: try one small mainnet launch before relying on it. The coin page notes that SOL figures do not apply to a paired coin.

- **The yard:** the home page has an interactive shelter yard (`galaxy.js`): every launched coin is a pet riding along its own path with its ticker; hover to slow and read a card, click to open the coin. The flagship card now only shows for the founder wallet.
- **Rides:** the launch form has a ride picker (`ships.js`: Red Wagon, Rescue Van, Cardboard Box, Snow Sled, Shelter Bus, Balloon Basket, all drawn in code) with ride, trim and collar colours and an optional name tag. The choice is stored with the launch (`ship`), shown on the coin page, and plays a short adoption-day scene after a launch. A custom coin logo shows as an emblem on the ride.
- **Coin page:** an adoption journey (how far the coin has travelled along its bonding curve, from Intake to Forever home) and a downloadable adoption certificate with the pet, ride, ticker, name tag and charity.
