/** Site-wide constants: the name, the inbox, and the link to the other half. */
export const SITE_NAME = "Hyperadapted";

export const EMAIL = "hilgemann.julian@gmail.com";

/**
 * julianhilgemann.com is the other half of the pair: the same pipeline run
 * forwards, from signal to number. Links to it carry utm parameters, so its
 * analytics can tell which placement on this site sent the visit.
 */
export const mainSite = (placement: string) =>
    `https://julianhilgemann.com/?utm_source=hyperadapted&utm_medium=referral&utm_campaign=hyperadapted-site&utm_content=${placement}`;
