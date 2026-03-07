# What Philip and Mike Need to Decide, Discuss, and Learn

**Date:** March 3, 2026
**Context:** This document captures the open decisions, conversations, and feedback loops that need to happen between Philip and Mike — and with their early investors. It references `FOUNDING_ARCHITECTURE.md` sections where applicable.

This isn't exhaustive. It's the stuff that's top-of-mind after deeply reviewing the founding architecture and planning the next few phases.

---

## DECISIONS NEEDED BEFORE ALPHA LAUNCH (This Week)

**Which 1-2 investors see it first?**
Mike should pick the investors who will give the most honest, useful feedback — not the most polite ones. Ideally one experienced investor (someone like Dan Drake who's done 100+ deals) and one less experienced investor who'll stumble over things the experienced one won't notice. Philip and Mike should align on who these are before Friday.

**What does the onboarding Zoom call look like?**
Philip will be filling out the onboarding form during the call. He and Mike need to do a dry run together first — Mike plays the investor, Philip fills out the form. This will surface questions like: is the form order natural for a conversation? Are there fields that feel awkward to ask about? Does the dream property free-text field make sense when spoken aloud vs. typed? Reference `FOUNDING_ARCHITECTURE.md` Section 10 for the full interview question list.

**Deal Room branding for Mike's group.**
Open question #9 in the architecture doc: is it "Mike King Investment Group" or "Foreclosure Funder powered by Mike King"? This matters for alpha because investors will see the brand. Mike's instinct on this is probably right — he knows what his investors would trust more.

---

## CONVERSATIONS TO HAVE WITH EACH OTHER

**How are you splitting the investor relationship during alpha?**
The architecture doc says Mike handles all investor relationships and sales, Philip handles product and tech. But during alpha, Philip is the one conducting onboarding calls and filling out forms. Where's the handoff point? When does Mike take over a conversation? This needs to be explicit so investors don't get bounced between two people or feel like nobody's in charge.

**What does "good enough for alpha" mean?**
Not every feature needs to be perfect. Philip and Mike should agree on what's a blocker vs. what's a known rough edge they'll apologize for. For example: if the admin panel works but is ugly, is that okay for alpha? If court research is empty for all properties, do they explain that's coming or does it look like a broken feature? Having this conversation prevents the "should we delay launch?" spiral on Thursday night.

**Scraper scheduling and maintenance.**
`FOUNDING_ARCHITECTURE.md` Section 13 says the scraper runs Wednesdays at 9am, but the scraper currently writes to Google Sheets only. Before alpha, decide: is it okay for properties to come from the manual Supabase seed for the first week? Or does Mike need fresh data flowing? This affects whether the scraper Supabase integration gets fast-tracked.

**Pricing gut check.**
The architecture doc (Section 6) has Standard at $19-29/month and Premium at $39-49/month. Competitors charge $97-197/month. Philip and Mike should talk through whether their pricing feels right or is leaving money on the table. Neither needs to decide now, but the conversation should happen before anyone asks "how much does this cost?"

---

## FEEDBACK TO GATHER FROM EACH INVESTOR PROFILE

### From the Cash-Ready Auction Investor (Primary Persona — e.g., Dan Drake type)

These are investors who attend foreclosures regularly and make fast decisions. They're the product's bread and butter.

**What to watch for during their first session:**
- Do they immediately understand the dashboard, or do they ask "where do I..."?
- How quickly can they find a specific property by address or case number?
- Do they try to save a property to their pipeline? Does the interaction feel natural?
- When they look at a property detail page, do they get the information they need to decide whether to research further?

**Questions to ask:**
- "What information do you look at first when evaluating a foreclosure?" — compare their answer to what the property card shows most prominently.
- "Is anything missing from this property page that you'd normally want to see?" — court research won't be there yet; note what else they mention.
- "How does this compare to how you currently track properties?" — understand what they're replacing (spreadsheet, memory, notes app).
- "If the court research section showed liens, judgments, and title health for every property, would that change how you use this?" — this validates the Phase 2b investment before building it.

**What their feedback tells you:**
This persona validates whether the core product loop works: see property → evaluate quickly → save or skip. If they struggle with this basic flow, that's a fundamental UX problem. If they breeze through it but say "I wish it had X," that's a feature backlog item.

### From the Newer/Aspiring Investor (Tertiary Persona)

These investors don't have Mike's network or Dan's experience. They're figuring things out.

**What to watch for:**
- Do they understand what the pipeline stages mean? "Watching" vs. "Researching" may not be obvious.
- Do they understand what county appraisal means vs. foreclosure amount?
- Do they feel overwhelmed by the amount of data, or do they want more?

**Questions to ask:**
- "What would help you feel confident enough to go to an auction for the first time?" — this reveals what educational content or guided flows they'd need.
- "Is there anything on this page you don't understand?" — said without judgment. This persona surfaces where the product assumes too much knowledge.
- "If you could describe your perfect property to us and we showed you matches, would that be valuable?" — validates the recommendation engine before building it.

**What their feedback tells you:**
This persona validates whether the product can grow beyond Mike's existing network. If new investors can't use it without hand-holding, the self-service onboarding and the free tier won't convert. Their confusion points become the onboarding flow's priority list.

### From Mike (The Admin / Deal Room Owner)

Mike is simultaneously a co-founder, the first admin user, and the product's biggest skeptic (in the best way).

**What to watch for:**
- Does the admin panel give Mike what he needs to manage his investors, or is he still keeping a spreadsheet on the side?
- Can he see which investors are looking at which properties? Can he tell who's active vs. dormant?
- When he adds group notes to a property, does the flow make sense?

**Questions to ask (Philip should ask Mike these explicitly):**
- "If I handed you this tool and walked away for a week, what would you still need that isn't here?"
- "When you're preparing for your weekly investor calls, what information do you pull up? Can you find all of it here?"
- "Is there anything in the admin panel that you'd rearrange or remove?"
- "What data do you currently keep in your head that should be in the system?" — this surfaces fields and views that aren't in the spec yet.

**What his feedback tells you:**
Mike's feedback is the single most important input at alpha. He's the power user, the sales channel, and the person who knows what investors actually ask for. If Mike doesn't want to use the admin panel, no other agent will either. His workarounds (things he does outside the product) are the product's feature roadmap.

---

## THINGS TO BE THINKING ABOUT (Not Urgent, But Important)

**The note-to-tag system.**
How do you turn an investor's free-form note ("nice house but worried about the lien from the roofing company") into structured tags ("concerned about liens," "interested in property condition")? Options range from manual tagging (Mike tags things himself) to AI extraction (Claude reads notes and suggests tags). Philip and Mike should brainstorm what tags would actually be useful before building the extraction system.

**Recommendation engine philosophy.**
The architecture doc describes 7 weighted factors. But the real question is: what does a "good recommendation" look like to Dan Drake vs. a first-time investor? Philip and Mike should collect 5-10 examples of "I would have loved to see this property recommended to me" and "I would NOT have wanted to see this one" from real investor conversations. Those examples will be more valuable than any factor weighting model.

**When does the product outgrow Wichita?**
Butler County is the obvious next market (Section 16 of the architecture doc). But the trigger for expansion should be product-market fit in Sedgwick County, not a timeline. Philip and Mike should define what "product-market fit" looks like concretely: is it 10 paying users? 20? Is it Dan Drake saying "I can't imagine going back to how I did it before"?

**What's the referral code incentive?**
Phase 4 includes a referral code system, but the incentive hasn't been designed. What does the referrer get? Free month? Cash? What does the new user get? Philip and Mike should ask their first investors "what would make you tell another investor about this?" during alpha conversations.

**Who handles what when Philip's not available?**
Right now Philip is the sole technical operator. If he's asleep, sick, or heads-down on a Claude Code session, who handles investor questions? Mike needs to know what he can answer himself, what needs to wait for Philip, and how to triage urgent issues (e.g., "I can't log in" vs. "I wish the pipeline had X feature").

---

*This document should be updated as decisions get made. When something is decided, move it to the "Decided" section (create one when needed) with the date and the decision.*
