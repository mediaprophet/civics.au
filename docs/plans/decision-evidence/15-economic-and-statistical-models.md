# Economic and statistical model suite

The first executable model is [community-grounds-economic-statistical-v1](../../../data/evaluation-models/model-registry.json). Its case template is [community-grounds-case-template.json](../../../data/evaluation-models/community-grounds-case-template.json) and its reference implementation is [economic-statistical-models.mjs](../../../scripts/economic-statistical-models.mjs).

It evaluates each alternative through three independent ledgers: operator finance, government fiscal effects and social-economic resource value. It calculates discounted present values, NPV and BCR only when a ledger is complete; transfers are retained for reconciliation and cannot enter social-economic NPV. It also produces descriptive statistics and an ordinary-least-squares time trend for supplied outcome series.

The template intentionally contains `null` values. This is the correct starting state: a calculation remains `incomplete` until an admitted quote, budget, utilisation series or resource-cost estimate replaces it. The runner does not manufacture benefits, recommend an option or monetise participant-defined outcomes.

Run a reviewed case package with:

```powershell
node scripts/economic-statistical-models.mjs path\to\case.json path\to\result.json
```

The reference runner generates a hashed receipt, while marking itself `civics-reference-js`. Once the matching QualiaDB receipted calculation path is bound, a run may add the Qualia engine/version/artifact receipt; it must not replace the source and model-package hashes.

Initial next model modules are: occupancy and service-capacity forecasting; energy interval-load and storage reliability; housing/support cost-consequence; local digital-commerce unit economics; and contribution/RD&D cost and benefit-sharing accounting. They will reuse the same case, provenance, ledger and receipt boundaries.
