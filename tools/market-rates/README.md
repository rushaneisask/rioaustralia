# Market rate finder

Finds **publicly listed** commercial cleaning prices around south-east Melbourne and the Mornington Peninsula, plus the Fair Work Cleaning Services Award minimum (the cost floor). It writes a benchmark report to `research/`. That folder is git-ignored, so competitor pricing stays private.

It only reads public web pages. It never contacts businesses, fills in forms or asks for quotes.

## How it works
1. **Research:** Claude (`claude-opus-5-5`) uses Anthropic's server-side web search and page reading (at most 30 of each per run) to find pages that publish prices, then writes up each price with its source.
2. **Extract and verify:** a second call converts that write-up into a strict table. Any price whose link wasn't among the pages actually retrieved is dropped.
3. **Summary:** low / 25% / median / 75% / high by service and pricing basis, converted to ex-GST.

If a safety check ever declines a request, the API automatically retries on a fallback model (`server-side-fallback`, `fallbacks: "default"`).

## Run it
1. Create an API key at console.anthropic.com (add a payment method first), then save it on this PC by running in PowerShell:
   ```powershell
   [Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'PASTE_KEY_HERE', 'User')
   ```
   Open a new terminal afterwards. Never commit the key or paste it into chat.
2. From the project folder:
   ```powershell
   npm run research:rates
   ```
3. Open `research/market-rates-<date>.md`.

At the end, each run prints its searches, page reads and token cost. Run it monthly or quarterly. Prices don't move fast.

## Pricing formula
`src/lib/pricing/estimate.ts` turns site details into a price range. It runs on **placeholder rates** (`confirmedByOwner: false`) until the owner supplies real ones. Check it with `npm run test:pricing`.
