# RepRally Onboarding Flow

A simple onboarding form for store owners that shows them local market data. Built with Next.js, React, TypeScript, Supabase, and PostHog analytics.

## What This Does

Store owners fill out a 2-step form about their business. When they're done, they see insights about their local market:
- How many competitors are nearby
- What products are trending in their area
- How their store compares to others
- Which stores are closest to them
- Regional market star insights

## Approach

**Step 1: Basic Info**
- Store name, address, type, hours, email/phone
- Address autocomplete using Google Maps (so they don't have to type the full address)
- Shows errors if they miss required fields

**Step 2: Business Questions**
- What's selling well in their store
- What new products they want to carry
- When to contact them and how (email, phone, text)

**Success Page: Market Data**
- Shows nearby stores on a map
- Displays trending products (like Prime drinks, Ghost energy drinks)
- Compares their area's ratings to the state average
- Lists the 5 closest competitors

### Tech Stack

- **Next.js 14**
- **TypeScript**
- **Supabase**
- **Google Places API**
- **PostHog**
- **Shadcn with Tailwind**

## Analytics

### Events I Track

I track 12 different actions users take:

**Main Flow:**
- User lands on Step 1
- User selects an address from autocomplete
- User tries to submit Step 1 but has errors (I track which fields failed)
- User completes Step 1
- User lands on Step 2
- User tries to submit Step 2 but has errors
- User completes Step 2
- User finishes the whole form
- User sees the success page
- Insights load successfully

**Error Tracking:**
- Database save fails
- Form submission fails

### What I Measure

| What I'm Measuring | Goal | Why It Matters |
|-------------------|------|----------------|
| **Overall completion rate** | >60% | How many people finish the whole form |
| **Step 1 completion** | >75% | Is Step 1 too hard? |
| **Step 2 completion** | >85% | Do people give up at the end? |
| **Address autocomplete usage** | >90% | Is Google Places working? |
| **Form errors** | <20% | Are the forms confusing? |
| **Insights loading** | >95% | Is the API working? |

### Setting Up PostHog Dashboards

**Create a funnel to see drop-offs:**
1. Go to PostHog → Insights → New Funnel
2. Add these steps in order:
   - `onboarding_step1_viewed`
   - `onboarding_step1_completed`
   - `onboarding_step2_viewed`
   - `onboarding_step2_completed`
   - `onboarding_completed`
3. Set time window to 30 minutes
4. Save it

**See which form fields cause problems:**
1. Go to Insights → New Trend
2. Add events: `onboarding_step1_validation_failed` and `onboarding_step2_validation_failed`
3. Break down by: `error_fields`
4. This shows which fields users struggle with most

**Watch users in action:**
1. Enable Session Replay in PostHog
2. Filter sessions that dropped off
3. Watch recordings to see where they got stuck

## Future Improvements

### Find the Problems

**If lots of people quit after Step 1:**
- Add a progress bar ("Step 1 of 2") so they know it's quick
- Make phone OR email optional (not both required)
- Add a "Save and finish later" button
- Make error messages clearer

**If people aren't using address autocomplete:**
- Add a "Can't find your address?" button for manual entry
- Show a loading spinner while searching
- Try a different address service if Google isn't working well

**If people get lots of form errors:**
- Show errors as they type (not just when they submit)
- Add examples in the placeholder text ("e.g., 9am-10pm")
- Add help tooltips next to confusing fields
- Make the form simpler

### Iterate based on data

**Look at which fields cause the most errors:**

If phone number errors are common:
- Show an example: "(555) 123-4567"
- Auto-format as they type
- Or just make it optional

If hours field is confusing:
- Add a dropdown with common options
- Add a "24/7" quick button
- Allow "Call for hours"

**Look at how long people spend on each step:**

If Step 1 takes more than 3 minutes:
- Too many fields or too confusing
- Remove non-essential fields
- Add better instructions

If Step 2 takes less than 30 seconds:
- People are rushing through
- They might not understand why we're asking
- Add text explaining how we'll use their answers

**Look at the success page:**

If people don't scroll down to see insights:
- Put the best insights at the top
- Make them more visual (bigger numbers, charts)
- Remove less important info

If insights take more than 2 seconds to load:
- Add caching so it loads faster
- Optimize the database query
- Show a loading animation so they know it's working

### Test Different Versions

**Test 1: One page vs. two pages**
- Version A: Current 2-step form
- Version B: Everything on one page
- See which gets more completions

**Test 2: Different headlines**
- Version A: "See local market insights"
- Version B: "See what's trending in your area"
- Version C: "Find out what your competitors are selling"
- See which gets more clicks

**Test 3: Add trust signals**
- Version A: No extra text
- Version B: "Join 500+ NJ store owners"
- Version C: Show a testimonial
- See which makes people more likely to complete

**Test 4: Different ways to show insights**
- Version A: Current card layout
- Version B: Map first, then details
- Version C: Personalized recommendations
- See which keeps people engaged longer

### Advanced Improvements

**Engagement**
- Email them weekly with new trends
- Alert them when a new competitor opens nearby
- Send monthly reports

**Conversions:**
- Add a "Schedule a call with our team" button on the success page
- Show a popup if they try to leave ("Wait! See your insights first")
- Send emails to people who didn't finish

**Performance**
- Cache the insights data so it loads instantly
- Speed up the database queries

### Long-term Success Metrics

- **Do they buy?** Track how many people who complete onboarding become active, successful customers
- **How fast do they get value?** Measure time from signup to seeing results
- **Do they come back?** See if users return to check updated insights
- **Does sales team close them?** Track conversion from onboarding to paying customer
- **Is the data good?** Check how many submissions are complete and accurate

## Running This Locally

### What You Need
- Node.js 18 or newer
- A Supabase account (free tier is fine)
- A Google Maps API key
- A PostHog account (free tier is fine)

### Setup Steps

```bash
# 1. Download the code
git clone https://github.com/wju99/reprally-onboarding.git
cd reprally-onboarding

# 2. Install dependencies
npm install

# 3. Create a .env.local file with your API keys
# (see below for what to put in it)

# 4. Run the app
npm run dev

# 5. Open http://localhost:3000 in your browser
```

### API Keys You Need

Create a file called `.env.local` in the main folder and add:

```bash
# Supabase (database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps (address autocomplete)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Folder Structure

```
reprally/
├── app/
│   ├── actions/              # Functions that save form data
│   ├── api/insights/         # API that calculates market insights
│   ├── onboarding/           # The onboarding pages
│   └── ingest/               # Routes that send data to PostHog
├── components/
│   ├── onboarding/           # Step 1 and Step 2 form components
│   └── providers/            # PostHog setup
├── lib/
│   ├── hooks/                # Google Places autocomplete code
│   ├── insights/             # Code that calculates insights
│   └── supabase.ts           # Database connection
└── supabase/
    └── migrations/           # Database table setup
```

## Questions?

Contact: willju88@gmail.com

---
