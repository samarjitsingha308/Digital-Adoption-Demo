# Digital Adoption Demo (DAP)

Polished demo of a **Digital Adoption Platform** (DAP) inside a SaaS-style UI:

- **Interactive walkthroughs**: dimmed background + highlighted target + step card
- **Controls**: Next / Previous / Skip, plus **Step X of Y** progress
- **Manual start**: “Start walkthrough” button
- **Graceful missing targets**: demo tour that intentionally points to a missing element
- **Contextual help**: config-driven (?) icons that open a popover with **Show me how** (starts a walkthrough) + **Read more**

## Run locally

```bash
cd dap-demo
npm install
npm run dev
```

## If you’re in a remote workspace / container

Your laptop’s `localhost` is **not** the remote machine’s `localhost`.

- Use your editor’s **Ports/Forwarding** UI to forward **5173**, then open the **forwarded URL**.
- Or use SSH forwarding:

```bash
ssh -L 5173:localhost:5173 <your-remote>
```

## Where to edit

- **DAP config (JSON)**: `dap-demo/src/dap/content.json`
- **Walkthrough overlay**: `dap-demo/src/dap/walkthrough/WalkthroughOverlay.tsx`
- **Contextual help popover**: `dap-demo/src/dap/help/HelpIcon.tsx`
- **Demo UI surface / tour targets**: `dap-demo/src/App.tsx`