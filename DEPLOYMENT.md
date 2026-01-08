# Braincloud Project Deployment Configuration

**production Deployment ID:**
`AKfycbw0Z_hAvk8N27w4SUNiRiisKplikxiVvntTDbBTmllC4uzT3rHp2QMwkMvpAVKS4yQWyA`

**Current URL:**
`https://script.google.com/macros/s/AKfycbw0Z_hAvk8N27w4SUNiRiisKplikxiVvntTDbBTmllC4uzT3rHp2QMwkMvpAVKS4yQWyA/exec`

## How to Deploy (STRICTLY FOLLOW THIS)
To keep the URL constant, **ALWAYS** deploy using the deployment ID flag `-i`:

```bash
cd line
clasp deploy -i AKfycbw0Z_hAvk8N27w4SUNiRiisKplikxiVvntTDbBTmllC4uzT3rHp2QMwkMvpAVKS4yQWyA -d "Your Commit Message"
```

**DO NOT** run `clasp deploy` without the `-i` flag, or it will generate a new URL and break the frontend.
