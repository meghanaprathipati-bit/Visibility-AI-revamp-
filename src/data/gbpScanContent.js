/** GBP audit prototype copy — replace with API response in production */

export const GBP_SCAN_CONTEXT = {
  projectName: 'Ethnic Premium Salon',
  businessName: 'Ethnic Premium Salon — ADCS Layout',
  location: 'Bengaluru, Karnataka, India',
  gbpUrl: 'https://maps.google.com/?cid=123456789',
}

/** Shown above progress steps while the GBP audit runs */
export const GBP_SCAN_LOADER_INTRO = `Running GBP audit for ${GBP_SCAN_CONTEXT.businessName}. This usually takes 1-3 minutes.`

/** Acknowledgment shown after the loader completes — plain text above the summary card */
export const GBP_SCAN_ACKNOWLEDGMENT = {
  headline: `Great, I found your Google Business Profile for ${GBP_SCAN_CONTEXT.businessName}.`,
  intro:
    'I audited your local presence across Google Business Profile, directory listings, and content signals. Here is what I found:',
  business: GBP_SCAN_CONTEXT.businessName,
  location: GBP_SCAN_CONTEXT.location,
}

export const GBP_SCAN_SUMMARY = {
  title: 'Local SEO audit shows critical gaps in profile, listings, and content',
  channelsAnalyzed: 'Google Business Profile, Listings, Content',
  opportunityScope:
    'Several quick fixes to your profile, directory presence, and posting cadence can significantly improve local pack visibility.',
  categories: [
    {
      name: 'Google Business Profile',
      status: 'Needs attention',
      description: 'Profile is 55% complete with category mismatch and missing business hours.',
      checks: [{ label: 'Profile audit' }, { label: 'NAP consistency' }],
    },
    {
      name: 'Listings',
      status: 'Needs attention',
      description: 'Name inconsistent across 4 directories; missing from Apple Maps and Bing Places.',
      checks: [{ label: 'Directory scan' }, { label: 'Listing sync' }],
    },
    {
      name: 'Content',
      status: 'Needs attention',
      description: 'No GBP posts published in 60+ days — content freshness signal is weak.',
      checks: [{ label: 'Post cadence' }, { label: 'Q&A activity' }],
    },
  ],
}
