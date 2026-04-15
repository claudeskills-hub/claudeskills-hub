# Skill Submission: esimaccess-api

## Skill Name
esimaccess-api

## Short Description
Manage eSIM Access API operations — orders, top-ups, status, usage, webhooks, and more.

## Long Description
A cross-agent AI skill for the full eSIM Access API lifecycle. 17 operations covering balance checks, package listing, order creation, eSIM status monitoring, top-ups, cancellations, profile management (suspend/unsuspend/revoke), webhook configuration, SMS, and a composite refund-and-reissue workflow. Includes Node.js and Python authentication examples, full API reference documentation, and a 15-test end-to-end test suite.

## Use Cases
1. **eSIM resellers** managing inventory — check balance, list packages by country, create orders, and monitor provisioning status through their AI coding assistant.
2. **Support teams** troubleshooting customer issues — look up eSIM status by ICCID, check data usage, cancel unused eSIMs with automatic refund verification.
3. **Developers integrating the eSIM Access API** — use the skill as a reference for authentication (HMAC-SHA256), endpoint formats, status state machines, webhook types, and error codes.

## Installation
```bash
npx skills add esimaccess/esimaccess-api
```

## Examples

### Check account balance
> "Check my eSIM Access balance"

### List packages for a country
> "What eSIM packages are available for Japan?"

### Order and track an eSIM
> "Order a 5GB US data plan, then check the order status"

## Category
API Integration

## Tags
api, telecom, esim, connectivity, iot

## GitHub Repository
https://github.com/esimaccess/esimaccess-api

## Landing Page
https://app.esimaccess.com/public/skill/

## Contact
GitHub: @jetogoBryan
