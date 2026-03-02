# Bakeoff Push Instructions

## The Repo
All bakeoff entries go to: **https://github.com/kingconnect11/foreclosure-funder**

## How to add a new bakeoff entry

### 1. Create a branch from main
```bash
git checkout main
git pull origin main
git checkout -b feat/frontend-bakeoff-<model-name>
```

### 2. Do your work, commit
```bash
git add .
git commit -m "feat: <model-name> bakeoff entry"
```

### 3. Push to foreclosure-funder
```bash
git push -u origin feat/frontend-bakeoff-<model-name>
```

### 4. Create a PR
```bash
gh pr create --base main --title "Bakeoff Entry: <Model Name>" --body "Description of approach"
```

## Existing entries
| PR | Branch | Model |
|----|--------|-------|
| #1 | feature/frontend-implementation | Claude Code |
| #2 | feat/frontend-bakeoff-gpt53 | GPT |
| #3 | feature/frontend-design-competition-winner | Claude + Framer Motion |

## DO NOT push to FounderFunder
That repo was created by accident. All work goes to `foreclosure-funder`.
